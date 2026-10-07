import math

from app.clients.gemini_client import generate_structured_from_image
from app.schemas.vision_schema import FoodItem, VisionAIResult, VisionResponse
from app.services.prompt_service import VISION_SYSTEM_PROMPT, get_vision_prompt
from app.utils.image_utils import preprocess_image


def analyze_food_image(
    image_bytes: bytes,
    content_type: str | None,
    food_name: str | None = None,
    amount_gram: float | None = None,
) -> VisionResponse:
    food_name = food_name.strip() if food_name else None
    if food_name and len(food_name) > 120:
        raise ValueError("Tên món ăn không được quá 120 ký tự.")
    if amount_gram is not None and (
        not math.isfinite(amount_gram) or amount_gram <= 0 or amount_gram > 9999.99
    ):
        raise ValueError("amount_gram phải lớn hơn 0 và không quá 9999.99.")

    data, mime = preprocess_image(image_bytes, content_type)

    result: VisionAIResult = generate_structured_from_image(
        prompt=get_vision_prompt(food_name, amount_gram),
        image_bytes=data,
        mime_type=mime,
        schema=VisionAIResult,
        system_instruction=VISION_SYSTEM_PROMPT,
    )

    items = result.items if result.is_food else []
    if items and food_name:
        items = [
            FoodItem(
                food_name=food_name,
                amount_gram=sum(item.amount_gram for item in items),
                calories=sum(item.calories for item in items),
                protein=sum(item.protein for item in items),
                carbs=sum(item.carbs for item in items),
                fat=sum(item.fat for item in items),
                confidence=min(item.confidence for item in items),
            )
        ]

    if items and amount_gram is not None:
        estimated_amount = sum(item.amount_gram for item in items)
        if estimated_amount <= 0:
            raise ValueError("Không xác định được khối lượng khẩu phần để điều chỉnh.")
        scale = amount_gram / estimated_amount
        scaled_items = []
        scaled_amount = 0.0
        for index, item in enumerate(items):
            item_amount = (
                amount_gram - scaled_amount
                if index == len(items) - 1
                else item.amount_gram * scale
            )
            scaled_amount += item_amount
            scaled_items.append(
                FoodItem(
                    food_name=item.food_name,
                    amount_gram=item_amount,
                    calories=item.calories * scale,
                    protein=item.protein * scale,
                    carbs=item.carbs * scale,
                    fat=item.fat * scale,
                    confidence=item.confidence,
                )
            )
        items = scaled_items

    return VisionResponse(
        is_food=result.is_food,
        note=result.note,
        items=items,
        total_calories=round(sum(i.calories for i in items), 1),
        total_protein=round(sum(i.protein for i in items), 1),
        total_carbs=round(sum(i.carbs for i in items), 1),
        total_fat=round(sum(i.fat for i in items), 1),
    )