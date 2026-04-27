"""
OCR Service - Level 1 Certificate Validation
Extracts text from uploaded certificate images/PDFs and matches against candidate profile.
"""
import pytesseract
from PIL import Image
import pdfplumber
import re
import os
from app.core.config import settings

# Configure Tesseract path from environment variable or use default
tesseract_path = settings.TESSERACT_PATH or os.getenv('TESSERACT_PATH', '')
if tesseract_path and os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    # Try common paths or rely on system PATH
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        '/usr/bin/tesseract',
        '/usr/local/bin/tesseract',
    ]
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break

def extract_text_from_image(file_path: str) -> str:
    try:
        img = Image.open(file_path)
        return pytesseract.image_to_string(img)
    except Exception:
        return ""

def extract_text_from_pdf(file_path: str) -> str:
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception:
        return ""

def extract_certificate_text(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    return extract_text_from_image(file_path)

def validate_certificate(file_path: str, candidate_name: str) -> dict:
    """
    Level 1 validation:
    - Extract text via OCR
    - Check if candidate name appears in document
    - Extract date if present
    """
    text = extract_certificate_text(file_path)
    name_found = candidate_name.lower() in text.lower()

    # Try to extract a date
    date_pattern = re.compile(r"\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{4})\b")
    dates = date_pattern.findall(text)

    return {
        "ocr_text": text,
        "name_matched": name_found,
        "dates_found": dates,
        "is_valid": name_found,  # basic check: name must appear
    }
