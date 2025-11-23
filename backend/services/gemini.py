import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv
from services.rag_service import retrieve_context 

load_dotenv()
genai.configure(api_key=(os.getenv("GEMINI_API_KEY")))

# 1. DISABLE SAFETY FILTERS
# This prevents the "Invalid operation... valid Part" error
safety_settings = [
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
]

# 2. INCREASE TOKEN LIMIT (Crucial for Gemini 2.5)
# "finish_reason: 2" happens when the model runs out of space.
# We increase this to 8192 to give it plenty of room.
generation_config = genai.types.GenerationConfig(
    temperature=0.7, 
    max_output_tokens=8192, 
    response_mime_type="application/json"
)

# 3. USE THE ACTIVE MODEL (Gemini 2.5 Flash)
# 1.5 is deprecated in your timeline. 2.5 is the active standard.
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)

def clamp(time_ratio):
    if time_ratio > 1.1: return 1.2
    elif 0.9 <= time_ratio <= 1.1: return 1.0
    else: return 0.8

def adjust_difficulty(current_level, window):
    user_score = 0
    for q in window:
        if q["correct"]:
            time_ratio = q["expected_time"] / q["time_taken"]
            t_bonus = clamp(time_ratio)
            user_score += q["difficulty"] * t_bonus

    upper_bound = sum([q["difficulty"] * 1.2 for q in window])
    if upper_bound == 0: return current_level
    
    performance = (user_score / upper_bound) * 100
    if performance >= 70: return min(current_level + 1, 5)
    elif performance <= 40: return max(current_level - 1, 1)
    else: return current_level

def clean_output(text):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    return text.strip()

def generate_question(topic, difficulty, previous_questions=[]):
    # RAG Retrieval
    context_fact = retrieve_context(topic)
    
    # Exclusion List
    avoid_list = [q.get("question", "")[:50] for q in previous_questions]
    avoid_instruction = ""
    if avoid_list:
        avoid_instruction = f"CONSTRAINT: Do NOT generate a question similar to: {json.dumps(avoid_list)}"

    # Construct Prompt
    context_instruction = ""
    if context_fact:
        print(f"🔹 RAG Active for '{topic}'")
        context_instruction = f"""
        CONTEXT SEED: "{context_fact}"
        INSTRUCTION: Use the technical concept in the SEED as the core topic.
        Even if the requested difficulty is LOW (Level 1-2), do NOT ignore this seed.
        Instead, SIMPLIFY the concept. Ask a basic definition or identification question about this specific seed.
        """
    else:
        print(f"🔸 RAG Bypassed for '{topic}'")
        context_instruction = f"""
        INSTRUCTION: Generate a unique question on {topic}. {avoid_instruction}
        """

    prompt = f"""
    Generate 1 multiple-choice question on the topic: {topic} at difficulty level {difficulty} (1 to 5 scale).
    {context_instruction}
    {avoid_instruction}
    Important Rules:
    - The question should be conceptual or practical.
    - All 4 options must be plausible and equally likely.
    - Avoid giveaway clues by keyword, length, or formatting.
    - Difficulty to time mapping - Very Easy (1): 10-15 sec, Easy (2): 15-30 sec, Medium (3): 30-50 sec, Hard (4): 50-80 sec, Very Hard (5): 80-120 sec

    Format strictly as:
    {{
      "question": "Your question here",
      "options": [
        "Option 1 text",
        "Option 2 text",
        "Option 3 text",
        "Option 4 text"
      ],
      "correct_option": "0",
      "expected_time_sec": 30
    }}

    NOTE: 'correct_option' must be an INTEGER index (0 for A, 1 for B, 2 for C, 3 for D). Do not return letters.
    """
    
    try:
        response = model.generate_content(prompt)
        
        # Check for blocks explicitly
        if response.prompt_feedback and response.prompt_feedback.block_reason:
            print(f"⚠️ Blocked: {response.prompt_feedback.block_reason}")
            raise ValueError("Response blocked")
            
        cleaned = clean_output(response.text)
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error generating question: {e}")
        return {
            "question": f"Error generating question for {topic}.",
            "options": ["Error", "Error", "Error", "Error"],
            "correct_option": "0",
            "expected_time_sec": 30
        }

def calculate_final_score(all_questions):
    if not all_questions: return 0
    user_score = 0
    for q in all_questions:
        if q["correct"]:
            time_ratio = q["expected_time"] / q["time_taken"]
            t_bonus = clamp(time_ratio) 
            user_score += q["difficulty"] * t_bonus
    upper_bound = sum([q["difficulty"] * 1.2 for q in all_questions])
    if upper_bound == 0: return 0
    return round((user_score / upper_bound) * 100)

def generate_holistic_report(all_test_results, job_description_text):
    correct_count = sum(1 for q in all_test_results if q["correct"])
    total_count = len(all_test_results)
    avg_difficulty = sum(q['difficulty'] for q in all_test_results) / total_count if total_count > 0 else 0
    
    results_summary = f"Score: {correct_count}/{total_count}, Avg Difficulty: {avg_difficulty:.1f}/5"

    prompt = f"""As a technical recruiter, analyze this performance:
    Job Description: {job_description_text}
    Performance: {results_summary}
    Provide a holistic report with sections: Overall, Strengths, Improvements, Actionable Steps, Job Fit.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return "Error generating report."