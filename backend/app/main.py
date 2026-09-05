import uuid
from typing import List
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .models import ContractModel, ClauseModel, CrossReferenceModel, ContradictionModel
from .schemas import ContractSummarySchema, ContractDetailSchema
from .parser import extract_text_from_file, parse_contract_into_clauses
from .cross_ref import detect_cross_references
from .contradiction_engine import analyze_contradictions
from .seed_data import SAMPLE_CONTRACT_TEXT, get_sample_contract
from .demo_ui import DEMO_HTML

# Create Database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LexiGuard AI API",
    description="Legal Tech Contradiction Detection Engine for Contract Cross-References",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "LexiGuard AI Legal Tech Backend Operating Normally. Visit /app for interactive dashboard.", "status": "online", "dashboard": "/app"}

@app.get("/app", response_class=HTMLResponse)
@app.get("/demo", response_class=HTMLResponse)
def get_interactive_app():
    return HTMLResponse(content=DEMO_HTML, status_code=200)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "LexiGuard AI"}

@app.get("/api/contracts", response_model=List[ContractSummarySchema])
def list_contracts(db: Session = Depends(get_db)):
    contracts = db.query(ContractModel).order_by(ContractModel.upload_date.desc()).all()
    return contracts

@app.get("/api/contracts/{contract_id}", response_model=ContractDetailSchema)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@app.delete("/api/contracts/{contract_id}")
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully", "id": contract_id}

@app.post("/api/contracts/sample", response_model=ContractDetailSchema)
def create_sample_contract(db: Session = Depends(get_db)):
    """Loads the prebuilt Master Services Agreement with intentional hackathon contradictions."""
    sample = get_sample_contract()
    return process_and_save_contract(
        db=db,
        title=sample["title"],
        filename=sample["filename"],
        file_type=sample["file_type"],
        text=sample["raw_text"]
    )

@app.post("/api/contracts/upload", response_model=ContractDetailSchema)
async def upload_contract(
    file: UploadFile = File(None),
    raw_text: str = Form(None),
    title: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file and not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a file upload or raw_text string must be provided."
        )

    if file:
        filename = file.filename
        content = await file.read()
        file_type = filename.split('.')[-1] if '.' in filename else 'txt'
        extracted_text = extract_text_from_file(content, filename)
        doc_title = title if title else filename
    else:
        filename = "pasted_contract.txt"
        file_type = "txt"
        extracted_text = raw_text
        doc_title = title if title else "Uploaded Custom Contract"

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract readable text from contract.")

    return process_and_save_contract(
        db=db,
        title=doc_title,
        filename=filename,
        file_type=file_type,
        text=extracted_text
    )

def process_and_save_contract(db: Session, title: str, filename: str, file_type: str, text: str) -> ContractModel:
    contract_id = f"cntr_{uuid.uuid4().hex[:8]}"
    
    # 1. Parse into clauses
    parsed_clauses = parse_contract_into_clauses(text)
    
    # Generate clause models
    clause_models = []
    clause_dicts = []
    for idx, c in enumerate(parsed_clauses):
        c_id = f"cls_{uuid.uuid4().hex[:8]}"
        c["id"] = c_id
        clause_dicts.append(c)
        
        clause_models.append(ClauseModel(
            id=c_id,
            contract_id=contract_id,
            section_number=c["section_number"],
            title=c["title"],
            text=c["text"],
            category=c["category"],
            has_contradiction=0,
            extracted_params={}
        ))
        
    # 2. Detect cross references
    cross_refs_data = detect_cross_references(clause_dicts)
    ref_models = []
    for ref in cross_refs_data:
        ref_id = f"xref_{uuid.uuid4().hex[:8]}"
        ref_models.append(CrossReferenceModel(
            id=ref_id,
            contract_id=contract_id,
            source_clause_id=ref["source_clause_id"],
            source_section=ref["source_section"],
            target_clause_id=ref["target_clause_id"],
            target_section=ref["target_section"],
            reference_text=ref["reference_text"],
            ref_type=ref["ref_type"]
        ))
        
    # 3. Detect contradictions
    contradictions_data = analyze_contradictions(clause_dicts, cross_refs_data)
    cntr_models = []
    high_count, med_count, low_count = 0, 0, 0
    
    for cntr in contradictions_data:
        cntr_id = cntr["id"]
        sev = cntr["severity"]
        if sev == "HIGH":
            high_count += 1
        elif sev == "MEDIUM":
            med_count += 1
        else:
            low_count += 1
            
        cntr_models.append(ContradictionModel(
            id=cntr_id,
            contract_id=contract_id,
            source_section=cntr["source_section"],
            source_clause_title=cntr["source_clause_title"],
            source_text=cntr["source_text"],
            target_section=cntr["target_section"],
            target_clause_title=cntr["target_clause_title"],
            target_text=cntr["target_text"],
            severity=sev,
            confidence_score=cntr["confidence_score"],
            category=cntr["category"],
            source_value=cntr["source_value"],
            target_value=cntr["target_value"],
            explanation=cntr["explanation"],
            suggested_action=cntr["suggested_action"]
        ))

    # Update clause has_contradiction field
    for cm in clause_models:
        # check if this section was flagged in contradictions
        for cntr in contradictions_data:
            if cm.section_number == cntr["source_section"] or cm.section_number == cntr["target_section"]:
                cm.has_contradiction = 1
                break

    # Save Contract record
    contract_rec = ContractModel(
        id=contract_id,
        title=title,
        filename=filename,
        file_type=file_type,
        clause_count=len(clause_models),
        cross_ref_count=len(ref_models),
        contradiction_count=len(cntr_models),
        high_risk_count=high_count,
        med_risk_count=med_count,
        low_risk_count=low_count,
        raw_text=text
    )
    
    db.add(contract_rec)
    db.commit()
    
    for cm in clause_models:
        db.add(cm)
    for rm in ref_models:
        db.add(rm)
    for cntr_m in cntr_models:
        db.add(cntr_m)
        
    db.commit()
    db.refresh(contract_rec)
    return contract_rec
