"""
Resume Parser using PyMuPDF (fitz) for layout-aware text extraction.
Handles single-column and two-column resume formats correctly.
"""
import fitz  # pymupdf
import re

SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "node", "nodejs",
    "angular", "vue", "django", "flask", "fastapi", "spring", "express",
    "sql", "mysql", "postgresql", "mongodb", "redis", "firebase",
    "machine learning", "deep learning", "data analysis", "data science",
    "tensorflow", "pytorch", "scikit", "pandas", "numpy", "matplotlib",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux",
    "html", "css", "tailwind", "bootstrap", "figma",
    "excel", "powerpoint", "tableau", "power bi",
    "marketing", "seo", "finance", "accounting", "communication",
    "c++", "c#", "golang", "rust", "kotlin", "swift", "php", "ruby",
    "rest", "api", "graphql", "microservices", "agile", "scrum",
    "langchain", "openai", "llm", "nlp", "computer vision",
]

EDUCATION_KEYWORDS = [
    "b.tech", "b.e", "b.sc", "bsc", "b.com", "bca", "bba",
    "m.tech", "m.sc", "msc", "mba", "m.com", "mca",
    "bachelor", "master", "phd", "ph.d", "degree", "diploma",
    "engineering", "university", "college", "institute",
    "10th", "12th", "hsc", "ssc", "intermediate",
]

CERT_SECTION_KEYWORDS = [
    "certification", "certifications", "certificate", "certificates",
    "courses", "course", "achievements", "achievement", "awards"
]

EXPERIENCE_SECTION_KEYWORDS = [
    "experience", "work experience", "professional experience",
    "employment", "work history", "career"
]

INTERNSHIP_SECTION_KEYWORDS = [
    "internship", "internships", "intern", "training", "industrial training"
]

SECTION_HEADERS = re.compile(
    r"^(education|skills|technical skills|soft skills|projects|project|"
    r"achievements|awards|languages|references|summary|objective|profile|"
    r"certifications?|certificates?|courses?|publications?|"
    r"experience|work experience|professional experience|employment|"
    r"internships?|training|hobbies|interests|extra.curricular|"
    r"personal details|contact)[\s:]*$",
    re.IGNORECASE
)


def extract_text_layout_aware(file_path: str) -> str:
    """
    Use PyMuPDF's 'blocks' extraction which preserves layout.
    Sorts text blocks by position (top-to-bottom, left-to-right per column).
    For two-column layouts, processes left column first then right column.
    """
    try:
        doc = fitz.open(file_path)
        full_text = ""

        for page in doc:
            page_width = page.rect.width
            mid = page_width / 2

            # Get all text blocks with their positions
            blocks = page.get_text("blocks")  # returns (x0, y0, x1, y1, text, block_no, block_type)
            text_blocks = [(b[0], b[1], b[2], b[3], b[4]) for b in blocks if b[6] == 0]  # type 0 = text

            if not text_blocks:
                continue

            # Detect two-column layout
            left_blocks = [b for b in text_blocks if b[2] < mid + 20]
            right_blocks = [b for b in text_blocks if b[0] > mid - 20]

            is_two_column = (
                len(left_blocks) >= 3 and
                len(right_blocks) >= 3 and
                len(left_blocks) + len(right_blocks) > len(text_blocks) * 1.3
            )

            if is_two_column:
                # Strictly split: left = x1 < mid, right = x0 > mid
                strict_left = [b for b in text_blocks if b[2] <= mid]
                strict_right = [b for b in text_blocks if b[0] >= mid]

                # Sort each column top to bottom
                strict_left.sort(key=lambda b: b[1])
                strict_right.sort(key=lambda b: b[1])

                for b in strict_left:
                    full_text += b[4].strip() + "\n"
                full_text += "\n"
                for b in strict_right:
                    full_text += b[4].strip() + "\n"
            else:
                # Single column — sort top to bottom
                text_blocks.sort(key=lambda b: (b[1], b[0]))
                for b in text_blocks:
                    full_text += b[4].strip() + "\n"

            full_text += "\n"

        doc.close()
        return full_text

    except Exception as e:
        print(f"[PDF ERROR] {e}")
        # Fallback to simple extraction
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
            return text
        except Exception:
            return ""


def get_section_lines(all_lines: list, section_keywords: list) -> list:
    """Extract lines from a named section until the next section header."""
    in_section = False
    result = []

    for line in all_lines:
        stripped = line.strip()
        if not stripped:
            continue

        is_target = any(kw in stripped.lower() for kw in section_keywords)
        is_other = bool(SECTION_HEADERS.match(stripped)) and not is_target

        if is_target:
            in_section = True
            continue

        if in_section:
            if is_other:
                break
            result.append(stripped)

    return result


