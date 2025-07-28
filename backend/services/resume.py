import os
import io
import base64
from PIL import Image
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def extract_pdf_content(pdf_bytes: bytes):
    """
    Extracts text content with layout information from all pages of a PDF
    and generates an image of the first page.
    """
    all_text_content = ""
    first_page_image_data = None

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # Extract text content from all pages with layout information
        for page_num, page in enumerate(doc):
            # 'text' format provides plain text
            # 'text' with 'dict' or 'json' provides more structured info (blocks, lines, spans)
            # For general ATS, plain text is often sufficient, but for detailed layout,
            # you might process 'textpage.extractDICT()' or 'textpage.extractJSON()'
            all_text_content += page.get_text("text") + "\n\n---PAGE BREAK---\n\n"

            # Generate image of the first page only for visual layout analysis
            if page_num == 0:
                pix = page.get_pixmap()
                img_byte_arr = io.BytesIO(pix.tobytes("jpeg"))
                first_page_image_data = img_byte_arr.getvalue()

        doc.close()

        pdf_parts = [
            {"mime_type": "text/plain", "data": all_text_content},
        ]
        if first_page_image_data:
            pdf_parts.append({
                "mime_type": "image/jpeg",
                "data": base64.b64encode(first_page_image_data).decode()
            })

        return pdf_parts

    except Exception as e:
        raise Exception(f"Error processing PDF with PyMuPDF: {e}")

def get_resume_analysis(job_description: str, pdf_bytes: bytes, analysis_type: str):
    pdf_content_parts = extract_pdf_content(pdf_bytes)

    # Separate text and image parts
    text_content = ""
    image_part = None
    for part in pdf_content_parts:
        if part["mime_type"] == "text/plain":
            text_content = part["data"]
        elif part["mime_type"] == "image/jpeg":
            image_part = part

    if analysis_type == "summary":
        prompt = f"""
        You are an experienced Technical Human Resource Manager.
Your task is to review the provided resume text and (if available) the first page's visual layout against the job description.

Please provide a professional evaluation of how well the candidate's profile aligns with the role. To ensure the evaluation is user-centric and precise, consider the following:

1. **Content Alignment:**
  * Compare the candidate's skills and experience (as presented in the resume) with the essential and desired qualifications outlined in the job description.
  * Identify specific instances where the resume demonstrates a strong match with the job requirements.
  * Pinpoint any gaps or areas where the candidate's qualifications appear to be lacking based on the job description.

2. **Presentation/Layout Effectiveness:**
  * Assess how effectively the resume's layout highlights the candidate's key qualifications and accomplishments relevant to the job description.
  * Evaluate the clarity, readability, and overall visual appeal of the resume's first page. Does it make a positive first impression and quickly convey the candidate's value proposition for this specific role?
  * Consider whether the layout choices (e.g., font, spacing, section headings) enhance or detract from the resume's impact.

3. **Strengths and Weaknesses Summary:**
  * Summarize the candidate's key strengths in relation to the job requirements, providing specific examples from the resume.
  * Clearly articulate the weaknesses or areas for improvement, explaining why they might be a concern for this particular role.

Structure your evaluation to directly address the user's need to understand the candidate's suitability for the position. Provide actionable insights that can inform the hiring decision.'''
        Job Description:
        {job_description}

        Resume Content (extracted text):
        {text_content}
        """
        model = genai.GenerativeModel('gemini-2.5-flash')
        # Send both text content and image if available
        if image_part:
            response = model.generate_content([prompt, image_part])
        else:
            response = model.generate_content([prompt])

    elif analysis_type == "percentage_match":
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) scanner with data science and ATS functionality expertise. Evaluate the resume against the job description. Provide the percentage match, a concise list of missing keywords (from the job description not in the resume), and a focused evaluation of the resume's ATS compatibility, considering content and layout.

Output format:
Percentage Match: [XX]%
Missing Keywords:
- Keyword 1
- Keyword 2
...
Final Thoughts: [Concise professional evaluation of ATS compatibility and layout impact.]'''
        Job Description:
        {job_description}

        Resume Content (extracted text):
        {text_content}
        """
        model = genai.GenerativeModel('gemini-2.5-flash')
        # Send both text content and image if available
        if image_part:
            response = model.generate_content([prompt, image_part])
        else:
            response = model.generate_content([prompt])

    else:
        raise ValueError("Invalid analysis_type. Must be 'summary' or 'percentage_match'.")

    return response.text