"use client";
import { AlertTriangle, CheckCircle, DollarSign, TrendingDown } from "lucide-react";
import type { AuditReport } from "@/lib/types";

const ERROR_COLORS: Record<string, string> = {
  duplicate: "bg-red-100 text-red-800 border-red-200",
  upcoding: "bg-orange-100 text-orange-800 border-orange-200",
  unbundling: "bg-yellow-100 text-yellow-800 border-yellow-200",
  phantom: "bg-red-100 text-red-800 border-red-200",
  modifier: "bg-purple-100 text-purple-800 border-purple-200",
  facility_fee: "bg-pink-100 text-pink-800 border-pink-200",
};

export default function AuditResults({ audit }: { audit: AuditReport }) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Errors Found</p>
            <p className="text-2xl font-bold text-gray-900">{audit.errorsFound.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-lg"><TrendingDown className="w-6 h-6 text-orange-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Overcharge</p>
            <p className="text-2xl font-bold text-red-600">${audit.totalOvercharge.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Correct Amount</p>
            <p className="text-2xl font-bold text-green-700">${audit.correctTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-xl border ${audit.errorsFound.length > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
        <p className="font-semibold text-gray-800">{audit.summary}</p>
      </div>

      {/* Error list */}
      {audit.errorsFound.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-lg">Billing Errors Detected</h3>
          {audit.errorsFound.map((err, i) => (
            <div key={i} className={`border rounded-xl p-4 ${ERROR_COLORS[err.type] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide opacity-70">{err.type.replace("_", " ")}</span>
                    <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-mono">CPT {err.cptCode}</span>
                    <span className="text-xs opacity-60">{err.confidence} confidence</span>
                  </div>
                  <p className="font-semibold text-sm">{err.description}</p>
                  <p className="text-xs mt-1 opacity-80">Legal basis: {err.legalBasis}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs opacity-70">Overcharge</p>
                  <p className="font-bold text-lg">${err.overcharge.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medicare comparison */}
      {audit.medicareComparison.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-3">Medicare Rate Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["CPT Code", "Charged", "Medicare Rate", "Difference"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.medicareComparison.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono font-bold">{row.code}</td>
                    <td className="px-4 py-3">${row.charged.toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-700">${row.medicareRate.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-semibold ${row.difference > 0 ? "text-red-600" : "text-green-600"}`}>
                      {row.difference > 0 ? "+" : ""}${row.difference.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {audit.errorsFound.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <p className="text-green-800 font-medium">Your bill appears accurate based on available benchmarks. No errors detected.</p>
        </div>
      )}
    </div>
  );
}
