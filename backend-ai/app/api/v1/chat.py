import logging

from fastapi import APIRouter, HTTPException

from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.chat_service import chat

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    try:
        return chat(req)
    except Exception as e:
        logger.exception("Lỗi khi gọi Gemini")
        raise HTTPException(status_code=502, detail=f"Lỗi AI: {e}")