export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');


export interface Clause {
  id: str;
  section_number: string;
  title: string;
  text: string;
  category: string;
  has_contradiction: boolean;
  extracted_params?: any;
}

export interface CrossReference {
  id: string;
  source_clause_id: string;
  source_section: string;
  target_clause_id?: string;
  target_section: string;
  reference_text: string;
  ref_type: string;
}

export interface Contradiction {
  id: string;
  source_section: string;
  source_clause_title: string;
  source_text: string;
  target_section: string;
  target_clause_title: string;
  target_text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  category: string;
  source_value: string;
  target_value: string;
  explanation: string;
  suggested_action: string;
}

export interface ContractSummary {
  id: string;
  title: string;
  filename: string;
  file_type: string;
  upload_date: string;
  clause_count: number;
  cross_ref_count: number;
  contradiction_count: number;
  high_risk_count: number;
  med_risk_count: number;
  low_risk_count: number;
}

export interface ContractDetail extends ContractSummary {
  raw_text?: string;
  clauses: Clause[];
  cross_references: CrossReference[];
  contradictions: Contradiction[];
}

export async function fetchContracts(): Promise<ContractSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contracts`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning sample list");
    return [
      {
        id: "demo-sample-msa",
        title: "Master Services Agreement (Apex & Novasphere)",
        filename: "master_services_agreement.txt",
        file_type: "txt",
        upload_date: new Date().toISOString(),
        clause_count: 12,
        cross_ref_count: 5,
        contradiction_count: 5,
        high_risk_count: 4,
        med_risk_count: 1,
        low_risk_count: 0
      }
    ];
  }
}

export async function fetchContractDetail(id: string): Promise<ContractDetail> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contracts/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contract detail');
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning sample detail");
    return getFallbackContractDetail(id);
  }
}

export async function loadSampleContract(): Promise<ContractDetail> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contracts/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to load sample contract');
    return await res.json();
  } catch (err) {
    return getFallbackContractDetail("demo-sample-msa");
  }
}

export async function uploadContractFile(formData: FormData): Promise<ContractDetail> {
  const res = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Upload failed');
  }
  return await res.json();
}

export async function deleteContract(id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/contracts/${id}`, { method: 'DELETE' });
}