def extract_skills(text: str) -> list:
    lower = text.lower()
    return [s for s in SKILL_KEYWORDS if re.search(r'\b' + re.escape(s) + r'\b', lower)]


def extract_education(text: str) -> list:
    found = set()
    for line in text.split("\n"):
        s = line.strip()
        if len(s) < 5:
            continue
        if any(kw in s.lower() for kw in EDUCATION_KEYWORDS):
            found.add(s)
    return list(found)[:8]


def extract_experience(text: str) -> list:
    lines = text.split("\n")
    section = get_section_lines(lines, EXPERIENCE_SECTION_KEYWORDS)
    source = section if section else lines

    entries = []
    current = []

    date_re = re.compile(
        r"(\d{1,2}/\d{4}|\d{4}\s*[-–to]+\s*(?:\d{4}|present|current|now)|"
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,\-]+\d{4}"
        r"(?:\s*[-–to]+\s*(?:present|current|now|"
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,\-]+\d{4}|\d{4}))?)",
        re.IGNORECASE
    )

    for line in source:
        s = line.strip()
        if not s or s in ("•", "-", "–", "*"):
            continue

        has_date = bool(date_re.search(s))

        # A new job entry starts when:
        # 1. Line contains a date range, OR
        # 2. Line looks like a job title (capitalized, not a bullet)
        is_new_entry = has_date or (
            len(s) > 5 and
            s[0].isupper() and
            not s.startswith(("•", "-", "–", "*", "·")) and
            not current  # only treat as title if no current entry
        )

        if has_date:
            # Save previous entry and start new one
            if current:
                entries.append(current)
            current = [s]
        elif is_new_entry and not current:
            current = [s]
        elif current:
            # Accumulate bullet points / description lines (keep up to 5 per entry)
            if len(current) < 6:
                current.append(s)

    # Don't forget the last entry
    if current:
        entries.append(current)

    # Format: each entry as a readable string
    result = []
    seen = set()
    for entry in entries:
        # First line is usually title/company, second is date/location
        # Join first 3 lines with separator
        formatted = " | ".join(e for e in entry[:3] if e and e not in ("•", "-"))
        if formatted and formatted not in seen and len(formatted) > 8:
            seen.add(formatted)
            result.append(formatted)

    # No cap — return all experiences found
    return result


def extract_internships(text: str) -> list:
    lines = text.split("\n")
    section = get_section_lines(lines, INTERNSHIP_SECTION_KEYWORDS)

    if section:
        entries, current = [], []
        for line in section:
            s = line.strip()
            if not s or s in ("•", "-"):
                continue
            if s[0].isupper() and len(s) > 5:
                if current:
                    entries.append(" | ".join(current[:3]))
                current = [s]
            elif current:
                current.append(s)
        if current:
            entries.append(" | ".join(current[:3]))
        if entries:
            return list(dict.fromkeys(entries))[:6]

    # Fallback
    result = []
    for line in lines:
        if "intern" in line.lower() and len(line.strip()) > 5:
            result.append(line.strip())
    return list(dict.fromkeys(result))[:10]


def extract_certifications(text: str) -> list:
    lines = text.split("\n")
    section = get_section_lines(lines, CERT_SECTION_KEYWORDS)
    source = section if section else lines

    certs = []
    cert_re = re.compile(
        r"(certified|certification|certificate|aws|google|microsoft|"
        r"coursera|udemy|nptel|hackerrank|leetcode|codechef|cisco|oracle)",
        re.IGNORECASE
    )

    for line in source:
        s = line.strip().lstrip("•-– ")
        if len(s) < 5:
            continue
        if cert_re.search(s) or (section and len(s) > 5):
            certs.append(s)

    return list(dict.fromkeys(certs))[:15]


def parse_resume(file_path: str) -> dict:
    text = extract_text_layout_aware(file_path)

    if not text.strip():
        return {
            "raw_text": "",
            "education": [],
            "skills": [],
            "experience": [],
            "certifications": [],
            "internships": [],
            "error": "Could not extract text from PDF"
        }

    return {
        "raw_text": text[:3000],
        "education": extract_education(text),
        "skills": extract_skills(text),
        "experience": extract_experience(text),
        "certifications": extract_certifications(text),
        "internships": extract_internships(text),
    }
