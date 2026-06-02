import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — MediClaimPilot",
  description: "How MediClaimPilot handles your data and protects your privacy.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">MediClaimPilot</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: June 1, 2026</p>
        </div>

        <Section title="Overview">
          MediClaimPilot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
          This policy explains what information we collect, how we use it, and your rights regarding that information.
          We are designed with a privacy-first approach — we do not store your medical documents or
          Protected Health Information (PHI) as defined under HIPAA.
        </Section>

        <Section title="Information We Collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Email address</strong> — collected when you request your analysis report. Used only
              to deliver your report and send relevant product updates. Never sold to third parties.
            </li>
            <li>
              <strong>Uploaded documents (medical bills, EOBs)</strong> — processed in memory by Google
              Gemini AI to generate your audit report. <strong>No document content is permanently stored</strong> on
              our servers. Documents are deleted from memory immediately after your session ends.
            </li>
            <li>
              <strong>Analysis results</strong> — a summary of your audit (without raw document content)
              may be stored temporarily (up to 24 hours) to allow you to download your report. This data
              is then automatically deleted.
            </li>
            <li>
              <strong>Usage data</strong> — standard server logs (IP address, browser type, pages visited)
              for security and performance monitoring. Retained for 30 days.
            </li>
          </ul>
        </Section>

        <Section title="HIPAA Notice">
          MediClaimPilot is a software tool designed to help individuals understand their medical bills.
          We do not store, transmit, or retain Protected Health Information (PHI) beyond the immediate
          processing session. Your uploaded documents are analyzed by Google Gemini AI under Google&apos;s
          enterprise data processing terms and are not used to train AI models. We are not a Covered
          Entity or Business Associate under HIPAA, and we recommend you do not upload documents
          containing your full Social Security Number.
        </Section>

        <Section title="How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li>To generate and deliver your medical bill audit report</li>
            <li>To send you a copy of your report via email if requested</li>
            <li>To notify you of product updates, new features, or related services (you may unsubscribe at any time)</li>
            <li>To improve the accuracy and reliability of our AI analysis</li>
            <li>To comply with applicable laws and prevent fraud</li>
          </ul>
        </Section>

        <Section title="How We Share Your Information">
          We do not sell, rent, or trade your personal information. We share data only with:
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Google Gemini AI</strong> — to process your uploaded document (document content only, not your email)</li>
            <li><strong>Supabase</strong> — our database provider, for storing analysis results and email addresses securely</li>
            <li><strong>Vercel</strong> — our hosting provider, for serving the application</li>
            <li><strong>Law enforcement</strong> — only when required by a valid legal process</li>
          </ul>
        </Section>

        <Section title="Data Retention">
          <ul className="list-disc pl-5 space-y-2">
            <li>Uploaded documents: deleted immediately after processing (not stored)</li>
            <li>Analysis results: auto-deleted after 24 hours</li>
            <li>Email addresses: retained until you unsubscribe or request deletion</li>
            <li>Server logs: retained for 30 days</li>
          </ul>
        </Section>

        <Section title="Your Rights">
          You have the right to:
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Access the personal data we hold about you</li>
            <li>Request deletion of your email address and any associated data</li>
            <li>Opt out of marketing emails at any time (unsubscribe link in every email)</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@mediclaimpilot.com" className="text-blue-600 underline">
            privacy@mediclaimpilot.com
          </a>.
        </Section>

        <Section title="Cookies">
          MediClaimPilot uses minimal cookies — only those strictly necessary to operate the service
          (session management). We do not use advertising cookies or third-party tracking pixels.
        </Section>

        <Section title="Children's Privacy">
          MediClaimPilot is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal information,
          please contact us immediately.
        </Section>

        <Section title="Changes to This Policy">
          We may update this policy periodically. We will notify registered users of material changes
          via email. Continued use of MediClaimPilot after changes constitutes acceptance of the
          updated policy.
        </Section>

        <Section title="Contact Us">
          For privacy-related questions or requests:
          <br />
          Email:{" "}
          <a href="mailto:privacy@mediclaimpilot.com" className="text-blue-600 underline">
            privacy@mediclaimpilot.com
          </a>
        </Section>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8 border-t border-gray-200">
        <Link href="/" className="underline hover:text-gray-600">Back to MediClaimPilot</Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
