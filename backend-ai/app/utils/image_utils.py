import io

from PIL import Image, UnidentifiedImageError

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
MAX_SIDE = 1024


def preprocess_image(image_bytes: bytes, content_type: str | None) -> tuple[bytes, str]:
    if content_type not in ALLOWED_TYPES:
        raise ValueError("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WEBP.")
    if len(image_bytes) > MAX_SIZE_BYTES:
        raise ValueError("Ảnh quá lớn (tối đa 5MB).")
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise ValueError("File không phải ảnh hợp lệ.")

    img.thumbnail((MAX_SIDE, MAX_SIDE))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue(), "image/jpeg"