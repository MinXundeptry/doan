from typing import Literal

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    full_name: str | None = None
    age: float | None = None
    gender: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    activity_level: str | None = None
    bmr: float | None = None
    tdee: float | None = None
    goal: str | None = None
    target_calories: float | None = None

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class MealSummary(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    foods: list[str] = []
    calories: float = 0


class ActivitySummary(BaseModel):
    activity_type: str
    duration_minutes: int = 0
    calories_burned: float = 0


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    mode: Literal["advice", "menu", "analyze"] = "advice"
    profile: UserProfile | None = None
    history: list[ChatMessage] = []
    today_meals: list[MealSummary] = []
    today_activities: list[ActivitySummary] = []


class ChatResponse(BaseModel):
    reply: str