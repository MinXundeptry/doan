import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.vision_schema import VisionResponse
from app.services.vision_service import analyze_food_image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vision", tags=["Vision"])


@router.post("/analyze", response_model=VisionResponse)
def analyze(
    file: UploadFile = File(...),
    food_name: str | None = Form(default=None, max_length=120),
    amount_gram: float | None = Form(default=None),
):
    image_bytes = file.file.read()
    try:
        return analyze_food_image(
            image_bytes,
            file.content_type,
            food_name=food_name,
            amount_gram=amount_gram,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Lỗi khi gọi Gemini")  # in đầy đủ lỗi ra terminal
        raise HTTPException(status_code=502, detail=f"Lỗi AI: {e}")