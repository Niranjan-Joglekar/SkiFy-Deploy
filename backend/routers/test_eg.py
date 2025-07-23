from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import generate_question, adjust_difficulty

router = APIRouter()

test_state = {
    "topic": "",
    "current_level": 3,
    "window": [],
    "question_number": 1,
    "total_questions": 10,
    "all_questions": []
}

class AnswerInput(BaseModel):
    question: str
    correct_option: int
    user_answer: int
    time_taken: float
    expected_time: float
    level: int

def get_next_question():
    if test_state["question_number"] <= 3:
        level = 3
    else:
        level = test_state["current_level"]
    
    return generate_question(test_state["topic"], level)

@router.get("/start/{topic}")
def start_test(topic: str):
    test_state["topic"] = topic
    test_state["current_level"] = 3
    test_state["window"] = []
    test_state["question_number"] = 1
    test_state["all_questions"] = []

    question = get_next_question()
    return question

@router.post("/answer")
def submit_answer(answer: AnswerInput):
    correct = answer.user_answer == answer.correct_option

    question_data = {
        "question": answer.question,
        "correct": correct,
        "time_taken": answer.time_taken,
        "expected_time": answer.expected_time,
        "difficulty": test_state["current_level"]
    }

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
        return {"message": "Test completed"}

    question = get_next_question()
    return {
        "correct": correct,
        "next_question": question,
        "current_level": test_state["current_level"]
    }






# from fastapi import APIRouter
# from pydantic import BaseModel
# from typing import List
# from services.gemini import generate_question, adjust_difficulty

# router = APIRouter()

# # Store state in memory (simulate session)
# test_state = {
#     "topic": "",
#     "current_level": 3,
#     "window": [],
#     "question_number": 1,
#     "total_questions": 10,
#     "all questions": []
# }

# class AnswerInput(BaseModel):
#     question: str
#     # options: str
#     correct_option: int
#     user_answer: int
#     time_taken: float
#     expected_time: float
#     level: int

# @router.get("/start/{topic}")
# def start_test(topic: str):
#     test_state["topic"] = topic
#     test_state["current_level"] = 3
#     test_state["window"] = []
#     test_state["question_number"] = 1

#     question = generate_question(topic, test_state["current_level"])

#     return question

# @router.post("/answer")
# def submit_answer(answer: AnswerInput):
#     correct = answer.user_answer == answer.correct_option

#     question_data = {
#         "question": answer.question,
#         "options": answer.options,
#         "correctness": correct,
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
#             test_state["current_level"], test_state["window"])

#     test_state["question_number"] += 1

#     if test_state["question_number"] > test_state["total_questions"]:
#         return {"message": "Test completed"}

#     question = generate_question(test_state["topic"], test_state["current_level"])
#     return {
#         "correct": correct,
#         "next_question": question,
#         "current_level": test_state["current_level"]
# #        "window": test_state["window"] 
#     }
