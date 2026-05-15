"use client";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import type { TrackingPlan } from "@/lib/types";

function StatusIcon({ status }: { status: string }) {
  if (status === "overdue") return <AlertTriangle className="w-5 h-5 text-red-600" />;
  if (status === "urgent")  return <Clock className="w-5 h-5 text-orange-500" />;
  return <Calendar className="w-5 h-5 text-gray-400" />;
}

const STATUS_CARD: Record<string, string> = {
  overdue: "border-red-300 bg-red-50",
  urgent:  "border-orange-300 bg-orange-50",
  pending: "border-gray-200 bg-white",
};

const STATUS_BADGE: Record<string, string> = {
  overdue: "bg-red-100 text-red-800",
  urgent:  "bg-orange-100 text-orange-800",
  pending: "bg-gray-100 text-gray-600",
};

export default function DeadlineDashboard({ plan }: { plan: TrackingPlan }) {
  const sorted = [...plan.deadlines].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, urgent: 1, pending: 2 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
  });

  return (
    <div className="space-y-6">
      {plan.victorySummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 font-medium">{plan.victorySummary}</p>
        </div>
      )}

      {plan.weeklyCheckIns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-800 mb-2">Weekly Check-in Schedule</h3>
          <ul className="space-y-1">
            {plan.weeklyCheckIns.map((msg, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-0.5">›</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-lg">Your Deadlines</h3>
        {sorted.length === 0 && <p className="text-gray-400 text-sm">No deadlines tracked.</p>}
        {sorted.map((item, i) => (
          <div key={i} className={`border rounded-xl p-4 transition-all ${STATUS_CARD[item.status] ?? "border-gray-200 bg-white"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <StatusIcon status={item.status} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: <span className="font-medium text-gray-700">{item.dueDate}</span> · {item.daysRemaining} days remaining</p>
                  <p className="text-xs text-gray-500 mt-1">{item.nextStep}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 uppercase ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {plan.escalationTriggers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Escalate If Any of These Happen
          </h3>
          <ul className="space-y-1">
            {plan.escalationTriggers.map((trigger, i) => (
              <li key={i} className="text-sm text-red-800">{trigger}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
