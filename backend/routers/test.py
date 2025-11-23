from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import generate_question, adjust_difficulty, calculate_final_score
from typing import Optional

router = APIRouter()

test_state = {
    "topic": "",
    "current_level": 3,
    "window": [],
    "question_number": 1,
    "total_questions": 11,
    "all_questions": [],
    "current_question_data": {}
}

# Keep the robust Input Model (So it accepts what Frontend sends)
class AnswerInput(BaseModel):
    user_answer: Optional[int] = None
    time_taken: float
    question: Optional[str] = None
    correct_option: Optional[int] = None
    expected_time: Optional[float] = None
    level: Optional[int] = None

def get_next_question():
    # --- ORIGINAL LOGIC PRESERVED ---
    # Default to 3 for first 3 questions, then use calculated level
    level = 3 if test_state["question_number"] <= 3 else test_state["current_level"]
    
    # PASS THE HISTORY HERE
    previous_qs = test_state.get("all_questions", [])
    
    full_question = generate_question(test_state["topic"], level, previous_questions=previous_qs)

    # Store logic internally
    test_state["current_question_data"] = {
        "question": full_question["question"],
        "correct_option": int(full_question["correct_option"]),
        "expected_time": full_question.get("expected_time_sec", 30),
        "difficulty": level
    }

    return {
        "question_number": test_state["question_number"],
        "question": full_question["question"],
        "options": full_question["options"],
        "expected_time_sec": full_question.get("expected_time_sec", 30),
        # No need to send 'level' to frontend anymore, keeping it simple
    }

@router.get("/start/{topic}")
def start_test(topic: str):
    test_state.update({
        "topic": topic,
        "current_level": 3,
        "window": [],
        "question_number": 1,
        "all_questions": [],
        "current_question_data": {}
    })
    return get_next_question()

@router.post("/answer")
def submit_answer(answer: AnswerInput):
    # --- RESTORED LOGIC PRIORITY ---
    
    # 1. Look at Backend Memory FIRST (This preserves your Sliding Window logic)
    current_q_state = test_state.get("current_question_data", {})
    
    q_text = current_q_state.get("question")
    correct_opt = current_q_state.get("correct_option")
    exp_time = current_q_state.get("expected_time")
    difficulty = current_q_state.get("difficulty")

    # 2. FAILSAFE: Only if Backend Memory is empty (Crash/Restart), use Frontend data
    if q_text is None:
        q_text = answer.question
        correct_opt = answer.correct_option
        exp_time = answer.expected_time
        difficulty = answer.level # Falls back to 3, which is safe

    # 3. Calculate Correctness
    correct = False
    if answer.user_answer is not None and correct_opt is not None:
        correct = int(answer.user_answer) == int(correct_opt)

    question_data = {
        "question_number": test_state["question_number"],
        "question": q_text,
        "correct": correct,
        "time_taken": answer.time_taken,
        "expected_time": exp_time if exp_time else 30,
        "difficulty": difficulty if difficulty else 3
    }

    # Update history and Sliding Window
    test_state["all_questions"].append(question_data)
    test_state["window"].append(question_data)

    if len(test_state["window"]) > 3:
        test_state["window"].pop(0)

    # Update Level (Adaptive Logic)
    if len(test_state["window"]) == 3:
        test_state["current_level"] = adjust_difficulty(
            test_state["current_level"], test_state["window"]
        )

    test_state["question_number"] += 1

    if test_state["question_number"] >= test_state["total_questions"]:
        final_score = calculate_final_score(test_state["all_questions"])
        return {
            "message": "Test completed",
            "final_score": final_score,
            "results": test_state["all_questions"]
        }

    return {
        "correct": correct,
        "next_question_number": test_state["question_number"],
        "next_question": get_next_question(),
        "current_level": test_state["current_level"]
    }

# (Keep get_score and get_summary same as before)
@router.get("/score")
def get_score():
    return {
        "total_answered": len(test_state["all_questions"]),
        "questions": test_state["all_questions"]
    }
    
@router.get("/summary")
def get_summary():
    correct = sum(1 for q in test_state["all_questions"] if q["correct"])
    incorrect = len(test_state["all_questions"]) - correct
    total = len(test_state["all_questions"])
    accuracy = (correct / total) * 100 if total > 0 else 0

    return {
        "correctAnswers": correct,
        "incorrectAnswers": incorrect,
        "totalQuestions": total,
        "accuracy": accuracy,
        "finalScore": calculate_final_score(test_state["all_questions"]),
        "questions": test_state["all_questions"]
    }