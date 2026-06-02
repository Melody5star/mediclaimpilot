import { askGemini } from "@/lib/gemini";
import type { ClaimProfile, AuditReport, DenialAnalysis, ActionPlan, Documents, GeneratedDocument } from "@/lib/types";

function today(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function writeBillDispute(p: ClaimProfile, a: AuditReport): Promise<GeneratedDocument> {
  const errorList = a.errorsFound.map((e, i) =>
    `${i + 1}. ${e.type.toUpperCase()}: CPT ${e.cptCode} — ${e.description}. Overcharge: $${e.overcharge.toFixed(2)}. Legal basis: ${e.legalBasis}`
  ).join("\n");

  const content = await askGemini(`
Write a formal medical bill dispute letter. Use this exact information:

Patient: ${p.patientName}
Account: ${p.accountNumber}
Provider: ${p.providerName}
Date: ${today()}
Total charged: $${p.totalCharged.toFixed(2)}
Correct amount: $${a.correctTotal.toFixed(2)}
Total overcharge: $${a.totalOvercharge.toFixed(2)}

Errors found:
${errorList}

Write a professional letter that:
1. States patient identity and account number
2. Lists each error specifically with CPT code and dollar amount
3. Cites the legal basis for the dispute
4. Demands a corrected itemized bill within 30 days
5. States the patient will pay only the correct amount
6. Requests written confirmation of corrections
7. Includes signature line

Keep it firm, professional, and legally grounded. 400-500 words.
`);

  return {
    type: "bill_dispute",
    title: "Medical Bill Dispute Letter",
    content,
    recipient: `${p.providerName} Billing Department`,
    sendVia: "Certified Mail with Return Receipt",
    deadline: "Send within 30 days of receiving the bill",
    legalCitations: ["FDCPA — Fair Debt Collection Practices Act", "Hospital Price Transparency Rule (CMS, April 2026)", "ACA Patient Rights"],
  };
}

async function writeInternalAppeal(p: ClaimProfile, d: DenialAnalysis): Promise<GeneratedDocument> {
  const denialList = d.denials.map((dn, i) =>
    `${i + 1}. Code ${dn.carcCode}: ${dn.plainEnglish}. Appeal strategy: ${dn.appealStrategy}`
  ).join("\n");

  const content = await askGemini(`
Write a formal health insurance internal appeal letter. Use this exact information:

Patient: ${p.patientName}
Insurer: ${p.payerName}
Date of Service: ${p.dateOfService}
Date: ${today()}
Plan Type: ${p.planType}
Is ERISA Plan: ${d.isERISA}
Is Mental Health/SUD related: ${d.isMHSUD}

Denial reasons to appeal:
${denialList}

Applicable laws: ${d.applicableLaws.join(", ")}

Write a professional appeal letter that:
1. Identifies the patient, claim, and denial
2. States the basis for appeal for each denial code
3. Cites specific federal laws (ACA Section 2719, ERISA if applicable, MHPAEA if mental health)
4. Requests reversal of the denial within 30 days
5. Demands a written decision with specific reasons if upheld
6. Mentions the right to external review if internal appeal is denied
7. Lists attachments needed (medical records, physician letter, etc.)

Keep it professional, legally grounded, and firm. 500-600 words.
`);

  return {
    type: "internal_appeal",
    title: "Insurance Denial Internal Appeal Letter",
    content,
    recipient: `${p.payerName} Appeals Department`,
    sendVia: "Certified Mail + Upload to insurer's online portal",
    deadline: `Within ${d.internalAppealDeadlineDays} days of denial notice`,
    legalCitations: d.applicableLaws,
  };
}

async function writeFDCPA(p: ClaimProfile): Promise<GeneratedDocument> {
  const content = await askGemini(`
Write a formal FDCPA debt validation letter for a medical debt. Use:

Patient: ${p.patientName}
Provider/Original Creditor: ${p.providerName}
Date: ${today()}

Write a letter that:
1. Formally disputes the debt under FDCPA Section 809(b)
2. Demands complete debt validation (original itemized bill, proof collector has right to collect, license info)
3. Demands all collection activities cease until validation is provided
4. States consequences of continued collection without validation
5. Requests confirmation in writing only (no phone calls)
6. Is firm and legally precise

Keep it professional and legally grounded. 300-400 words.
`);

  return {
    type: "fdcpa_validation",
    title: "FDCPA Debt Validation Letter",
    content,
    recipient: "Collection Agency (Certified Mail)",
    sendVia: "Certified Mail with Return Receipt — REQUIRED within 30 days",
    deadline: "Send within 30 days of first collection contact",
    legalCitations: ["FDCPA Section 809(b) — Debt Validation Rights", "CFPB Medical Debt Rules 2024"],
  };
}

async function writeHIPAARequest(p: ClaimProfile): Promise<GeneratedDocument> {
  const content = await askGemini(`
Write a HIPAA medical records request letter. Use:

Patient: ${p.patientName}
Provider: ${p.providerName}
Date of Service: ${p.dateOfService}
Date: ${today()}

Write a letter requesting complete medical records for the service date, specifically:
- All clinical notes for the date of service
- Procedure documentation
- Any photographs, lab results, or test results
- Time logs if applicable (for therapy/timed services)

Cite HIPAA right to access. Request records within 30 days. State records are needed to verify billing accuracy. 200-300 words.
`);

  return {
    type: "hipaa_records",
    title: "HIPAA Medical Records Request",
    content,
    recipient: `${p.providerName} Medical Records Department`,
    sendVia: "Certified Mail or Provider's Patient Portal",
    deadline: "Provider must respond within 30 days",
    legalCitations: ["HIPAA Privacy Rule — 45 CFR §164.524 — Right of Access"],
  };
}

async function writeNSAComplaint(p: ClaimProfile): Promise<GeneratedDocument> {
  const content = await askGemini(`
Write a No Surprises Act complaint to CMS. Use:

Patient: ${p.patientName}
Provider: ${p.providerName}
Facility: ${p.facilityName}
Date of Service: ${p.dateOfService}
Amount billed: $${p.totalCharged.toFixed(2)}
Date: ${today()}

Write a complaint letter/form to CMS No Surprises Help Desk that:
1. Describes the surprise billing situation
2. States the specific NSA protections that apply
3. Requests investigation and enforcement
4. Asks for bill to be limited to in-network cost share
5. Includes filing instructions (cms.gov/nosurprises, 800-985-3059)

Keep it factual and precise. 300-350 words.
`);

  return {
    type: "nsa_complaint",
    title: "No Surprises Act CMS Complaint",
    content,
    recipient: "CMS No Surprises Help Desk",
    sendVia: "Online at cms.gov/nosurprises or call 800-985-3059",
    deadline: "File as soon as possible — no strict deadline but sooner is better",
    legalCitations: ["No Surprises Act — Consolidated Appropriations Act 2021, Effective January 1, 2022"],
  };
}

export async function agent5Writer(
  profile: ClaimProfile,
  audit: AuditReport,
  denial: DenialAnalysis,
  plan: ActionPlan
): Promise<Documents> {
  const docs: GeneratedDocument[] = [];
  const types = plan.items.map((i) => i.documentType);

  // Sequential — avoids simultaneous Gemini calls hitting rate limits or Vercel timeout
  const tasks: Array<() => Promise<GeneratedDocument | null>> = [
    types.includes("bill_dispute") && audit.errorsFound.length > 0
      ? () => writeBillDispute(profile, audit) : null,
    types.includes("internal_appeal") && denial.denials.length > 0
      ? () => writeInternalAppeal(profile, denial) : null,
    types.includes("hipaa_records")
      ? () => writeHIPAARequest(profile) : null,
    types.includes("fdcpa_validation")
      ? () => writeFDCPA(profile) : null,
    types.includes("nsa_complaint")
      ? () => writeNSAComplaint(profile) : null,
  ].filter(Boolean) as Array<() => Promise<GeneratedDocument | null>>;

  for (const task of tasks) {
    try {
      const doc = await task();
      if (doc) docs.push(doc);
    } catch (err) {
      console.error("[Agent5] Document generation failed:", err instanceof Error ? err.message : err);
    }
  }

  return { documents: docs };
}
