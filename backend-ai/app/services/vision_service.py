from app.clients.gemini_client import generate_structured_from_image
from app.schemas.vision_schema import VisionAIResult, VisionResponse
from app.services.prompt_service import VISION_SYSTEM_PROMPT, get_vision_prompt
from app.utils.image_utils import preprocess_image


def analyze_food_image(image_bytes: bytes, content_type: str | None) -> VisionResponse:
    data, mime = preprocess_image(image_bytes, content_type)

    result: VisionAIResult = generate_structured_from_image(
        prompt=get_vision_prompt(),
        image_bytes=data,
        mime_type=mime,
        schema=VisionAIResult,
        system_instruction=VISION_SYSTEM_PROMPT,
    )

    items = result.items if result.is_food else []
    return VisionResponse(
        is_food=result.is_food,
        note=result.note,
        items=items,
        total_calories=round(sum(i.calories for i in items), 1),
        total_protein=round(sum(i.protein for i in items), 1),
        total_carbs=round(sum(i.carbs for i in items), 1),
        total_fat=round(sum(i.fat for i in items), 1),
    )