function getFallbackContractDetail(id: string): ContractDetail {
  return {
    id: id || "demo-sample-msa",
    title: "Master Services Agreement (Apex Enterprise & Novasphere Systems)",
    filename: "master_services_agreement.txt",
    file_type: "txt",
    upload_date: new Date().toISOString(),
    clause_count: 12,
    cross_ref_count: 5,
    contradiction_count: 5,
    high_risk_count: 4,
    med_risk_count: 1,
    low_risk_count: 0,
    clauses: [
      {
        id: "c1",
        section_number: "Section 1.1",
        title: "Services Rendered",
        text: "Provider agrees to deliver enterprise cloud implementation, artificial intelligence integration, and custom software development services as specified in attached Statements of Work ('SOW').",
        category: "General Obligations",
        has_contradiction: false
      },
      {
        id: "c2",
        section_number: "Section 4.2",
        title: "Payment Terms",
        text: "Client shall pay all undisputed invoices within 30 days of the invoice date. Late payments shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by law.",
        category: "Payment Terms",
        has_contradiction: true
      },
      {
        id: "c3",
        section_number: "Section 9.1",
        title: "Invoicing and Payment Schedule",
        text: "As referenced in Section 4.2, Client shall review and settle all submitted monthly billing statements. All undisputed invoices must be paid in full by Client within 45 days of receipt.",
        category: "Payment Terms",
        has_contradiction: true
      },
      {
        id: "c4",
        section_number: "Section 6.1",
        title: "Termination for Convenience",
        text: "Either party may terminate this Agreement or any SOW at any time without cause by providing at least 30 days prior written notice to the other party.",
        category: "Termination & Notice",
        has_contradiction: true
      },
      {
        id: "c5",
        section_number: "Section 11.2",
        title: "Termination Notice Requirements",
        text: "Notwithstanding Section 6.1 or any prior provision to the contrary, in order to effectively terminate this Agreement or any active SOW, the terminating party must provide at least 60 days written notice to the executive officers of the non-terminating party.",
        category: "Termination & Notice",
        has_contradiction: true
      },
      {
        id: "c6",
        section_number: "Section 5.3",
        title: "Limitation of Liability Cap",
        text: "Notwithstanding anything to the contrary in this Agreement, Provider's aggregate monetary liability arising out of or related to this Agreement, whether in contract, tort, or otherwise, shall be capped at $500,000.",
        category: "Limitation of Liability",
        has_contradiction: true
      },
      {
        id: "c7",
        section_number: "Section 14.4",
        title: "Maximum Aggregate Liability Ceiling",
        text: "Subject to Section 5.3, the maximum cumulative aggregate monetary liability of either party for all claims arising out of this Agreement shall be limited to total contract fees paid by Client ($2,000,000 USD).",
        category: "Limitation of Liability",
        has_contradiction: true
      },
      {
        id: "c8",
        section_number: "Section 3.4",
        title: "Work Product & IP Ownership",
        text: "All deliverables, software code, designs, and documentation developed by Provider specifically for Client under this Agreement shall be considered 'works made for hire' and shall be the sole and exclusive property of Client upon payment in full.",
        category: "Intellectual Property",
        has_contradiction: true
      },
      {
        id: "c9",
        section_number: "Section 12.1",
        title: "Provider Intellectual Property Retention",
        text: "Subject to Section 3.4, Provider retains all right, title, and interest in and to all pre-existing software, frameworks, algorithms, and any proprietary IP rights created, modified, or developed during the performance of the engagement.",
        category: "Intellectual Property",
        has_contradiction: true
      },
      {
        id: "c10",
        section_number: "Section 8.1",
        title: "Governing Law and Venue",
        text: "This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.",
        category: "Governing Law & Dispute Resolution",
        has_contradiction: true
      },
      {
        id: "c11",
        section_number: "Section 15.2",
        title: "Dispute Resolution & Jurisdiction",
        text: "Subject to Section 8.1, any dispute, controversy, or claim arising out of or relating to this Agreement shall be submitted to binding arbitration located exclusively in the State of New York.",
        category: "Governing Law & Dispute Resolution",
        has_contradiction: true
      }
    ],
    cross_references: [
      {
        id: "xr1",
        source_clause_id: "c3",
        source_section: "Section 9.1",
        target_clause_id: "c2",
        target_section: "Section 4.2",
        reference_text: "As referenced in Section 4.2, Client shall review...",
        ref_type: "EXPLICIT"
      },
      {
        id: "xr2",
        source_clause_id: "c5",
        source_section: "Section 11.2",
        target_clause_id: "c4",
        target_section: "Section 6.1",
        reference_text: "Notwithstanding Section 6.1 or any prior provision...",
        ref_type: "EXPLICIT"
      },
      {
        id: "xr3",
        source_clause_id: "c7",
        source_section: "Section 14.4",
        target_clause_id: "c6",
        target_section: "Section 5.3",
        reference_text: "Subject to Section 5.3, the maximum cumulative liability...",
        ref_type: "EXPLICIT"
      },
      {
        id: "xr4",
        source_clause_id: "c9",
        source_section: "Section 12.1",
        target_clause_id: "c8",
        target_section: "Section 3.4",
        reference_text: "Subject to Section 3.4, Provider retains all right, title...",
        ref_type: "EXPLICIT"
      },
      {
        id: "xr5",
        source_clause_id: "c11",
        source_section: "Section 15.2",
        target_clause_id: "c10",
        target_section: "Section 8.1",
        reference_text: "Subject to Section 8.1, any dispute shall be submitted to binding arbitration in State of New York...",
        ref_type: "EXPLICIT"
      }
    ],
    contradictions: [
      {
        id: "cntr_pay",
        source_section: "Section 4.2",
        source_clause_title: "Payment Terms",
        source_text: "Client shall pay all undisputed invoices within 30 days of the invoice date.",
        target_section: "Section 9.1",
        target_clause_title: "Invoicing and Payment Schedule",
        target_text: "As referenced in Section 4.2... All undisputed invoices must be paid in full by Client within 45 days of receipt.",
        severity: "HIGH",
        confidence_score: 0.96,
        category: "Payment Terms",
        source_value: "30 Days",
        target_value: "45 Days",
        explanation: "Conflict detected in payment timeline: Section 4.2 mandates payment within 30 days, whereas Section 9.1 specifies payment within 45 days. This creates legal ambiguity regarding default interest rates and cash flow expectations.",
        suggested_action: "Harmonize payment schedules across both sections. Standardize on either 30 or 45 days, or explicitly state that Section 4.2 supersedes."
      },
      {
        id: "cntr_term",
        source_section: "Section 6.1",
        source_clause_title: "Termination for Convenience",
        source_text: "Either party may terminate this Agreement by providing at least 30 days prior written notice.",
        target_section: "Section 11.2",
        target_clause_title: "Termination Notice Requirements",
        target_text: "Notwithstanding Section 6.1... terminating party must provide at least 60 days written notice.",
        severity: "HIGH",
        confidence_score: 0.94,
        category: "Termination & Notice",
        source_value: "30 Days Notice",
        target_value: "60 Days Notice",
        explanation: "Termination notice period discrepancy: Section 6.1 requires a notice window of 30 days, but Section 11.2 stipulates a notice period of 60 days. If either party provides notice, the valid termination date would be disputed in court.",
        suggested_action: "Align notice requirements to a single mandatory time period (60 days recommended for enterprise engagements)."
      },
      {
        id: "cntr_liab",
        source_section: "Section 5.3",
        source_clause_title: "Limitation of Liability Cap",
        source_text: "Provider's aggregate monetary liability arising out of this Agreement shall be capped at $500,000.",
        target_section: "Section 14.4",
        target_clause_title: "Maximum Aggregate Liability Ceiling",
        target_text: "Subject to Section 5.3, the maximum cumulative aggregate monetary liability shall be limited to total contract fees paid ($2,000,000 USD).",
        severity: "HIGH",
        confidence_score: 0.95,
        category: "Limitation of Liability",
        source_value: "Cap: $500,000",
        target_value: "Cap: $2,000,000",
        explanation: "Inconsistent liability threshold: Section 5.3 caps total damages at $500,000, while Section 14.4 states liability is capped at total contract fees ($2,000,000). In litigation, this creates severe exposure uncertainty.",
        suggested_action: "Reconcile liability caps in Section 5.3 and Section 14.4. Add explicit order-of-precedence wording."
      },
      {
        id: "cntr_ip",
        source_section: "Section 3.4",
        source_clause_title: "Work Product & IP Ownership",
        source_text: "All deliverables and documentation developed by Provider shall be the sole and exclusive property of Client.",
        target_section: "Section 12.1",
        target_clause_title: "Provider Intellectual Property Retention",
        target_text: "Subject to Section 3.4, Provider retains all right, title, and interest in and to all software, algorithms, and IP rights created during engagement.",
        severity: "HIGH",
        confidence_score: 0.92,
        category: "Intellectual Property",
        source_value: "Owner: CLIENT",
        target_value: "Owner: PROVIDER",
        explanation: "Direct ownership conflict for intellectual property: Section 3.4 assigns all deliverables exclusively to Client, while Section 12.1 states Provider retains exclusive title to all created IP.",
        suggested_action: "Clarify pre-existing background IP vs newly created work product. Grant Client ownership of custom code while Provider retains underlying reusable utilities under non-exclusive license."
      },
      {
        id: "cntr_law",
        source_section: "Section 8.1",
        source_clause_title: "Governing Law and Venue",
        source_text: "This Agreement shall be governed by and enforced in accordance with the laws of the State of Delaware.",
        target_section: "Section 15.2",
        target_clause_title: "Dispute Resolution & Jurisdiction",
        target_text: "Subject to Section 8.1, any dispute shall be submitted to binding arbitration located exclusively in the State of New York.",
        severity: "MEDIUM",
        confidence_score: 0.90,
        category: "Governing Law & Dispute Resolution",
        source_value: "State of Delaware",
        target_value: "State of New York",
        explanation: "Jurisdictional conflict: Section 8.1 specifies governing law in Delaware, whereas Section 15.2 designates New York state courts/arbitration as the exclusive venue.",
        suggested_action: "Select a single governing law and forum (e.g., State of Delaware) across the entire agreement to prevent multi-jurisdictional motion practice."
      }
    ]
  };
}
