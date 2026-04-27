from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api import auth, candidates, companies, jobs, tests, scoring
from app.core.config import settings

app = FastAPI(title="Jobify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static assets
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])

@app.get("/")
def root():
    return {"message": "Jobify API is running"}
