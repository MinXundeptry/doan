from fastapi import APIRouter

from app.api.v1 import vision, chat

api_router = APIRouter()
api_router.include_router(vision.router)
api_router.include_router(chat.router)