from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class ContractModel(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    filename = Column(String)
    file_type = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    clause_count = Column(Integer, default=0)
    cross_ref_count = Column(Integer, default=0)
    contradiction_count = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    med_risk_count = Column(Integer, default=0)
    low_risk_count = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)

    clauses = relationship("ClauseModel", back_populates="contract", cascade="all, delete-orphan")
    cross_references = relationship("CrossReferenceModel", back_populates="contract", cascade="all, delete-orphan")
    contradictions = relationship("ContradictionModel", back_populates="contract", cascade="all, delete-orphan")

class ClauseModel(Base):
    __tablename__ = "clauses"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True)
    section_number = Column(String, index=True)
    title = Column(String)
    text = Column(Text)
    category = Column(String, default="General")
    has_contradiction = Column(Integer, default=0) # 0 or 1
    extracted_params = Column(JSON, nullable=True) # e.g. {"payment_days": 30, "notice_days": None, "liability_cap": 500000}

    contract = relationship("ContractModel", back_populates="clauses")

class CrossReferenceModel(Base):
    __tablename__ = "cross_references"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True)
    source_clause_id = Column(String, ForeignKey("clauses.id"))
    source_section = Column(String)
    target_clause_id = Column(String, ForeignKey("clauses.id"), nullable=True)
    target_section = Column(String)
    reference_text = Column(Text)
    ref_type = Column(String, default="EXPLICIT") # EXPLICIT or IMPLICIT_SEMANTIC

    contract = relationship("ContractModel", back_populates="cross_references")

class ContradictionModel(Base):
    __tablename__ = "contradictions"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True)
    source_section = Column(String)
    source_clause_title = Column(String)
    source_text = Column(Text)
    target_section = Column(String)
    target_clause_title = Column(String)
    target_text = Column(Text)
    severity = Column(String) # HIGH, MEDIUM, LOW
    confidence_score = Column(Float) # e.g. 0.95
    category = Column(String) # Payment Terms, Termination, Liability, IP Rights, Governing Law
    source_value = Column(String) # e.g. "30 Days"
    target_value = Column(String) # e.g. "45 Days"
    explanation = Column(Text)
    suggested_action = Column(Text)

    contract = relationship("ContractModel", back_populates="contradictions")
