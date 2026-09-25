import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv('env/.env')

from backend.api.routes import router

app = FastAPI(
    title="NyayaSETU API",
    description="Backend API for NyayaSETU AI Legal Compliance Auditor",
    version="1.0.0"
)

# Configure CORS so the Next.js frontend can communicate with this backend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3080",
    "http://127.0.0.1:3080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    print("Starting NyayaSETU Backend Server on port 8000...")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
