from fastapi import APIRouter
from fastapi.responses import JSONResponse
from routers.test import test_state
from routers.resume_analysis import job_state
from services.gemini import generate_holistic_report

router = APIRouter()

@router.get("/")
def generate_report():
    # if not job_state["job_description"]:
        # return JSONResponse(status_code=400, content={"error": "Job description not set. Please upload resume first."})
    # 
    try:
        report = generate_holistic_report(test_state["all_questions"], job_state["job_description"])
        return {"report": report}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
