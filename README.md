# MediClaimPilot — AI Medical Bill Auditor & Insurance Denial Fighter

**Fight back against unfair US medical bills using 6 AI agents powered by Google Gemini.**

> 80% of medical bills contain errors. Insurance denies 86% of valid claims.  
> MediClaimPilot audits every charge, decodes every denial, and writes your appeal letters — instantly and free.

---

## What It Does

Upload a US medical bill or Explanation of Benefits (EOB) document and MediClaimPilot runs a 6-agent AI pipeline:

| Agent | What It Does |
|---|---|
| 1. Parser | Extracts CPT codes, CARC/RARC codes, plan type, charges |
| 2. Bill Auditor | Detects duplicate charges, upcoding, unbundling, phantom charges |
| 3. Denial Analyzer | Decodes denial codes and identifies the applicable federal law |
| 4. Strategy Agent | Builds your appeal strategy citing ERISA, ACA, No Surprises Act |
| 5. Document Writer | Generates ready-to-send appeal letters with legal citations |
| 6. Deadline Tracker | Creates a calendar of all appeal deadlines and check-ins |

---

## Supported US Insurance Plans

- Medicare & Medicare Advantage
- Medicaid
- ACA Marketplace plans
- ERISA employer-sponsored plans
- No Surprises Act (NSA) claims
- Mental Health Parity (MHPAEA) cases

---

## Key Features

- **Real-time streaming** — watch each AI agent work live
- **Medicare rate comparison** — see exactly how much you were overcharged vs. Medicare rates
- **CARC/RARC code decoder** — plain-English explanation of every denial code
- **Federal law citations** — appeal letters cite specific US statutes
- **Deadline tracking** — internal appeal windows, external review deadlines
- **HIPAA-safe** — your document is processed in memory and never permanently stored

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **AI:** Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Streaming:** Server-Sent Events (SSE)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API key
- A Supabase project

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor to create the required tables.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

This app is optimized for Vercel deployment. Add the three environment variables above to your Vercel project settings and deploy from this repository.

---

## Privacy & Compliance

- No PHI (Protected Health Information) is stored permanently
- Documents are processed in memory only and discarded after each session
- Analysis summaries are auto-deleted after 24 hours
- See [Privacy Policy](/privacy) and [Terms of Service](/terms)

---

## Disclaimer

MediClaimPilot is an informational tool only. It does not provide legal advice. AI-generated appeal letters should be reviewed by a licensed healthcare attorney or patient advocate before submission. Results may contain errors — always verify independently.

---

## License

MIT License — free to use, modify, and distribute.

---

*Built for the International AI Agents Hackathon · Powered by Google Gemini AI*
