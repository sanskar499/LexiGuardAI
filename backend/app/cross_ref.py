import re
from typing import List, Dict, Any

def detect_cross_references(clauses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extracts cross-references between sections in the contract.
    Identifies explicit mentions (e.g. "Section 4.2", "Clause 9.1")
    as well as implicit semantic category links.
    """
    cross_refs = []
    
    # Regex to capture section mentions like "Section 4.2", "Clause 9.1", "Section 11"
    ref_pattern = re.compile(
        r'\b(?:Section|Clause|Article|Paragraph)\s+(\d+(?:\.\d+)*)\b',
        re.IGNORECASE
    )
    
    # Map section numbers to clause indices for easy lookup
    section_map = {}
    for idx, c in enumerate(clauses):
        sec_num = c["section_number"].replace("Section ", "").replace("Clause ", "").replace("Article ", "").strip()
        section_map[sec_num] = c
        
    for source in clauses:
        source_sec = source["section_number"]
        matches = ref_pattern.finditer(source["text"])
        
        for match in matches:
            target_num = match.group(1)
            full_ref = match.group(0)
            
            # Avoid self-reference
            if target_num in source_sec:
                continue
                
            # Find surrounding snippet context
            start = max(0, match.start() - 40)
            end = min(len(source["text"]), match.end() + 60)
            ref_snippet = source["text"][start:end].replace('\n', ' ').strip()
            
            # Find matching target clause
            target_clause = section_map.get(target_num)
            target_sec_label = f"Section {target_num}" if not target_num.startswith("Section") else target_num
            
            cross_refs.append({
                "source_clause_id": source.get("id", f"clause_{source_sec}"),
                "source_section": source_sec,
                "target_clause_id": target_clause.get("id") if target_clause else None,
                "target_section": target_sec_label,
                "reference_text": f"...{ref_snippet}...",
                "ref_type": "EXPLICIT"
            })
            
    # Also add implicit category references between related topic sections (e.g. two payment sections)
    category_groups = {}
    for c in clauses:
        cat = c["category"]
        if cat not in category_groups:
            category_groups[cat] = []
        category_groups[cat].append(c)
        
    for cat, cat_clauses in category_groups.items():
        if cat == "General Obligations" or len(cat_clauses) < 2:
            continue
        # Link clauses in the same category if not already linked explicitly
        for i in range(len(cat_clauses)):
            for j in range(i + 1, len(cat_clauses)):
                c1, c2 = cat_clauses[i], cat_clauses[j]
                
                # Check if explicit link already exists
                already_exists = any(
                    (cr["source_section"] == c1["section_number"] and cr["target_section"] == c2["section_number"]) or
                    (cr["source_section"] == c2["section_number"] and cr["target_section"] == c1["section_number"])
                    for cr in cross_refs
                )
                
                if not already_exists:
                    cross_refs.append({
                        "source_clause_id": c1.get("id", f"clause_{c1['section_number']}"),
                        "source_section": c1["section_number"],
                        "target_clause_id": c2.get("id", f"clause_{c2['section_number']}"),
                        "target_section": c2["section_number"],
                        "reference_text": f"Implicit semantic relationship: Both clauses define terms for '{cat}'",
                        "ref_type": "IMPLICIT_SEMANTIC"
                    })
                    
    return cross_refs
