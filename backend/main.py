from fastapi import FastAPI
from routers import test_eg

app = FastAPI()

app.include_router(test_eg.router, prefix="/test_eg")
