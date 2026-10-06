from app.schemas.chat_schema import MealSummary, UserProfile

def get_vision_prompt() -> str:
    return "Hãy nhận diện các món ăn trong ảnh và ước tính giá trị dinh dưỡng."

VISION_SYSTEM_PROMPT = """Bạn là chuyên gia dinh dưỡng, chuyên nhận diện món ăn Việt Nam và quốc tế qua ảnh.
Quy tắc:
- Chỉ nhận diện thực phẩm/đồ uống nhìn thấy trong ảnh, không bịa thêm.
- Nếu ảnh không có đồ ăn, đặt is_food=false và items=[].
- Mỗi món/thành phần là một phần tử trong items; tên món bằng tiếng Việt.
- Ước lượng khẩu phần (gram) theo kích thước thông thường của một suất ăn trong ảnh.
- calories, protein, carbs, fat là giá trị của cả khẩu phần đó, không phải trên 100g.
- confidence thấp (dưới 0.5) nếu ảnh mờ hoặc không chắc chắn.
- Đây chỉ là ước lượng; ghi chú ngắn vào note nếu có điều cần lưu ý."""

CHAT_BASE_PROMPT = """Bạn là trợ lý dinh dưỡng của ứng dụng quản lý dinh dưỡng và theo dõi calo.
Quy tắc:
- Chỉ trả lời các chủ đề về dinh dưỡng, thực phẩm, calo, chế độ ăn, cân nặng và vận động liên quan. Câu hỏi ngoài phạm vi thì lịch sự từ chối và hướng về dinh dưỡng.
- Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, thân thiện. Dùng gạch đầu dòng khi liệt kê.
- Dựa vào thông tin hồ sơ và bữa ăn của người dùng bên dưới để cá nhân hóa. Nếu thiếu thông tin cần thiết (ví dụ chưa có cân nặng, mục tiêu) thì hỏi lại người dùng, không tự bịa số liệu.
- Ưu tiên món ăn quen thuộc với người Việt, dễ tìm, dễ nấu.
- Không chẩn đoán bệnh hay kê thuốc. Người có bệnh lý hoặc đang mang thai thì khuyên hỏi bác sĩ/chuyên gia dinh dưỡng.
- Không khuyên ăn quá ít: mức calo mỗi ngày không dưới khoảng 1200 kcal (nữ) hoặc 1500 kcal (nam)."""

MODE_PROMPTS = {
    "advice": "Nhiệm vụ: giải đáp câu hỏi và tư vấn dinh dưỡng cho người dùng.",
    "menu": (
        "Nhiệm vụ: đề xuất thực đơn một ngày (sáng, trưa, tối, ăn nhẹ) phù hợp mục tiêu calo của người dùng. "
        "Với mỗi món ghi khẩu phần (gram) và calo ước tính, cuối cùng ghi tổng calo/protein/carbs/fat. "
        "Hạn chế lặp món và tính đến những gì họ đã ăn hôm nay."
    ),
    "analyze": (
        "Nhiệm vụ: phân tích các bữa ăn hôm nay so với mục tiêu: đã nạp bao nhiêu calo, còn lại bao nhiêu, "
        "cân đối protein/carbs/fat chưa, và gợi ý điều chỉnh cho các bữa còn lại."
    ),
}

GENDER_VI = {"male": "Nam", "female": "Nữ"}
ACTIVITY_VI = {
    "sedentary": "ít vận động",
    "lightly_active": "vận động nhẹ",
    "moderately_active": "vận động vừa",
    "very_active": "vận động nhiều",
}
GOAL_VI = {"lose": "giảm cân", "maintain": "duy trì cân nặng", "gain": "tăng cân"}
MEAL_VI = {"breakfast": "Sáng", "lunch": "Trưa", "dinner": "Tối", "snack": "Ăn nhẹ"}


def _format_profile(p: UserProfile | None) -> str:
    if p is None:
        return "Hồ sơ người dùng: chưa có thông tin."
    rows = [
        ("Tuổi", p.age),
        ("Giới tính", GENDER_VI.get(p.gender) if p.gender else None),
        ("Chiều cao (cm)", p.height_cm),
        ("Cân nặng (kg)", p.weight_kg),
        ("Mức vận động", ACTIVITY_VI.get(p.activity_level) if p.activity_level else None),
        ("BMR (kcal)", p.bmr),
        ("TDEE (kcal)", p.tdee),
        ("Mục tiêu", GOAL_VI.get(p.goal) if p.goal else None),
        ("Calo mục tiêu mỗi ngày (kcal)", p.target_calories),
    ]
    lines = [f"- {k}: {v}" for k, v in rows if v not in (None, "", 0)]
    return "Hồ sơ người dùng:\n" + ("\n".join(lines) if lines else "- (chưa có)")


def _format_meals(meals: list[MealSummary]) -> str:
    if not meals:
        return "Bữa ăn hôm nay: chưa ghi nhận bữa nào."
    lines = []
    total = 0.0
    for m in meals:
        foods = ", ".join(m.foods) if m.foods else "(không rõ món)"
        lines.append(f"- {MEAL_VI[m.meal_type]}: {foods} (~{m.calories:.0f} kcal)")
        total += m.calories
    return "Bữa ăn hôm nay:\n" + "\n".join(lines) + f"\nTổng đã ăn: ~{total:.0f} kcal"


def build_chat_system_prompt(
    profile: UserProfile | None, today_meals: list[MealSummary], mode: str
) -> str:
    return "\n\n".join(
        [
            CHAT_BASE_PROMPT,
            MODE_PROMPTS[mode],
            _format_profile(profile),
            _format_meals(today_meals),
        ]
    )