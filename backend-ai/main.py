from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router

app = FastAPI(title="Nutrition AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # đồ án: để mở; khi triển khai thì giới hạn lại
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}