import logging
import time

from google import genai
from google.genai import errors, types

from app.core.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.gemini_api_key)

# Lỗi tạm thời của server -> đáng thử lại
RETRYABLE_CODES = {500, 503, 504}
# Hết quota của model này -> thử lại vô ích, chuyển sang model khác
SWITCH_MODEL_CODES = {429}
MAX_ATTEMPTS = 3


def _generate(contents, config):
    """Gọi Gemini; lỗi tạm thời thì thử lại, hết quota/hỏng thì chuyển model dự phòng."""
    fallbacks = [m.strip() for m in settings.gemini_fallback_model.split(",") if m.strip()]
    models = [settings.gemini_model] + [m for m in fallbacks if m != settings.gemini_model]

    first_error = None
    for index, model in enumerate(models):
        for attempt in range(MAX_ATTEMPTS):
            try:
                return client.models.generate_content(
                    model=model, contents=contents, config=config
                )
            except errors.APIError as e:
                logger.warning(
                    "Gemini model=%s lần %d lỗi %s", model, attempt + 1, e.code
                )
                if first_error is None:
                    first_error = e
                if e.code in SWITCH_MODEL_CODES:
                    break  # hết quota -> sang model khác ngay
                if e.code not in RETRYABLE_CODES:
                    if index == 0:
                        raise  # lỗi thật ở model chính (sai key, sai tên model...)
                    break  # model dự phòng hỏng thì bỏ qua
                if attempt < MAX_ATTEMPTS - 1:
                    time.sleep(2**attempt)  # chờ 1s, 2s
    raise first_error


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