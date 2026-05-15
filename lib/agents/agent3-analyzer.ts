import { lookupCARC } from "@/lib/data/carc-codes";
import { askGeminiJSON } from "@/lib/gemini";
import type { ClaimProfile, DenialAnalysis, DenialInfo } from "@/lib/types";

const PAYER_DEADLINES: Record<string, number> = {
  UnitedHealthcare: 65,
  UHC: 65,
  "United Healthcare": 65,
  Aetna: 180,
  BCBS: 180,
  "Blue Cross": 180,
  "Blue Shield": 180,
  Cigna: 180,
  Humana: 180,
  "Medicare Advantage": 60,
  Medicare: 120,
  Medicaid: 90,
};

function getDeadline(payerName: string): number {
  for (const [key, days] of Object.entries(PAYER_DEADLINES)) {
    if (payerName.toLowerCase().includes(key.toLowerCase())) return days;
  }
  return 180; // ACA default
}

export async function agent3Analyzer(profile: ClaimProfile): Promise<DenialAnalysis> {
  const denials: DenialInfo[] = [];

  // Decode each CARC code from our lookup table
  for (const code of profile.carcCodes) {
    const entry = lookupCARC(code);
    if (entry) {
      denials.push({
        carcCode: code,
        plainEnglish: entry.plainEnglish,
        appealStrategy: entry.appealStrategy,
        legalBasis: entry.legalBasis,
        deadlineDays: entry.deadlineDays,
        urgencyLevel: entry.urgency === "immediate" ? "crisis" : entry.urgency === "high" ? "urgent" : "standard",
      });
    }
  }

  // If CARC codes present but not in our table, ask Gemini
  const unknownCodes = profile.carcCodes.filter((c) => !lookupCARC(c));
  if (unknownCodes.length > 0) {
    const extra = await askGeminiJSON<DenialInfo[]>(`
You are a medical billing expert. Decode these insurance denial/adjustment codes:
${unknownCodes.join(", ")}

Context: Payer is ${profile.payerName}, Plan type is ${profile.planType}

Return a JSON array where each item is:
{
  "carcCode": "the code",
  "plainEnglish": "what this means in simple language",
  "appealStrategy": "exactly what to do to appeal or dispute this",
  "legalBasis": "which federal law applies",
  "deadlineDays": number_of_days_to_appeal,
  "urgencyLevel": "crisis|urgent|standard"
}
`);
    if (Array.isArray(extra)) denials.push(...extra);
  }

  // Determine key flags
  const isMHSUD = profile.icdCodes.some((c) =>
    c.startsWith("F") || ["Z63", "Z65", "Z72", "Z79"].some((p) => c.startsWith(p))
  );
  const isNSA = profile.isSurpriseBill;
  const isERISA = profile.planType === "ERISA";

  // Applicable laws
  const laws: string[] = ["ACA Section 2719 (Internal/External Appeal Rights)"];
  if (isMHSUD) laws.push("MHPAEA — Mental Health Parity and Addiction Equity Act");
  if (isNSA) laws.push("No Surprises Act — Surprise Billing Protection");
  if (isERISA) laws.push("ERISA Section 503 — Claims and Appeals Procedures");
  if (profile.isInCollections) laws.push("FDCPA — Fair Debt Collection Practices Act");

  // Escalation path based on plan type
  const escalationPath = isERISA
    ? ["Internal Appeal to Plan Administrator", "DOL/EBSA Complaint", "Federal Court ERISA 502(a)"]
    : profile.planType === "Medicare"
    ? ["Redetermination", "Qualified Independent Contractor (QIC)", "ALJ Hearing", "Medicare Appeals Council"]
    : ["Internal Appeal to Insurer", "External Independent Review (IRO)", "State Insurance Commissioner", "State Attorney General"];

  const internalDeadline = getDeadline(profile.payerName);
  const summary = denials.length > 0
    ? `Found ${denials.length} denial reason${denials.length > 1 ? "s" : ""}. Your internal appeal deadline is ${internalDeadline} days from denial notice. ${isERISA ? "⚠️ This is an ERISA employer plan — escalate to DOL, not your state insurance commissioner." : ""}`
    : profile.hasDenialLetter
    ? "Denial letter detected but no specific reason codes found. Review the letter for specific denial reasons."
    : "No denial codes found. This document appears to be a billing statement only.";

  return {
    denials,
    planType: profile.planType,
    internalAppealDeadlineDays: internalDeadline,
    externalReviewDeadlineDays: 120,
    applicableLaws: laws,
    isMHSUD,
    isNSA,
    isERISA,
    escalationPath,
    summary,
  };
}
