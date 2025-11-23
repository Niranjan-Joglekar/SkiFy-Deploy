from fastapi import FastAPI
from routers import test, resume_analysis, report, user
from fastapi.middleware.cors import CORSMiddleware
from services.rag_service import initialize_rag  # <--- Import

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now (update to specific URL for prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Startup Event to Load RAG ---
@app.on_event("startup")
async def startup_event():
    initialize_rag()
# ---------------------------------

app.include_router(test.router, prefix="/test")
app.include_router(resume_analysis.router, prefix="/resume")
app.include_router(report.router, prefix="/report")
app.include_router(user.router, prefix="/user")

handler = app