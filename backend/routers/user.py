from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register(user: dict):
    return {"message": "User registered"}
