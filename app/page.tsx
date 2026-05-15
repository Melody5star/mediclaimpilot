"use client";
import { useState, useRef } from "react";
import { Shield, Zap, FileSearch, Scale, Github } from "lucide-react";
import UploadZone from "@/app/components/UploadZone";
import AgentProgress from "@/app/components/AgentProgress";
import AuditResults from "@/app/components/AuditResults";
import DenialResults from "@/app/components/DenialResults";
import DocumentList from "@/app/components/DocumentList";
import DeadlineDashboard from "@/app/components/DeadlineDashboard";
import type { StreamEvent, PipelineResult } from "@/lib/types";

type Tab = "progress" | "audit" | "denial" | "documents" | "deadlines";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("progress");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setEvents([]);
    setResult(null);
    setError(null);
    setActiveTab("progress");

    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Upload failed");
      }

      // Session ID is set in the response header by the API route
      const sid = response.headers.get("X-Session-Id") ?? "";
      setSessionId(sid);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream returned");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const ev = JSON.parse(raw) as StreamEvent & { data?: PipelineResult; sessionId?: string };
            setEvents((prev) => [...prev, ev]);

            // Step 7 is the completion event sent by the API route with all accumulated data
            if (ev.step === 7 && ev.status === "done" && ev.data) {
              setResult(ev.data as PipelineResult);
              setActiveTab("audit");
            }
            // Also capture session ID from event body as fallback
            if (ev.sessionId && !sid) setSessionId(ev.sessionId);
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "progress",  label: "Agent Progress", show: true },
    { id: "audit",     label: "Bill Audit",     show: !!result?.auditReport },
    { id: "denial",    label: "Denial Analysis", show: !!(result?.denialAnalysis?.denials?.length) },
    { id: "documents", label: "Documents",       show: !!(result?.documents?.documents?.length) },
    { id: "deadlines", label: "Deadlines",       show: !!result?.trackingPlan },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">MediClaimPilot</span>
            <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">AI-Powered</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="hidden sm:inline">100% Free · No PHI stored</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        {!loading && !result && (
          <div className="text-center space-y-4 pt-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4" /> 6 AI Agents · Real-Time Analysis
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Fight Back Against<br />
              <span className="text-blue-600">Unfair Medical Bills</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              80% of medical bills contain errors. Insurance denies 86% of valid claims. Our AI audits every charge, decodes every denial, and writes your appeal letters — instantly and free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm">
              {[
                { icon: FileSearch, text: "Detects billing fraud" },
                { icon: Scale,      text: "Cites federal law" },
                { icon: Shield,     text: "Writes appeal letters" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-gray-600">
                  <Icon className="w-4 h-4 text-blue-500" /> {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload zone */}
        {!loading && !result && (
          <div className="max-w-2xl mx-auto">
            <UploadZone onFile={handleFile} loading={loading} />
            <p className="text-center text-xs text-gray-400 mt-3">
              Your document is processed in memory only. Nothing is permanently stored after your session.
            </p>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
            <strong>Error:</strong> {error}
            <button
              className="ml-4 underline text-red-600"
              onClick={() => { setError(null); setLoading(false); setEvents([]); }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Active analysis view */}
        {(loading || result) && (
          <div className="space-y-6">
            {/* Tab nav */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {activeTab === "progress" && <AgentProgress events={events} />}
              {activeTab === "audit" && result?.auditReport && <AuditResults audit={result.auditReport} />}
              {activeTab === "denial" && result?.denialAnalysis && <DenialResults analysis={result.denialAnalysis} />}
              {activeTab === "documents" && result?.documents && <DocumentList documents={result.documents} sessionId={sessionId} />}
              {activeTab === "deadlines" && result?.trackingPlan && <DeadlineDashboard plan={result.trackingPlan} />}
            </div>

            {result && (
              <div className="text-center">
                <button
                  onClick={() => { setResult(null); setEvents([]); setSessionId(""); setActiveTab("progress"); setError(null); }}
                  className="text-sm text-gray-500 hover:text-blue-600 underline transition-colors"
                >
                  Analyze another document
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        {!loading && !result && (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center pt-4">
            {[
              { stat: "80%",  label: "of bills have errors" },
              { stat: "$68B", label: "in annual overcharges" },
              { stat: "86%",  label: "of denials are avoidable" },
            ].map(({ stat, label }) => (
              <div key={stat} className="p-4 bg-white/70 rounded-xl border border-gray-100">
                <p className="text-2xl font-extrabold text-blue-600">{stat}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        MediClaimPilot — Built for the AI Agents Hackathon · Not legal advice · Always review letters before sending
      </footer>
    </div>
  );
}
