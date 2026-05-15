export interface CPTLine {
  code: string;
  description: string;
  chargedAmount: number;
  date: string;
  quantity: number;
}

export interface ClaimProfile {
  patientName: string;
  accountNumber: string;
  providerName: string;
  providerNPI: string;
  facilityName: string;
  payerName: string;
  planType: "ACA" | "ERISA" | "Medicare" | "MedicareAdvantage" | "Medicaid" | "Unknown";
  dateOfService: string;
  totalCharged: number;
  totalPatientResponsibility: number;
  cptLines: CPTLine[];
  icdCodes: string[];
  carcCodes: string[];
  rarcCodes: string[];
  isInCollections: boolean;
  isSurpriseBill: boolean;
  hasDenialLetter: boolean;
  rawText: string;
}

export interface BillingError {
  type: "duplicate" | "upcoding" | "unbundling" | "phantom" | "modifier" | "facility_fee";
  cptCode: string;
  description: string;
  chargedAmount: number;
  correctAmount: number;
  overcharge: number;
  confidence: "high" | "medium" | "low";
  legalBasis: string;
}

export interface AuditReport {
  errorsFound: BillingError[];
  totalOvercharge: number;
  correctTotal: number;
  medicareComparison: { code: string; charged: number; medicareRate: number; difference: number }[];
  summary: string;
}

export interface DenialInfo {
  carcCode: string;
  plainEnglish: string;
  appealStrategy: string;
  legalBasis: string;
  deadlineDays: number;
  urgencyLevel: "crisis" | "urgent" | "standard";
}

export interface DenialAnalysis {
  denials: DenialInfo[];
  planType: string;
  internalAppealDeadlineDays: number;
  externalReviewDeadlineDays: number;
  applicableLaws: string[];
  isMHSUD: boolean;
  isNSA: boolean;
  isERISA: boolean;
  escalationPath: string[];
  summary: string;
}

export interface ActionItem {
  order: number;
  documentType: string;
  recipient: string;
  deadline: string;
  legalBasis: string;
  priority: "immediate" | "high" | "standard";
}

export interface ActionPlan {
  items: ActionItem[];
  primaryPath: string;
  summary: string;
}

export interface GeneratedDocument {
  type: string;
  title: string;
  content: string;
  recipient: string;
  sendVia: string;
  deadline: string;
  legalCitations: string[];
}

export interface Documents {
  documents: GeneratedDocument[];
}

export interface DeadlineItem {
  action: string;
  dueDate: string;
  daysRemaining: number;
  status: "pending" | "urgent" | "overdue";
  nextStep: string;
}

export interface TrackingPlan {
  deadlines: DeadlineItem[];
  weeklyCheckIns: string[];
  escalationTriggers: string[];
  victorySummary: string;
}

export interface PipelineResult {
  claimProfile: ClaimProfile;
  auditReport: AuditReport;
  denialAnalysis: DenialAnalysis;
  actionPlan: ActionPlan;
  documents: Documents;
  trackingPlan: TrackingPlan;
}

export interface StreamEvent {
  step: number;
  agent: string;
  status: "running" | "done" | "error";
  message: string;
  data?: Partial<PipelineResult>;
}
