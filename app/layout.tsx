import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediClaimPilot — AI Medical Bill Auditor & Insurance Denial Fighter",
  description: "Upload your medical bill or denial letter. We audit every charge, fight every wrongful denial, and put money back in your pocket.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
