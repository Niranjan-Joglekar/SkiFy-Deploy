from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Assuming these states are accessible as you've set them up
from routers.test import test_state
from routers.resume_analysis import job_state

# Import the necessary functions from your services
from services.gemini import generate_holistic_report, calculate_final_score

router = APIRouter()

@router.get("/")
def generate_report():
    # 1. Check if the necessary data is available
    if not job_state.get("job_description"):
        return JSONResponse(status_code=400, content={"error": "Job description not found."})
    if not test_state.get("all_questions"):
        return JSONResponse(status_code=400, content={"error": "Test results not found."})

    try:
        # 2. Perform all necessary calculations
        all_results = test_state["all_questions"]
        
        # For MasteryScore.tsx
        mastery_score = calculate_final_score(all_results)
        
        # For PerformanceChart.tsx
        correct_count = sum(1 for q in all_results if q["correct"])
        incorrect_count = len(all_results) - correct_count
        
        # For PerformanceAnalysis.tsx
        analysis_text = generate_holistic_report(
            all_results, 
            job_state["job_description"]
        )

        # 3. Structure the final response to match the frontend components
        return {
            "masteryScore": mastery_score,
            "correctAnswers": correct_count,
            "incorrectAnswers": incorrect_count,
            "totalQuestions": len(all_results),
            "analysisText": analysis_text 
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})