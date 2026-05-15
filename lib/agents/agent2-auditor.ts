import { askGeminiJSON } from "@/lib/gemini";
import { lookupCPT } from "@/lib/data/cpt-benchmarks";
import type { ClaimProfile, AuditReport, BillingError } from "@/lib/types";

export async function agent2Auditor(profile: ClaimProfile): Promise<AuditReport> {
  const errors: BillingError[] = [];
  const medicareComparison: AuditReport["medicareComparison"] = [];

  // 1. Duplicate charge detection
  const seen = new Map<string, number>();
  for (const line of profile.cptLines) {
    const key = `${line.code}-${line.date}`;
    if (seen.has(key)) {
      errors.push({
        type: "duplicate",
        cptCode: line.code,
        description: `Duplicate charge: ${line.description} billed twice on ${line.date}`,
        chargedAmount: line.chargedAmount,
        correctAmount: 0,
        overcharge: line.chargedAmount,
        confidence: "high",
        legalBasis: "Simple billing error — patients are not responsible for duplicate charges.",
      });
    } else {
      seen.set(key, line.chargedAmount);
    }
  }

  // 2. Medicare rate comparison
  for (const line of profile.cptLines) {
    const benchmark = lookupCPT(line.code);
    if (benchmark) {
      medicareComparison.push({
        code: line.code,
        charged: line.chargedAmount,
        medicareRate: benchmark.medicareRate,
        difference: line.chargedAmount - benchmark.medicareRate,
      });
      // Flag if charged more than 4x Medicare rate (extreme overcharge)
      if (line.chargedAmount > benchmark.medicareRate * 4) {
        errors.push({
          type: "upcoding",
          cptCode: line.code,
          description: `${line.description}: charged $${line.chargedAmount.toFixed(2)} vs Medicare rate of $${benchmark.medicareRate.toFixed(2)}`,
          chargedAmount: line.chargedAmount,
          correctAmount: benchmark.medicareRate * 2.5,
          overcharge: line.chargedAmount - benchmark.medicareRate * 2.5,
          confidence: "medium",
          legalBasis: "Hospital Price Transparency Rule (CMS) — charges should align with negotiated rates.",
        });
      }
    }
  }

  // 3. Use Gemini to detect deeper errors (upcoding, unbundling, phantom charges)
  if (profile.cptLines.length > 0) {
    const geminiErrors = await askGeminiJSON<BillingError[]>(`
You are a certified medical billing auditor. Analyze these billed services for errors.

Billed services:
${JSON.stringify(profile.cptLines, null, 2)}

ICD-10 Diagnosis codes: ${profile.icdCodes.join(", ") || "None listed"}
Provider: ${profile.providerName}
Facility: ${profile.facilityName}

Check for:
1. UPCODING: Is the complexity level of E&M codes (99211-99215) justified? Routine visits should be 99212-99213, not 99214-99215.
2. UNBUNDLING: Are any lab panels (80048, 80053) being billed as individual components separately?
3. PHANTOM CHARGES: Any charges that seem inconsistent with the diagnosis codes?
4. FACILITY FEE ABUSE: Excessive facility fees or room charges?
5. MODIFIER ERRORS: Missing or incorrect modifiers that inflate costs?

Return a JSON array of errors found. Each error:
{
  "type": "upcoding|unbundling|phantom|modifier|facility_fee",
  "cptCode": "the code",
  "description": "clear explanation of the problem",
  "chargedAmount": number,
  "correctAmount": estimated_correct_amount_number,
  "overcharge": overcharge_amount_number,
  "confidence": "high|medium|low",
  "legalBasis": "which law or guideline is violated"
}

Return [] if no additional errors found beyond what arithmetic already shows.
`);

    if (Array.isArray(geminiErrors)) {
      errors.push(...geminiErrors.filter((e) => e.overcharge > 0));
    }
  }

  const totalOvercharge = errors.reduce((sum, e) => sum + (e.overcharge || 0), 0);
  const correctTotal = Math.max(0, profile.totalCharged - totalOvercharge);

  const summary = errors.length > 0
    ? `Found ${errors.length} billing error${errors.length > 1 ? "s" : ""}. You were overcharged $${totalOvercharge.toFixed(2)}. Your correct bill should be approximately $${correctTotal.toFixed(2)}.`
    : `No billing errors detected. Your bill of $${profile.totalCharged.toFixed(2)} appears accurate based on available benchmarks.`;

  return { errorsFound: errors, totalOvercharge, correctTotal, medicareComparison, summary };
}
