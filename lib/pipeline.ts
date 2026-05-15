import { agent1Parser } from "@/lib/agents/agent1-parser";
import { agent2Auditor } from "@/lib/agents/agent2-auditor";
import { agent3Analyzer } from "@/lib/agents/agent3-analyzer";
import { agent4Strategy } from "@/lib/agents/agent4-strategy";
import { agent5Writer } from "@/lib/agents/agent5-writer";
import { agent6Tracker } from "@/lib/agents/agent6-tracker";
import type { PipelineResult, StreamEvent } from "@/lib/types";

export async function* runPipeline(
  fileBase64: string,
  mimeType: string
): AsyncGenerator<StreamEvent> {

  yield { step: 1, agent: "Document Parser", status: "running", message: "Reading and parsing your document..." };
  const claimProfile = await agent1Parser(fileBase64, mimeType);
  yield { step: 1, agent: "Document Parser", status: "done", message: `Extracted ${claimProfile.cptLines.length} billing line(s) from ${claimProfile.payerName !== "Unknown" ? claimProfile.payerName : "your document"}.`, data: { claimProfile } };

  yield { step: 2, agent: "Bill Auditor", status: "running", message: "Auditing every charge against Medicare benchmarks and billing rules..." };
  const auditReport = await agent2Auditor(claimProfile);
  yield { step: 2, agent: "Bill Auditor", status: "done", message: auditReport.errorsFound.length > 0 ? `Found ${auditReport.errorsFound.length} billing error(s) — potential overcharge of $${auditReport.totalOvercharge.toFixed(2)}` : "No billing errors detected.", data: { auditReport } };

  yield { step: 3, agent: "Denial Analyzer", status: "running", message: "Decoding denial codes and identifying your legal rights..." };
  const denialAnalysis = await agent3Analyzer(claimProfile);
  yield { step: 3, agent: "Denial Analyzer", status: "done", message: denialAnalysis.denials.length > 0 ? `Decoded ${denialAnalysis.denials.length} denial code(s). Internal appeal deadline: ${denialAnalysis.internalAppealDeadlineDays} days.` : "No denial codes found.", data: { denialAnalysis } };

  yield { step: 4, agent: "Legal Strategy", status: "running", message: "Building your personalized action plan..." };
  const actionPlan = await agent4Strategy(claimProfile, auditReport, denialAnalysis);
  yield { step: 4, agent: "Legal Strategy", status: "done", message: `${actionPlan.items.length} action(s) planned. Primary path: ${actionPlan.primaryPath}`, data: { actionPlan } };

  yield { step: 5, agent: "Document Writer", status: "running", message: "Drafting your legally-grounded dispute and appeal letters..." };
  const documents = await agent5Writer(claimProfile, auditReport, denialAnalysis, actionPlan);
  yield { step: 5, agent: "Document Writer", status: "done", message: `Generated ${documents.documents.length} ready-to-send document(s).`, data: { documents } };

  yield { step: 6, agent: "Deadline Tracker", status: "running", message: "Setting up your deadline dashboard and escalation plan..." };
  const trackingPlan = agent6Tracker(actionPlan, documents);
  yield { step: 6, agent: "Deadline Tracker", status: "done", message: `Tracking ${trackingPlan.deadlines.length} deadline(s). ${trackingPlan.victorySummary}`, data: { trackingPlan } };
}

export async function runPipelineSync(fileBase64: string, mimeType: string): Promise<PipelineResult> {
  const claimProfile = await agent1Parser(fileBase64, mimeType);
  const auditReport = await agent2Auditor(claimProfile);
  const denialAnalysis = await agent3Analyzer(claimProfile);
  const actionPlan = await agent4Strategy(claimProfile, auditReport, denialAnalysis);
  const documents = await agent5Writer(claimProfile, auditReport, denialAnalysis, actionPlan);
  const trackingPlan = agent6Tracker(actionPlan, documents);
  return { claimProfile, auditReport, denialAnalysis, actionPlan, documents, trackingPlan };
}
