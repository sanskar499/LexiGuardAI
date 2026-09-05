import re
import io
from typing import List, Dict, Any

try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        PdfReader = None

try:
    import docx
except ImportError:
    docx = None

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF, DOCX, or TXT file bytes."""
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        if PdfReader is None:
            # Fallback string extraction if pypdf is not installed
            return file_bytes.decode('utf-8', errors='ignore')
        reader = PdfReader(io.BytesIO(file_bytes))
        text_pages = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_pages.append(extracted)
        return "\n\n".join(text_pages)
        
    elif filename_lower.endswith('.docx'):
        if docx is None:
            return file_bytes.decode('utf-8', errors='ignore')
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        
    else:
        # Default text/utf-8 parser
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1', errors='ignore')

def parse_contract_into_clauses(text: str) -> List[Dict[str, Any]]:
    """
    Splits legal text into structured sections and clauses.
    Looks for section headings such as:
      - Section 4.2 Payment Terms
      - Clause 6.1 Termination Notice
      - ARTICLE III: Governing Law
      - 1.1 Definitions
    """
    lines = text.split('\n')
    clauses = []
    
    # Heading matching pattern
    section_pattern = re.compile(
        r'^(?:\b(?:Section|Clause|Article)\s+)?(\d+(?:\.\d+)*|[A-Z]+|\d+)\b[.:\s–-]+\s*(.*)$',
        re.IGNORECASE
    )
    
    current_num = "0.1"
    current_title = "Preamble & General Terms"
    current_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        match = section_pattern.match(stripped)
        # Check if line looks like a main heading (short, section-like)
        is_heading = False
        if match and len(stripped) < 120 and not stripped.endswith('.'):
            is_heading = True
        elif stripped.isupper() and len(stripped) < 80 and ("SECTION" in stripped or "ARTICLE" in stripped or "CLAUSE" in stripped):
            is_heading = True
            
        if is_heading:
            # Save previous section if it has content
            if current_lines:
                clauses.append({
                    "section_number": current_num,
                    "title": current_title,
                    "text": "\n".join(current_lines).strip(),
                    "category": categorize_clause(current_title, "\n".join(current_lines))
                })
                current_lines = []
                
            if match:
                sec_num, sec_title = match.groups()
                current_num = f"Section {sec_num}" if not sec_num.lower().startswith("section") else sec_num
                current_title = sec_title if sec_title else f"Section {sec_num}"
            else:
                current_num = f"Section {len(clauses)+1}"
                current_title = stripped
        else:
            current_lines.append(stripped)
            
    # Append final clause
    if current_lines:
        clauses.append({
            "section_number": current_num,
            "title": current_title,
            "text": "\n".join(current_lines).strip(),
            "category": categorize_clause(current_title, "\n".join(current_lines))
        })
        
    if not clauses:
        # Fallback if no sections detected
        clauses.append({
            "section_number": "Section 1.0",
            "title": "General Contract Terms",
            "text": text.strip(),
            "category": "General"
        })
        
    return clauses

def categorize_clause(title: str, text: str) -> str:
    """Categorizes a section based on key terms."""
    combined = (title + " " + text).lower()
    if "payment" in combined or "invoice" in combined or "fee" in combined or "compensation" in combined or "remuneration" in combined:
        return "Payment Terms"
    elif "terminat" in combined or "cancellation" in combined or "notice" in combined or "expiry" in combined:
        return "Termination & Notice"
    elif "liabil" in combined or "indemni" in combined or "damages" in combined or "limitation" in combined:
        return "Limitation of Liability"
    elif "intellectual" in combined or "ip right" in combined or "copyright" in combined or "patent" in combined or "ownership" in combined:
        return "Intellectual Property"
    elif "governing law" in combined or "jurisdiction" in combined or "dispute" in combined or "arbitration" in combined:
        return "Governing Law & Dispute Resolution"
    elif "confidential" in combined or "privacy" in combined or "non-disclosure" in combined:
        return "Confidentiality"
    return "General Obligations"
