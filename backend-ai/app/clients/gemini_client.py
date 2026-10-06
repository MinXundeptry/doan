import time

from google import genai
from google.genai import errors, types

from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

# Các mã lỗi tạm thời, đáng để thử lại
RETRYABLE_CODES = {429, 500, 503, 504}
MAX_ATTEMPTS = 3


def _generate(contents, config):
    """Gọi Gemini; lỗi tạm thời thì thử lại, hết lượt thì chuyển model dự phòng."""
    models = [settings.gemini_model]
    if settings.gemini_fallback_model:
        models.append(settings.gemini_fallback_model)

    last_error = None
    for model in models:
        for attempt in range(MAX_ATTEMPTS):
            try:
                return client.models.generate_content(
                    model=model, contents=contents, config=config
                )
            except errors.APIError as e:
                last_error = e
                if e.code not in RETRYABLE_CODES:
                    raise  # lỗi thật (sai key, sai model...) thì báo ngay
                time.sleep(2**attempt)  # chờ 1s, 2s, 4s
    raise last_error


def generate_text(prompt: str, system_instruction: str | None = None) -> str:
    response = _generate(
        contents=prompt,
        config=types.GenerateContentConfig(system_instruction=system_instruction),
    )
    return response.text


def generate_from_image(
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    system_instruction: str | None = None,
) -> str:
    response = _generate(
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ],
        config=types.GenerateContentConfig(system_instruction=system_instruction),
    )
    return response.text


def generate_structured_from_image(
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    schema,
    system_instruction: str | None = None,
):
    """Gửi ảnh + prompt, Gemini trả về JSON đúng theo schema (Pydantic)."""
    response = _generate(
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ],
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.2,
        ),
    )
    return response.parsed

def generate_chat(messages: list[dict], system_instruction: str) -> str:
    """messages: [{"role": "user" | "model", "text": "..."}]"""
    contents = [
        types.Content(role=m["role"], parts=[types.Part(text=m["text"])])
        for m in messages
    ]
    response = _generate(
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ),
    )
    return response.text