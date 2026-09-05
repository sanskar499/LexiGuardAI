import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.database import engine, SessionLocal, Base
from backend.app.main import process_and_save_contract
from backend.app.seed_data import get_sample_contract

def run_test():
    print("Testing LexiGuard AI Backend pipeline...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    sample = get_sample_contract()
    contract = process_and_save_contract(
        db=db,
        title=sample["title"],
        filename=sample["filename"],
        file_type=sample["file_type"],
        text=sample["raw_text"]
    )
    
    print(f"[SUCCESS] Contract Processed: {contract.title} (ID: {contract.id})")
    print(f"   Total Clauses Extracted: {contract.clause_count}")
    print(f"   Cross-References Found: {contract.cross_ref_count}")
    print(f"   Contradictions Flagged: {contract.contradiction_count}")
    print(f"   High Risks: {contract.high_risk_count}, Medium Risks: {contract.med_risk_count}")
    
    print("\n--- Flagged Contradictions Summary ---")
    for idx, c in enumerate(contract.contradictions, 1):
        print(f"[{idx}] [{c.severity}] Category: {c.category}")
        print(f"    Source: {c.source_section} ({c.source_value}) <== CONFLICT ==> Target: {c.target_section} ({c.target_value})")
        print(f"    Explanation: {c.explanation[:120]}...")
        print(f"    Suggested Action: {c.suggested_action[:120]}...\n")
        
    db.close()
    print("[SUCCESS] All backend pipeline tests PASSED successfully!")

if __name__ == '__main__':
    run_test()
