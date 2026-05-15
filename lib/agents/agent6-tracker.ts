import type { ActionPlan, Documents, TrackingPlan, DeadlineItem } from "@/lib/types";

export function agent6Tracker(plan: ActionPlan, docs: Documents): TrackingPlan {
  const today = new Date();

  const deadlines: DeadlineItem[] = plan.items.map((item) => {
    const due = new Date(item.deadline);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      action: item.documentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      dueDate: item.deadline,
      daysRemaining: diff,
      status: diff < 0 ? "overdue" : diff <= 14 ? "urgent" : "pending",
      nextStep: `Send to: ${item.recipient} via the recommended method. Legal basis: ${item.legalBasis}`,
    };
  });

  const weeklyCheckIns = [
    "Week 1: Have you sent all generated letters via certified mail? Save your tracking numbers.",
    "Week 2: Check for responses. Insurers must respond to internal appeals within 30 days (standard) or 72 hours (urgent).",
    "Week 3: No response yet? Follow up by phone AND document the call (date, time, rep name, what they said).",
    "Week 4: If no resolution, prepare to escalate to the next stage (IRO / State Commissioner / DOL).",
    "Month 2: If internal appeal denied, file external review request within your deadline window.",
    "Month 3: Check all deadlines on your dashboard. No deadline should be missed.",
  ];

  const escalationTriggers = [
    "🔴 No response from insurer after 30 days → File state insurance commissioner complaint",
    "🔴 Internal appeal denied → File external review (IRO) within 4 months",
    "🔴 Collection calls continue after FDCPA letter → File CFPB complaint immediately",
    "🔴 Provider refuses to correct billing error → Escalate to State AG / hospital patient advocate",
    "🔴 IRO upholds denial → Consult a patient advocate or healthcare attorney for your state",
    "🔴 ERISA plan denial → File DOL/EBSA complaint and consider ERISA 502(a) federal claim",
  ];

  const totalSavings = plan.items.length;
  const victorySummary = docs.documents.length > 0
    ? `${docs.documents.length} document${docs.documents.length > 1 ? "s" : ""} generated and ready to send. Follow the deadline dashboard above. Most cases resolve at the internal appeal stage — 40-60% of appeals succeed. If denied, external review (IRO) reverses 81.7% of mental health denials. You have legal rights. Use them.`
    : "No documents needed — your billing appears accurate. Keep this report for your records.";

  return { deadlines, weeklyCheckIns, escalationTriggers, victorySummary };
}
