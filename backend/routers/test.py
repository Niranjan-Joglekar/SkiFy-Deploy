from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import generate_question, adjust_difficulty, calculate_final_score

router = APIRouter()

test_state = {
    "topic": "",
    "current_level": 3,
    "window": [],
    "question_number": 1,
    "total_questions": 10,
    "all_questions": [],
    "current_question_data": {}
}

class AnswerInput(BaseModel):
    user_answer: int
    time_taken: float

def get_next_question():
    level = 3 if test_state["question_number"] <= 3 else test_state["current_level"]
    
    full_question = generate_question(test_state["topic"], level)

    # Store correct answer internally
    test_state["current_question_data"] = {
        "question": full_question["question"],
        "correct_option": int(full_question["correct_option"]),
        "expected_time": full_question.get("expected_time_sec", 30),
        "difficulty": level
    }

    # Return only safe data to frontend
    return {
        "question_number": test_state["question_number"],
        "question": full_question["question"],
        "options": full_question["options"],
        "expected_time_sec": full_question.get("expected_time_sec", 30),
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
    current_q = test_state["current_question_data"]

    correct = answer.user_answer == current_q["correct_option"]

    question_data = {
        "question_number": test_state["question_number"],
        "question": current_q["question"],
        "correct": correct,
        "time_taken": answer.time_taken,
        "expected_time": current_q["expected_time"],
        "difficulty": current_q["difficulty"]
    }

    # Update history and window
    test_state["all_questions"].append(question_data)
    test_state["window"].append(question_data)

    if len(test_state["window"]) > 3:
        test_state["window"].pop(0)

    if len(test_state["window"]) == 3:
        test_state["current_level"] = adjust_difficulty(
            test_state["current_level"], test_state["window"]
        )

    test_state["question_number"] += 1

    if test_state["question_number"] > test_state["total_questions"]:
        final_score = calculate_final_score(test_state["all_questions"])

        return {
            "message": "Test completed",
            "final_score": final_score, # Add the new score here
            "results": test_state["all_questions"]
        }
        

    return {
        "correct": correct,
        "next_question_number": test_state["question_number"],
        "next_question": get_next_question(),
        "current_level": test_state["current_level"]
    }
    
@router.get("/score")
def get_score():
    return {
        "total_answered": len(test_state["all_questions"]),
        "questions": test_state["all_questions"]
    }



# from fastapi import APIRouter
# from pydantic import BaseModel
# from services.gemini import generate_question, adjust_difficulty

# router = APIRouter()

# test_state = {
#     "topic": "",
#     "current_level": 3,
#     "window": [],
#     "question_number": 1,
#     "total_questions": 10,
#     "all_questions": []
# }

# class AnswerInput(BaseModel):
#     question: str
#     correct_option: int
#     user_answer: int
#     time_taken: float
#     expected_time: float
#     level: int

# def get_next_question():
#     if test_state["question_number"] <= 3:
#         level = 3
#     else:
#         level = test_state["current_level"]
    
#     return generate_question(test_state["topic"], level)

# @router.get("/start/{topic}")
# def start_test(topic: str):
#     test_state["topic"] = topic
#     test_state["current_level"] = 3
#     test_state["window"] = []
#     test_state["question_number"] = 1
#     test_state["all_questions"] = []

#     question = get_next_question()
#     return question

# @router.post("/answer")
# def submit_answer(answer: AnswerInput):
#     correct = answer.user_answer == answer.correct_option

#     question_data = {
#         "question": answer.question,
#         "correct": correct,
#         "time_taken": answer.time_taken,
#         "expected_time": answer.expected_time,
#         "difficulty": test_state["current_level"]
#     }

#     test_state["all_questions"].append(question_data)
#     test_state["window"].append(question_data)

#     if len(test_state["window"]) > 3:
#         test_state["window"].pop(0)

#     if len(test_state["window"]) == 3:
#         test_state["current_level"] = adjust_difficulty(
#             test_state["current_level"], test_state["window"]
#         )

#     test_state["question_number"] += 1

#     if test_state["question_number"] > test_state["total_questions"]:
#         return {"message": "Test completed"}

#     question = get_next_question()
#     return {
#         "correct": correct,
#         "next_question_number": test_state["question_number"],
#         "next_question": question,
#         "current_level": test_state["current_level"]
#     }