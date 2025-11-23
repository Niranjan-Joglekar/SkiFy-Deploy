from fastapi import FastAPI
from routers import test, resume_analysis, report
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # <--- Change this to "*" for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(test.router, prefix="/test")
app.include_router(resume_analysis.router, prefix="/resume")
app.include_router(report.router, prefix="/report")


handler = app
