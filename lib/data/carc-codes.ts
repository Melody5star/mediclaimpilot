export interface CARCEntry {
  plainEnglish: string;
  appealStrategy: string;
  legalBasis: string;
  deadlineDays: number;
  urgency: "immediate" | "high" | "standard";
}

export const CARC_CODES: Record<string, CARCEntry> = {
  "CO-4":  { plainEnglish: "Service/procedure inconsistent with modifier used", appealStrategy: "Submit corrected claim with correct modifier and clinical documentation", legalBasis: "AMA CPT Coding Guidelines", deadlineDays: 180, urgency: "standard" },
  "CO-11": { plainEnglish: "Diagnosis inconsistent with the procedure", appealStrategy: "Submit corrected claim with correct ICD-10 diagnosis code matching the procedure", legalBasis: "ACA Section 2719", deadlineDays: 180, urgency: "standard" },
  "CO-16": { plainEnglish: "Claim lacks information or has submission error", appealStrategy: "Resubmit with complete information — check member ID, provider NPI, dates", legalBasis: "ACA Section 2719", deadlineDays: 180, urgency: "high" },
  "CO-22": { plainEnglish: "Coordination of benefits issue — another payer may be primary", appealStrategy: "Provide primary/secondary insurance coordination of benefits information", legalBasis: "ACA COB Rules", deadlineDays: 180, urgency: "high" },
  "CO-29": { plainEnglish: "Claim submitted past timely filing deadline", appealStrategy: "Prove timely submission with certified mail receipt, clearinghouse confirmation, or EHR logs", legalBasis: "ACA Section 2719", deadlineDays: 60, urgency: "immediate" },
  "CO-45": { plainEnglish: "Charge exceeds contracted fee schedule maximum", appealStrategy: "This is often contractual — verify the fee schedule rate and negotiate if incorrect", legalBasis: "Provider Contract", deadlineDays: 180, urgency: "standard" },
  "CO-50": { plainEnglish: "Service not medically necessary per insurer criteria", appealStrategy: "Submit clinical notes, physician letter of medical necessity, and peer-reviewed evidence supporting the treatment", legalBasis: "ACA Section 2719, ERISA Section 503", deadlineDays: 180, urgency: "high" },
  "CO-96": { plainEnglish: "Non-covered charge — not included in plan benefits", appealStrategy: "Review plan documents carefully; appeal if coverage language is ambiguous or if MHPAEA parity applies", legalBasis: "ACA Section 2719, MHPAEA", deadlineDays: 180, urgency: "standard" },
  "CO-97": { plainEnglish: "Payment included in allowance for another service (bundling)", appealStrategy: "Check CMS NCCI edits — if codes should be billed separately, provide modifier and clinical documentation", legalBasis: "CMS NCCI Edits", deadlineDays: 180, urgency: "standard" },
  "CO-109": { plainEnglish: "Claim not covered by this payer — wrong insurer", appealStrategy: "Verify correct payer and resubmit to the correct insurance company", legalBasis: "ACA COB Rules", deadlineDays: 90, urgency: "high" },
  "CO-119": { plainEnglish: "Benefit maximum for this time period has been reached", appealStrategy: "Request itemized accounting of all charges applied to the benefit maximum; appeal if calculation is incorrect", legalBasis: "ACA, MHPAEA (no annual limits on essential benefits)", deadlineDays: 180, urgency: "standard" },
  "CO-197": { plainEnglish: "Prior authorization was required but not obtained", appealStrategy: "Request retroactive prior authorization with clinical documentation; cite No Surprises Act if emergency or out-of-network surprise scenario", legalBasis: "No Surprises Act, ACA Section 2719", deadlineDays: 180, urgency: "high" },
  "CO-242": { plainEnglish: "Services not authorized by the referring provider", appealStrategy: "Obtain retroactive referral from PCP; resubmit with referral documentation", legalBasis: "ACA Section 2719", deadlineDays: 180, urgency: "standard" },
  "PR-1":  { plainEnglish: "Deductible applied — patient owes this portion", appealStrategy: "Audit the deductible calculation — verify all prior payments credited correctly; appeal arithmetic errors", legalBasis: "ACA, Plan Documents", deadlineDays: 180, urgency: "standard" },
  "PR-2":  { plainEnglish: "Coinsurance applied — patient owes this percentage", appealStrategy: "Verify coinsurance percentage matches your plan documents; appeal calculation errors", legalBasis: "ACA, Plan Documents", deadlineDays: 180, urgency: "standard" },
  "PR-3":  { plainEnglish: "Copayment applied — patient owes fixed amount", appealStrategy: "Verify copay amount matches your Summary of Benefits; appeal if amount is incorrect", legalBasis: "ACA, Plan Documents", deadlineDays: 180, urgency: "standard" },
  "PR-204": { plainEnglish: "Service is out-of-network — higher patient cost share applies", appealStrategy: "Check if No Surprises Act applies (emergency, facility-based OON provider); if so, bill should be limited to in-network cost share", legalBasis: "No Surprises Act 2022", deadlineDays: 180, urgency: "high" },
  "OA-23": { plainEnglish: "Payment adjusted due to a prior payer's decision", appealStrategy: "Request explanation of prior payer determination; appeal if secondary insurance should pay more", legalBasis: "ACA COB Rules", deadlineDays: 180, urgency: "standard" },
};

export function lookupCARC(code: string): CARCEntry | null {
  const normalized = code.toUpperCase().replace(/\s/g, "");
  return CARC_CODES[normalized] ?? null;
}
