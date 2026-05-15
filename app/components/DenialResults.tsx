"use client";
import { AlertCircle, Scale, Clock, TrendingUp, ChevronRight } from "lucide-react";
import type { DenialAnalysis } from "@/lib/types";

const URGENCY_CARD: Record<string, string> = {
  crisis:   "bg-red-100 text-red-800 border-red-300",
  urgent:   "bg-orange-100 text-orange-800 border-orange-300",
  standard: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const URGENCY_BADGE: Record<string, string> = {
  crisis:   "bg-red-200 text-red-900",
  urgent:   "bg-orange-200 text-orange-900",
  standard: "bg-yellow-200 text-yellow-900",
};

export default function DenialResults({ analysis }: { analysis: DenialAnalysis }) {
  if (!analysis.denials || analysis.denials.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Plan & Law Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Plan Type</p>
          <p className="text-lg font-bold text-gray-900">{analysis.planType}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {analysis.isERISA && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">ERISA</span>}
            {analysis.isNSA && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">No Surprises Act</span>}
            {analysis.isMHSUD && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">MHPAEA</span>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Appeal Windows</p>
          <p className="text-sm text-gray-700">Internal appeal: <span className="font-bold">{analysis.internalAppealDeadlineDays} days</span></p>
          <p className="text-sm text-gray-700">External review: <span className="font-bold">{analysis.externalReviewDeadlineDays} days</span></p>
          <div className="flex flex-wrap gap-1 mt-2">
            {analysis.applicableLaws.map((law) => (
              <span key={law} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{law}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Denial Codes */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" /> Denial Codes Decoded
        </h3>
        {analysis.denials.map((denial, i) => (
          <div key={i} className={`border rounded-xl p-4 ${URGENCY_CARD[denial.urgencyLevel] ?? "bg-gray-50 border-gray-200 text-gray-800"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-sm">{denial.carcCode}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${URGENCY_BADGE[denial.urgencyLevel] ?? "bg-gray-200 text-gray-900"}`}>
                    {denial.urgencyLevel}
                  </span>
                </div>
                <p className="font-semibold text-sm mb-1">{denial.plainEnglish}</p>
                <p className="text-xs opacity-80 mb-2">Legal basis: {denial.legalBasis}</p>
                <div className="flex items-start gap-1">
                  <Scale className="w-3 h-3 mt-0.5 shrink-0" />
                  <p className="text-xs">{denial.appealStrategy}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-bold">{denial.deadlineDays} days</p>
                <p className="text-xs opacity-70">to appeal</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Path */}
      {analysis.escalationPath.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Your Escalation Path
          </h3>
          <div className="flex flex-col gap-2">
            {analysis.escalationPath.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-700 flex-1">{step}</p>
                {i < analysis.escalationPath.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.summary && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">{analysis.summary}</p>
        </div>
      )}
    </div>
  );
}
