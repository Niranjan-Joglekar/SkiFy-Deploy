from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.gemini import generate_question, adjust_difficulty

router = APIRouter()

# Store state in memory (simulate session)
test_state = {
    "topic": "",
    "current_level": 3,
    "window": [],
    "question_number": 1,
    "total_questions": 10
}

class AnswerInput(BaseModel):
    user_answer: int
    correct_option: int
    time_taken: float
    expected_time: float

@router.get("/start/{topic}")
def start_test(topic: str):
    test_state["topic"] = topic
    test_state["current_level"] = 3
    test_state["window"] = []
    test_state["question_number"] = 1

    question = generate_question(topic, test_state["current_level"])
    return question

@router.post("/answer")
def submit_answer(answer: AnswerInput):
    response = {
        "correct": answer.user_answer == answer.correct_option,
        "time_taken": answer.time_taken,
        "expected_time": answer.expected_time,
        "difficulty": test_state["current_level"]
    }

    test_state["window"].append(response)
    if len(test_state["window"]) > 3:
        test_state["window"].pop(0)

    if len(test_state["window"]) == 3:
        test_state["current_level"] = adjust_difficulty(
            test_state["current_level"], test_state["window"])

    test_state["question_number"] += 1

    if test_state["question_number"] > test_state["total_questions"]:
        return {"message": "Test completed"}

    question = generate_question(test_state["topic"], test_state["current_level"])
    return {
        "next_question": question,
        "current_level": test_state["current_level"]
    }


# from fastapi import APIRouter
# from pydantic import BaseModel
# from typing import List
# from services.gemini import generate_question

# router = APIRouter()

# # In-memory test state (use database for real app)
# test_state = {
#     "current_level": 3,
#     "questions_answered": [],
#     "score": 0
# }

# class AnswerInput(BaseModel):
#     question: str
#     user_answer: str  # "1", "2", "3", or "4"
#     correct_option: str
#     time_taken: float

# @router.get("/start")
# def start_test(topic: str):
#     test_state["current_level"] = 3
#     test_state["questions_answered"] = []
#     test_state["score"] = 0

#     question = generate_question({topic}, test_state["current_level"])
#     return question

# @router.post("/answer")
# def submit_answer(answer: AnswerInput, topic: str):
#     is_correct = answer.user_answer.lower() == answer.correct_option.lower()

#     # Update score
#     time_bonus = get_time_bonus(answer.time_taken)
#     if is_correct:
#         test_state["score"] += test_state["current_level"] * time_bonus

#     # Save history
#     test_state["questions_answered"].append({
#         "correct": is_correct,
#         "level": test_state["current_level"],
#         "time": answer.time_taken
#     })

#     # Update level based on last 3 responses
#     if len(test_state["questions_answered"]) >= 3:
#         last_three = test_state["questions_answered"][-3:]
#         correct_count = sum(1 for q in last_three if q["correct"])
#         if correct_count >= 2:
#             test_state["current_level"] = min(5, test_state["current_level"] + 1)
#         elif correct_count == 0:
#             test_state["current_level"] = max(1, test_state["current_level"] - 1)

#     # Generate next question
#     next_question = generate_question({topic}, test_state["current_level"])

#     return {
#         "correct": is_correct,
#         "score": round(test_state["score"], 2),
#         "next_level": test_state["current_level"],
#         "next_question": next_question
#     }

# def get_time_bonus(time_taken: float):
#     if time_taken < 30:
#         return 1.2
#     elif time_taken < 60:
#         return 1.0
#     elif time_taken < 120:
#         return 0.8
#     else:
#         return 0.6



