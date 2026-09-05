import re
import uuid
from typing import List, Dict, Any

def analyze_contradictions(clauses: List[Dict[str, Any]], cross_refs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Analyzes clauses and cross-references for legal contradictions, parameter mismatches, 
    and conflicting obligations. Returns structured explainable risk reports.
    """
    contradictions = []
    
    # 1. Parameter extraction for each clause
    extracted_data = []
    for clause in clauses:
        params = extract_clause_parameters(clause["text"], clause["title"])
        clause["extracted_params"] = params
        extracted_data.append({
            "clause": clause,
            "params": params
        })
        
    # Build fast lookup dictionary by section number
    sec_lookup = {c["section_number"]: c for c in clauses}
    
    # Pairwise comparison across cross-references and same-category sections
    checked_pairs = set()
    
    for ref in cross_refs:
        src_sec = ref["source_section"]
        tgt_sec = ref["target_section"]
        
        src_clause = sec_lookup.get(src_sec)
        tgt_clause = sec_lookup.get(tgt_sec)
        
        if not src_clause or not tgt_clause or src_sec == tgt_sec:
            continue
            
        pair_key = tuple(sorted([src_sec, tgt_sec]))
        if pair_key in checked_pairs:
            continue
        checked_pairs.add(pair_key)
        
        # Run parameter mismatch detection engine
        conflict = detect_clause_pair_conflict(src_clause, tgt_clause)
        if conflict:
            contradictions.append(conflict)
            src_clause["has_contradiction"] = True
            tgt_clause["has_contradiction"] = True
            
    # Also check all clauses in identical categories even if not directly cross-referenced
    for i in range(len(clauses)):
        for j in range(i + 1, len(clauses)):
            c1 = clauses[i]
            c2 = clauses[j]
            
            pair_key = tuple(sorted([c1["section_number"], c2["section_number"]]))
            if pair_key in checked_pairs:
                continue
                
            if c1["category"] == c2["category"] and c1["category"] != "General Obligations":
                conflict = detect_clause_pair_conflict(c1, c2)
                if conflict:
                    checked_pairs.add(pair_key)
                    contradictions.append(conflict)
                    c1["has_contradiction"] = True
                    c2["has_contradiction"] = True

    return contradictions

def extract_clause_parameters(text: str, title: str) -> Dict[str, Any]:
    """Extracts quantifiable legal parameters such as days, dollar caps, states, and IP ownership."""
    combined = (title + "\n" + text).lower()
    
    params = {
        "payment_days": None,
        "notice_days": None,
        "liability_cap": None,
        "ip_owner": None,
        "governing_state": None
    }
    
    # 1. Payment days regex (e.g. "within 30 days", "net 45 days", "30 calendar days")
    pay_match = re.search(r'\b(?:within|net|in|due)\s*(\d+)\s*(?:business|calendar)?\s*days\b', combined)
    if pay_match and ("pay" in combined or "invoice" in combined or "fee" in combined):
        params["payment_days"] = int(pay_match.group(1))
        
    # 2. Notice days regex (e.g. "notice of 30 days", "written notice at least 60 days")
    notice_match = re.search(r'\b(?:notice|prior notice|written notice)\s*(?:of|at least|giving)?\s*(\d+)\s*days\b', combined)
    if not notice_match:
        notice_match = re.search(r'\b(\d+)\s*days(?:\'?|\s+)(?:prior\s+)?written\s+notice\b', combined)
    if notice_match and ("terminat" in combined or "cancel" in combined or "notice" in combined):
        params["notice_days"] = int(notice_match.group(1))
        
    # 3. Liability Cap (e.g. "$500,000", "500,000 USD", "total contract fees")
    cap_match = re.search(r'\$\s*([\d,]+)|([\d,]+)\s*(?:USD|dollars)', text)
    if cap_match and ("liabil" in combined or "damages" in combined or "cap" in combined or "limit" in combined):
        num_str = (cap_match.group(1) or cap_match.group(2)).replace(',', '')
        params["liability_cap"] = int(num_str)
    elif ("total fees" in combined or "contract value" in combined or "fees paid" in combined) and "liabil" in combined:
        params["liability_cap"] = "TOTAL_CONTRACT_FEES"
        
    # 4. IP Owner
    if "intellectual property" in combined or "ip right" in combined or "work product" in combined or "ownership" in combined:
        if "exclusive property of client" in combined or "client shall own" in combined or "assigned to client" in combined:
            params["ip_owner"] = "CLIENT"
        elif "provider retains" in combined or "vendor retains" in combined or "exclusive property of provider" in combined:
            params["ip_owner"] = "PROVIDER"
            
    # 5. Governing State
    state_match = re.search(r'\b(?:state of|laws of)\s+(delaware|new york|california|texas|florida|illinois|uk|england)\b', combined)
    if state_match:
        params["governing_state"] = state_match.group(1).title()
        
    return params

def detect_clause_pair_conflict(c1: Dict[str, Any], c2: Dict[str, Any]) -> Dict[str, Any]:
    """Compares two clauses to find specific parameter mismatches and return detailed risk report."""
    p1 = c1.get("extracted_params", extract_clause_parameters(c1["text"], c1["title"]))
    p2 = c2.get("extracted_params", extract_clause_parameters(c2["text"], c2["title"]))
    
    sec1 = c1["section_number"]
    sec2 = c2["section_number"]
    
    # 1. Payment Terms Conflict
    if p1["payment_days"] is not None and p2["payment_days"] is not None and p1["payment_days"] != p2["payment_days"]:
        return {
            "id": f"cntr_{uuid.uuid4().hex[:8]}",
            "source_section": sec1,
            "source_clause_title": c1["title"],
            "source_text": c1["text"],
            "target_section": sec2,
            "target_clause_title": c2["title"],
            "target_text": c2["text"],
            "severity": "HIGH",
            "confidence_score": 0.96,
            "category": "Payment Terms",
            "source_value": f"{p1['payment_days']} Days",
            "target_value": f"{p2['payment_days']} Days",
            "explanation": f"Conflict detected in payment timeline: {sec1} mandates payment within {p1['payment_days']} days, whereas {sec2} specifies payment within {p2['payment_days']} days. This creates ambiguity regarding default payment terms and cash flow timelines.",
            "suggested_action": f"Harmonize payment schedules across both sections. Standardize on either {p1['payment_days']} or {p2['payment_days']} days, or explicitly reference '{sec1} controls notwithstanding {sec2}'."
        }

    # 2. Termination Notice Conflict
    if p1["notice_days"] is not None and p2["notice_days"] is not None and p1["notice_days"] != p2["notice_days"]:
        return {
            "id": f"cntr_{uuid.uuid4().hex[:8]}",
            "source_section": sec1,
            "source_clause_title": c1["title"],
            "source_text": c1["text"],
            "target_section": sec2,
            "target_clause_title": c2["title"],
            "target_text": c2["text"],
            "severity": "HIGH",
            "confidence_score": 0.94,
            "category": "Termination & Notice",
            "source_value": f"{p1['notice_days']} Days Notice",
            "target_value": f"{p2['notice_days']} Days Notice",
            "explanation": f"Termination notice period discrepancy: {sec1} requires a notice window of {p1['notice_days']} days, but {sec2} stipulates a notice period of {p2['notice_days']} days. If either party provides notice, the valid termination date would be disputed.",
            "suggested_action": f"Align notice requirements to a single mandatory time period (e.g., standardizing on {max(p1['notice_days'], p2['notice_days'])} days) or clarify whether convenience vs cause termination notice periods differ."
        }

    # 3. Limitation of Liability Conflict
    if p1["liability_cap"] is not None and p2["liability_cap"] is not None and p1["liability_cap"] != p2["liability_cap"]:
        v1_str = f"${p1['liability_cap']:,}" if isinstance(p1['liability_cap'], int) else str(p1['liability_cap'])
        v2_str = f"${p2['liability_cap']:,}" if isinstance(p2['liability_cap'], int) else str(p2['liability_cap'])
        return {
            "id": f"cntr_{uuid.uuid4().hex[:8]}",
            "source_section": sec1,
            "source_clause_title": c1["title"],
            "source_text": c1["text"],
            "target_section": sec2,
            "target_clause_title": c2["title"],
            "target_text": c2["text"],
            "severity": "HIGH",
            "confidence_score": 0.95,
            "category": "Limitation of Liability",
            "source_value": f"Cap: {v1_str}",
            "target_value": f"Cap: {v2_str}",
            "explanation": f"Inconsistent liability threshold: {sec1} caps total damages at {v1_str}, while {sec2} states liability is capped at {v2_str}. In litigation, this creates severe risk regarding maximum exposure.",
            "suggested_action": f"Reconcile liability caps in {sec1} and {sec2}. Add an explicit precedence clause (e.g., 'In the event of conflict, the liability ceiling in {sec1} shall supersede')."
        }

    # 4. Intellectual Property Rights Collision
    if p1["ip_owner"] is not None and p2["ip_owner"] is not None and p1["ip_owner"] != p2["ip_owner"]:
        return {
            "id": f"cntr_{uuid.uuid4().hex[:8]}",
            "source_section": sec1,
            "source_clause_title": c1["title"],
            "source_text": c1["text"],
            "target_section": sec2,
            "target_clause_title": c2["title"],
            "target_text": c2["text"],
            "severity": "HIGH",
            "confidence_score": 0.92,
            "category": "Intellectual Property",
            "source_value": f"Owner: {p1['ip_owner']}",
            "target_value": f"Owner: {p2['ip_owner']}",
            "explanation": f"Direct ownership conflict for intellectual property: {sec1} assigns all deliverables and IP exclusively to {p1['ip_owner']}, while {sec2} states that {p2['ip_owner']} retains exclusive title to all created assets.",
            "suggested_action": "Clarify background IP vs newly created work product. Ensure exclusive ownership of custom deliverables is granted to Client while Provider retains pre-existing tools under license."
        }

    # 5. Governing Law Jurisdiction Conflict
    if p1["governing_state"] is not None and p2["governing_state"] is not None and p1["governing_state"] != p2["governing_state"]:
        return {
            "id": f"cntr_{uuid.uuid4().hex[:8]}",
            "source_section": sec1,
            "source_clause_title": c1["title"],
            "source_text": c1["text"],
            "target_section": sec2,
            "target_clause_title": c2["title"],
            "target_text": c2["text"],
            "severity": "MEDIUM",
            "confidence_score": 0.90,
            "category": "Governing Law",
            "source_value": f"Jurisdiction: {p1['governing_state']}",
            "target_value": f"Jurisdiction: {p2['governing_state']}",
            "explanation": f"Jurisdictional conflict: {sec1} specifies jurisdiction in {p1['governing_state']}, whereas {sec2} designates {p2['governing_state']} as the governing venue for dispute resolution.",
            "suggested_action": f"Select a single governing law and forum (e.g. State of {p1['governing_state']}) across the entire agreement to avoid costly jurisdictional motions."
        }

    return None
