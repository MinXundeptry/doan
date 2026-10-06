from pydantic import BaseModel, Field


class FoodItem(BaseModel):
    food_name: str = Field(description="Tên món ăn bằng tiếng Việt")
    amount_gram: float = Field(description="Khẩu phần ước lượng, đơn vị gram")
    calories: float = Field(description="Tổng calo (kcal) của khẩu phần này")
    protein: float = Field(description="Protein (g) của khẩu phần này")
    carbs: float = Field(description="Carbohydrate (g) của khẩu phần này")
    fat: float = Field(description="Chất béo (g) của khẩu phần này")
    confidence: float = Field(description="Độ tin cậy từ 0 đến 1")


class VisionAIResult(BaseModel):
    """Phần Gemini trả về."""
    is_food: bool = Field(description="Ảnh có chứa món ăn hay không")
    note: str | None = Field(default=None, description="Ghi chú ngắn nếu có")
    items: list[FoodItem]


class VisionResponse(VisionAIResult):
    """Phần trả về cho backend-core (thêm tổng, do code tự tính)."""
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float