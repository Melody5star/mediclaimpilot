"use client";
import { useState } from "react";
import { Shield, Mail, Lock, CheckCircle } from "lucide-react";
import { saveEmailLead } from "@/lib/supabase";

interface EmailGateProps {
  sessionId: string;
  planType?: string;
  onUnlock: (email: string) => void;
}

export default function EmailGate({ sessionId, planType, onUnlock }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    await saveEmailLead(email.trim().toLowerCase(), sessionId, planType);
    setLoading(false);
    onUnlock(email.trim().toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900">Your Report Is Ready</h2>
          <p className="text-gray-500 text-sm">
            Enter your email to view your full bill audit, denial analysis, and appeal letters — free.
          </p>
        </div>

        {/* Trust bullets */}
        <ul className="text-left space-y-2 text-sm text-gray-600">
          {[
            "No spam — we send only your report updates",
            "Privacy-first — your document is never stored",
            "Unsubscribe anytime, one click",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-600 text-xs text-left">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Saving..." : "View My Free Report"}
          </button>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Your email is private and never sold. See our{" "}
          <a href="/privacy" target="_blank" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
