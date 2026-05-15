import type { AuditReport, DenialAnalysis, ActionPlan, ActionItem, ClaimProfile } from "@/lib/types";

export async function agent4Strategy(
  profile: ClaimProfile,
  audit: AuditReport,
  denial: DenialAnalysis
): Promise<ActionPlan> {
  const items: ActionItem[] = [];
  let order = 1;

  const today = new Date();
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  // FDCPA path takes absolute priority if in collections
  if (profile.isInCollections) {
    items.push({
      order: order++,
      documentType: "fdcpa_validation",
      recipient: "Collection Agency",
      deadline: addDays(30),
      legalBasis: "FDCPA — Fair Debt Collection Practices Act (30-day dispute window)",
      priority: "immediate",
    });
  }

  // Fix bill errors first — often resolves denial automatically
  if (audit.errorsFound.length > 0) {
    items.push({
      order: order++,
      documentType: "bill_dispute",
      recipient: `${profile.providerName || "Provider"} Billing Department`,
      deadline: addDays(30),
      legalBasis: "Patient right to itemized accurate bill — FDCPA, Hospital Price Transparency Rule",
      priority: "high",
    });
  }

  // HIPAA records request if upcoding or phantom charges detected
  const needsRecords = audit.errorsFound.some((e) => ["upcoding", "phantom"].includes(e.type));
  if (needsRecords) {
    items.push({
      order: order++,
      documentType: "hipaa_records",
      recipient: `${profile.providerName || "Provider"} Medical Records Department`,
      deadline: addDays(7),
      legalBasis: "HIPAA — Right to access medical records within 30 days",
      priority: "high",
    });
  }

  // No Surprises Act complaint if applicable
  if (profile.isSurpriseBill || denial.isNSA) {
    items.push({
      order: order++,
      documentType: "nsa_complaint",
      recipient: "CMS No Surprises Help Desk",
      deadline: addDays(60),
      legalBasis: "No Surprises Act — Effective January 1, 2022",
      priority: "immediate",
    });
  }

  // Internal appeal for denials
  if (denial.denials.length > 0) {
    const deadlineDays = Math.min(...denial.denials.map((d) => d.deadlineDays), denial.internalAppealDeadlineDays);
    items.push({
      order: order++,
      documentType: "internal_appeal",
      recipient: `${profile.payerName || "Insurance Company"} Appeals Department`,
      deadline: addDays(Math.min(deadlineDays, 60)), // urge to act within 60 days even if 180 allowed
      legalBasis: denial.isERISA
        ? "ERISA Section 503 — Internal Claims and Appeals"
        : "ACA Section 2719 — Internal Appeal Rights",
      priority: denial.denials.some((d) => d.urgencyLevel === "crisis") ? "immediate" : "high",
    });

    // External review (IRO) — add as next step
    items.push({
      order: order++,
      documentType: "external_review",
      recipient: denial.isERISA ? "DOL Employee Benefits Security Administration (EBSA)" : "State Independent Review Organization (IRO)",
      deadline: addDays(120),
      legalBasis: denial.isERISA
        ? "ERISA Section 502(a) — Federal Court Rights"
        : "ACA Section 2719 — External Review Rights",
      priority: "standard",
    });
  }

  // State Insurance Commissioner if fully insured plan
  if (denial.denials.length > 0 && !denial.isERISA) {
    items.push({
      order: order++,
      documentType: "state_commissioner",
      recipient: "State Department of Insurance",
      deadline: addDays(150),
      legalBasis: "State Insurance Law — File if insurer ignores internal appeal",
      priority: "standard",
    });
  }

  // DOL complaint for ERISA plans
  if (denial.isERISA && denial.denials.length > 0) {
    items.push({
      order: order++,
      documentType: "dol_complaint",
      recipient: "DOL Employee Benefits Security Administration (EBSA)",
      deadline: addDays(180),
      legalBasis: "ERISA Section 502 — DOL enforcement authority",
      priority: "standard",
    });
  }

  // CFPB complaint if in collections
  if (profile.isInCollections) {
    items.push({
      order: order++,
      documentType: "cfpb_complaint",
      recipient: "Consumer Financial Protection Bureau (CFPB)",
      deadline: addDays(30),
      legalBasis: "FDCPA — CFPB enforces debt collection law",
      priority: "high",
    });
  }

  const primaryPath = profile.isInCollections
    ? "FDCPA Debt Validation → Bill Dispute → Collection Removal"
    : denial.denials.length > 0 && audit.errorsFound.length > 0
    ? "Fix Bill Errors First → Internal Appeal → External Review"
    : denial.denials.length > 0
    ? "Internal Appeal → External Review (IRO) → Commissioner"
    : audit.errorsFound.length > 0
    ? "Bill Dispute Letter → Provider Correction → Insurer Reprocess"
    : "No immediate action needed";

  return {
    items,
    primaryPath,
    summary: `${items.length} action${items.length !== 1 ? "s" : ""} identified. Primary path: ${primaryPath}. Start with the highest priority items first.`,
  };
}
