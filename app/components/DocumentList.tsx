"use client";
import { FileText, Download, CheckCircle } from "lucide-react";
import type { Documents } from "@/lib/types";

const DOC_LABELS: Record<string, string> = {
  bill_dispute:      "Challenge overcharges directly with the hospital/provider",
  internal_appeal:   "Formal appeal to your insurance company",
  fdcpa_validation:  "Stop illegal debt collection under federal law",
  hipaa_records:     "Obtain your medical records to verify charges",
  nsa_complaint:     "File with CMS against surprise billing violations",
};

interface Props {
  documents: Documents;
  sessionId: string;
}

export default function DocumentList({ documents, sessionId }: Props) {
  const docs = documents.documents ?? [];

  if (docs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p>No documents generated yet.</p>
      </div>
    );
  }

  const handleDownload = (type: string) => {
    window.open(`/api/download?session=${sessionId}&type=${type}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-gray-800 text-lg">
          {docs.length} Document{docs.length > 1 ? "s" : ""} Ready to Send
        </h3>
      </div>
      {docs.map((doc, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-blue-300 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{DOC_LABELS[doc.type] ?? doc.type}</p>
              <p className="text-xs text-gray-400 mt-1">
                Send to: {doc.recipient} · Via: {doc.sendVia}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">{doc.deadline}</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(doc.type)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center pt-2">
        All letters are personalized to your case. Review and sign before sending.
      </p>
    </div>
  );
}
