from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ClauseSchema(BaseModel):
    id: str
    section_number: str
    title: str
    text: str
    category: str
    has_contradiction: bool
    extracted_params: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class CrossReferenceSchema(BaseModel):
    id: str
    source_clause_id: str
    source_section: str
    target_clause_id: Optional[str] = None
    target_section: str
    reference_text: str
    ref_type: str

    class Config:
        from_attributes = True

class ContradictionSchema(BaseModel):
    id: str
    source_section: str
    source_clause_title: str
    source_text: str
    target_section: str
    target_clause_title: str
    target_text: str
    severity: str
    confidence_score: float
    category: str
    source_value: str
    target_value: str
    explanation: str
    suggested_action: str

    class Config:
        from_attributes = True

class ContractSummarySchema(BaseModel):
    id: str
    title: str
    filename: str
    file_type: str
    upload_date: datetime
    clause_count: int
    cross_ref_count: int
    contradiction_count: int
    high_risk_count: int
    med_risk_count: int
    low_risk_count: int

    class Config:
        from_attributes = True

class ContractDetailSchema(ContractSummarySchema):
    raw_text: Optional[str] = None
    clauses: List[ClauseSchema] = []
    cross_references: List[CrossReferenceSchema] = []
    contradictions: List[ContradictionSchema] = []

    class Config:
        from_attributes = True
