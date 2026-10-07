from app.clients.gemini_client import generate_chat
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.prompt_service import build_chat_system_prompt

MAX_HISTORY = 10  # chỉ giữ 10 tin nhắn gần nhất để tiết kiệm quota


def chat(req: ChatRequest) -> ChatResponse:
    system_prompt = build_chat_system_prompt(
        req.profile,
        req.today_meals,
        req.mode,
        req.today_activities,
    )

    messages = [
        {"role": "user" if m.role == "user" else "model", "text": m.content}
        for m in req.history[-MAX_HISTORY:]
    ]
    # Gemini cần hội thoại bắt đầu bằng lượt của người dùng
    while messages and messages[0]["role"] == "model":
        messages.pop(0)
    messages.append({"role": "user", "text": req.message})

    return ChatResponse(reply=generate_chat(messages, system_prompt))