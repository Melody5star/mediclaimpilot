"use client";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { StreamEvent } from "@/lib/types";

const STEPS = [
  { step: 1, label: "Document Parser", desc: "Reading and extracting billing data" },
  { step: 2, label: "Bill Auditor", desc: "Checking charges against Medicare benchmarks" },
  { step: 3, label: "Denial Analyzer", desc: "Decoding denial codes & legal rights" },
  { step: 4, label: "Legal Strategy", desc: "Building your action plan" },
  { step: 5, label: "Document Writer", desc: "Drafting dispute & appeal letters" },
  { step: 6, label: "Deadline Tracker", desc: "Setting up your deadline dashboard" },
];

export default function AgentProgress({ events }: { events: StreamEvent[] }) {
  const getStatus = (step: number) => {
    const ev = events.filter((e) => e.step === step);
    if (ev.some((e) => e.status === "error")) return "error";
    if (ev.some((e) => e.status === "done")) return "done";
    if (ev.some((e) => e.status === "running")) return "running";
    return "pending";
  };

  const getMessage = (step: number) => {
    const ev = events.filter((e) => e.step === step && e.status === "done");
    return ev[0]?.message ?? "";
  };

  return (
    <div className="space-y-3">
      {STEPS.map(({ step, label, desc }) => {
        const status = getStatus(step);
        return (
          <div key={step} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
            status === "done" ? "bg-green-50 border-green-200" :
            status === "running" ? "bg-blue-50 border-blue-300 shadow-sm" :
            status === "error" ? "bg-red-50 border-red-200" :
            "bg-white border-gray-100"
          }`}>
            <div className="mt-0.5">
              {status === "done" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === "running" && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
              {status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
              {status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">AGENT {step}</span>
                <span className="font-semibold text-gray-800">{label}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {status === "running" ? desc : status === "done" ? getMessage(step) : desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
