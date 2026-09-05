# LexiGuard AI — Legal Tech Contradiction Detection Engine

**Hackathon Problem HF3-SW-11**: Legal Tech — Contradiction Detection Across a Contract's Cross-References.

LexiGuard AI is an automated Legal-Tech dashboard and deterministic NLP engine designed to parse complex legal contracts (PDF, DOCX, TXT), extract clauses & parameter obligations, map inter-section cross-references into an interactive dependency network graph, and flag contradictory provisions with explainable risk reports.

---

## 🌟 Key Features

1. **Deterministic Rule-Based Legal Engine**: Runs 100% offline without requiring external API keys. Automatically extracts:
   - **Payment Timelines** (e.g. Net 30 vs Net 45 days)
   - **Termination Notice Windows** (e.g. 30 days vs 60 days)
   - **Limitation of Liability Caps** (e.g. $500,000 fixed cap vs $2,000,000 contract value)
   - **Intellectual Property Retention** (e.g. Exclusive Client work-for-hire vs Provider retained title)
   - **Governing Law & Jurisdiction** (e.g. State of Delaware vs State of New York)
2. **Interactive 3-Column Studio Workspace**:
   - **Left**: Contract viewer with section search, category filtering, and inline risk highlighting.
   - **Center**: Interactive cross-reference network graph visualizer (normal cyan references vs red pulsed contradiction links).
   - **Right**: Explainable Risk Report panel with severity badges (`HIGH`, `MEDIUM`, `LOW`), confidence scores, parameter comparisons, legal impact breakdown, and suggested amendment actions.
3. **Instant Hackathon Demo Mode**: Pre-loaded with a realistic *Master Services Agreement* containing 5 intentional legal contradictions for instant hackathon presentation.
4. **Side-by-Side Clause Diff Modal**: Deep comparison view comparing source vs target clauses with highlighted value mismatches.

---

## 📁 Repository Structure

```
HackFinity/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI server & route handlers
│   │   ├── database.py                # SQLite database configuration
│   │   ├── models.py                  # SQLAlchemy ORM models
│   │   ├── schemas.py                 # Pydantic request/response schemas
│   │   ├── parser.py                  # PDF / DOCX / TXT section extractor
│   │   ├── cross_ref.py               # Cross-reference dependency resolver
│   │   ├── contradiction_engine.py    # Rule-based contradiction detection
│   │   ├── seed_data.py               # Prebuilt demo contract text
│   │   └── demo_ui.py                 # Zero-build standalone web app fallback
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   └── run.py                         # Backend launcher script
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Main Dashboard Page
│   │   ├── analysis/[id]/page.tsx     # 3-Column Analysis Studio Page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── StatCards.tsx
│   │   ├── ContractViewer.tsx
│   │   ├── NetworkGraph.tsx
│   │   ├── ContradictionPanel.tsx
│   │   ├── UploadModal.tsx
│   │   └── ClauseDiffModal.tsx
│   ├── lib/
│   │   └── api.ts                     # API Client with backend fallback
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── next.config.js
│   └── .env.example
├── sample_contract_master_services_agreement.txt   # Sample legal contract
├── test_backend.py                                  # Pipeline verification script
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** (for Next.js frontend)

---

### Step 1: Start Backend (Python FastAPI)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python run.py
   ```
   *The backend will start at `http://localhost:8000`.*
   *API documentation will be accessible at `http://localhost:8000/docs`.*
   *Interactive web application fallback is accessible at `http://localhost:8000/app`.*

---

### Step 2: Start Frontend (Next.js)

1. Open a second terminal window and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The Next.js dashboard will start at `http://localhost:3000`.*

---

## 🧪 Testing & Verification

You can verify the backend legal analysis pipeline instantly by running:
```bash
python test_backend.py
```
This executes the parsing, cross-reference linking, parameter extraction, and contradiction engine, outputting 5 flagged conflicts with severities, confidence scores, and explanations.

---

## ⚖️ Intentional Demo Contradictions Included

The sample *Master Services Agreement* included in the project features 5 realistic legal contradictions:
1. **Section 4.2 vs Section 9.1**: Payment due in **30 days** vs **45 days**.
2. **Section 6.1 vs Section 11.2**: Termination notice period of **30 days** vs **60 days**.
3. **Section 5.3 vs Section 14.4**: Limitation of liability cap of **$500,000** vs **$2,000,000** (total fees).
4. **Section 3.4 vs Section 12.1**: Exclusive IP ownership assigned to **Client** vs **Provider** retaining title.
5. **Section 8.1 vs Section 15.2**: Governing law and jurisdiction in **State of Delaware** vs **State of New York**.

---

## 🎨 Design Philosophy
- **Modern Dark Legal-Tech SaaS Aesthetic**: Dark navy (`#060913`, `#0B0F19`), sleek slate borders, cyan/blue highlights, and glowing risk indicators.
- **Glassmorphism & Micro-animations**: Interactive node selection, red pulsing conflict edges, filter tab animations.
