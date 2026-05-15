import { askGeminiWithFileJSON, askGeminiJSON } from "@/lib/gemini";
import type { ClaimProfile } from "@/lib/types";

const EXTRACT_PROMPT = `You are a medical billing expert. Analyze this medical document and extract all billing information.

Extract and return a JSON object with exactly this structure:
{
  "patientName": "string or Unknown",
  "accountNumber": "string or Unknown",
  "providerName": "string or Unknown",
  "providerNPI": "string or Unknown",
  "facilityName": "string or Unknown",
  "payerName": "insurance company name or Unknown",
  "planType": "ACA or ERISA or Medicare or MedicareAdvantage or Medicaid or Unknown",
  "dateOfService": "YYYY-MM-DD or Unknown",
  "totalCharged": number,
  "totalPatientResponsibility": number,
  "cptLines": [
    { "code": "CPT code", "description": "service description", "chargedAmount": number, "date": "YYYY-MM-DD", "quantity": 1 }
  ],
  "icdCodes": ["ICD-10 codes found"],
  "carcCodes": ["CARC codes like CO-50, PR-1 etc found in denial/EOB"],
  "rarcCodes": ["RARC codes found"],
  "isInCollections": false,
  "isSurpriseBill": false,
  "hasDenialLetter": false,
  "rawText": "first 500 chars of key text found"
}

Rules:
- planType: ACA=marketplace/individual/small employer, ERISA=large employer self-funded, Medicare=65+ federal, MedicareAdvantage=MA plan, Medicaid=state program
- isInCollections: true if document is from a collection agency
- isSurpriseBill: true if out-of-network provider at in-network facility or emergency
- hasDenialLetter: true if document shows denial codes or denial language
- If a field is not found, use empty string or 0 or false or []
- totalCharged and totalPatientResponsibility must be numbers (not strings)`;

export async function agent1Parser(
  fileBase64: string,
  mimeType: string
): Promise<ClaimProfile> {
  let profile: ClaimProfile;

  try {
    profile = await askGeminiWithFileJSON<ClaimProfile>(fileBase64, mimeType, EXTRACT_PROMPT);
  } catch {
    // Fallback: ask gemini to describe what it sees and construct minimal profile
    profile = await askGeminiJSON<ClaimProfile>(
      `${EXTRACT_PROMPT}\n\nDocument content (text extracted): [Unable to parse - return minimal valid JSON with Unknown values and empty arrays]`
    );
  }

  // Ensure required fields have defaults
  return {
    patientName: profile.patientName || "Unknown",
    accountNumber: profile.accountNumber || "Unknown",
    providerName: profile.providerName || "Unknown",
    providerNPI: profile.providerNPI || "Unknown",
    facilityName: profile.facilityName || "Unknown",
    payerName: profile.payerName || "Unknown",
    planType: profile.planType || "Unknown",
    dateOfService: profile.dateOfService || "Unknown",
    totalCharged: Number(profile.totalCharged) || 0,
    totalPatientResponsibility: Number(profile.totalPatientResponsibility) || 0,
    cptLines: profile.cptLines || [],
    icdCodes: profile.icdCodes || [],
    carcCodes: profile.carcCodes || [],
    rarcCodes: profile.rarcCodes || [],
    isInCollections: Boolean(profile.isInCollections),
    isSurpriseBill: Boolean(profile.isSurpriseBill),
    hasDenialLetter: Boolean(profile.hasDenialLetter),
    rawText: profile.rawText || "",
  };
}
