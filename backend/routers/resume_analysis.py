from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
from services.resume import get_resume_analysis

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    job_description: str = Form(...),
    analysis_type: str = Form(...),
    resume_file: UploadFile = File(...)
):
    if resume_file.content_type != "application/pdf":
        return JSONResponse(status_code=400, content={"error": "Only PDF files are supported"})

    pdf_bytes = await resume_file.read()
    try:
        result = get_resume_analysis(job_description, pdf_bytes, analysis_type)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
