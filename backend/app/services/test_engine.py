"""
Test Engine
Assigns and evaluates skill tests based on category.
"""
from app.models.test import TestType

# Sample question bank (in production, store in DB)
QUESTION_BANK = {
    TestType.coding: [
        {"id": 1, "question": "What is the output of print(2**3)?", "options": ["6", "8", "9", "None"], "answer": "8"},
        {"id": 2, "question": "Which data structure uses LIFO?", "options": ["Queue", "Stack", "Array", "Tree"], "answer": "Stack"},
        {"id": 3, "question": "What does SQL stand for?", "options": ["Structured Query Language", "Simple Query Logic", "Standard Query List", "None"], "answer": "Structured Query Language"},
    ],
    TestType.mcq_case: [
        {"id": 1, "question": "A brand wants to increase awareness. Best channel?", "options": ["SEO", "TV Ad", "Email", "Cold Call"], "answer": "TV Ad"},
        {"id": 2, "question": "CTR stands for?", "options": ["Click Through Rate", "Cost To Reach", "Customer Trend Report", "None"], "answer": "Click Through Rate"},
    ],
    TestType.mcq_numerical: [
        {"id": 1, "question": "If revenue is 500 and cost is 300, what is profit margin?", "options": ["40%", "60%", "50%", "30%"], "answer": "40%"},
        {"id": 2, "question": "What is compound interest on 1000 at 10% for 2 years?", "options": ["200", "210", "220", "100"], "answer": "210"},
    ],
    TestType.aptitude: [
        {"id": 1, "question": "If A > B and B > C, then?", "options": ["A > C", "C > A", "A = C", "Cannot determine"], "answer": "A > C"},
        {"id": 2, "question": "Next in series: 2, 4, 8, 16, ?", "options": ["24", "32", "30", "20"], "answer": "32"},
    ],
}

CATEGORY_TO_TEST_TYPE = {
    "tech": TestType.coding,
    "marketing": TestType.mcq_case,
    "finance": TestType.mcq_numerical,
    "general": TestType.aptitude,
}

def get_test_type_for_category(category: str) -> TestType:
    return CATEGORY_TO_TEST_TYPE.get(category.lower(), TestType.aptitude)

def get_questions(test_type: TestType) -> list:
    return QUESTION_BANK.get(test_type, [])

def evaluate_answers(questions: list, answers: dict) -> dict:
    """
    answers: {question_id: selected_option}
    Returns score percentage and pass/fail.
    """
    if not questions:
        return {"score": 0, "passed": False}

    correct = 0
    for q in questions:
        if str(q["id"]) in answers and answers[str(q["id"])] == q["answer"]:
            correct += 1

    score_pct = (correct / len(questions)) * 100
    return {
        "score": round(score_pct, 2),
        "correct": correct,
        "total": len(questions),
        "passed": score_pct >= 60.0,
    }
