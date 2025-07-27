import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv 
load_dotenv() 

# Configure Gemini
genai.configure(api_key=(os.getenv("GEMINI_API_KEY")))
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def clamp(time_ratio):
    if time_ratio > 1.1:
        return 1.2
    elif 0.9 <= time_ratio <= 1.1:
        return 1.0
    else:
        return 0.8

def adjust_difficulty(current_level, window):
    user_score = 0
    for q in window:
        if q["correct"]:
            time_ratio = q["expected_time"] / q["time_taken"]
            t_bonus = clamp(time_ratio)
            user_score += q["difficulty"] * t_bonus

    upper_bound = sum([q["difficulty"] * 1.2 for q in window])
    performance = (user_score / upper_bound) * 100

    if performance >= 70:
        return min(current_level + 1, 5)
    elif performance <= 40:
        return max(current_level - 1, 1)
    else:
        return current_level

def clean_output(text):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    return text.strip()

def generate_question(topic, difficulty):
    prompt = f"""
    Generate 1 multiple-choice question on the topic: {topic} at difficulty level {difficulty} (1 to 5 scale).

    Important Rules:
    - The question should be conceptual or practical.
    - All 4 options must be plausible and equally likely.
    - Avoid giveaway clues by keyword, length, or formatting.

    Format strictly as:
    {{
      "question": "Your question here",
      "option_1": "Option text",
      "option_2": "Option text",
      "option_3": "Option text",
      "option_4": "Option text",
      "correct_option": "1",
      "expected_time_sec": 30
    }}

    Do not include markdown formatting. Only return raw JSON.
    """
    try:
        response = model.generate_content(prompt)
        cleaned = clean_output(response.text)
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error generating question: {e}")
        return {
            "question": "Error generating question.",
            "option_1": "",
            "option_2": "",
            "option_3": "",
            "option_4": "",
            "correct_option": "1",
            "expected_time_sec": 30
        }
