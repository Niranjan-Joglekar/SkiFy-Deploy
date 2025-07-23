from pydantic import BaseModel
from typing import List

class QuestionInput(BaseModel):
    topic: str
    prev_questions: List[dict]
