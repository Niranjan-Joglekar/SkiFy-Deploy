import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv 
load_dotenv() 

# Configure Gemini
genai.configure(api_key=(os.getenv("GEMINI_API_KEY")))
model = genai.GenerativeModel(model_name="gemini-2.5-flash")

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

def calculate_final_score(all_questions):
    if not all_questions:
        return 0

    user_score = 0
    for q in all_questions:
        if q["correct"]:
            time_ratio = q["expected_time"] / q["time_taken"]
            t_bonus = clamp(time_ratio) # clamp is already defined
            user_score += q["difficulty"] * t_bonus

    # Calculate the maximum possible score
    upper_bound = sum([q["difficulty"] * 1.2 for q in all_questions])

    if upper_bound == 0:
        return 0

    performance = (user_score / upper_bound) * 100
    return round(performance)



def generate_holistic_report(all_test_results, job_description_text):
    """
    Analyzes all test results against a job description to generate a holistic report.

    Args:
        all_test_results (dict): A dictionary where keys are skills and values are 
                                 the list of question results for that skill.
        job_description_text (str): The text of the job description.

    Returns:
        str: A formatted report with insights and feedback.
    """
    
    results_summary = []

    # Flattened list assumption
    correct_count = sum(1 for q in all_test_results if q["correct"])
    total_count = len(all_test_results)
    avg_difficulty = sum(q['difficulty'] for q in all_test_results) / total_count if total_count > 0 else 0
    results_summary.append(
        f"- Skill: General, Score: {correct_count}/{total_count}, "
        f"Average Question Difficulty: {avg_difficulty:.1f}/5.0"
    )

    results_str = "\n".join(results_summary)

    prompt = f"""As a professional technical recruiter and career coach, your task is to provide a holistic analysis of a candidate's performance in a series of technical skills tests and evaluate their fit for a specific job. Use professional language in your response.

  Job Description:
  ---
  {job_description_text}
  ---

  Candidate's Test Performance Summary:
  ---
  {results_str}
  ---

  Please generate a comprehensive report structured with the following sections. Use markdown for formatting (headings, bold text, and bullet points). Aim for brevity and clarity in each section. Focus on the keywords provided in the job description and test results.

  1. Overall Performance Summary:
  Provide a brief, encouraging opening statement summarizing the candidate's overall performance. (Limit: 50 words)

  2. Strengths:
  Based on their test scores and the average difficulty of the questions, identify the candidate's strongest skills. Explain why these are considered strengths. (Limit: 100 words)

  3. Areas for Improvement:
  Identify the skills where the candidate struggled the most. Provide constructive, non-judgmental feedback. Suggest specific concepts or topics within these skills that might need more attention. (Limit: 100 words)

  4. Actionable Feedback & Next Steps:
  Offer concrete, actionable advice for improvement. Suggest resources, types of projects, or areas of study that would help strengthen their weaker areas. (Limit: 100 words)

  5. Job Fit Analysis:
  Conclude with an analysis of how the candidate's demonstrated skills align with the requirements listed in the job description. Highlight the skills that make them a strong potential fit and mention which areas they should focus on to become an even better candidate for this type of role. (Limit: 100 words)"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating holistic report: {e}")
        return "There was an error generating the report. Please try again."