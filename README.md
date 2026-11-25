# MediClaimPilot — AI Medical Bill Auditor & Insurance Denial Fighter

**Fight back against unfair US medical bills using 6 AI agents powered by Google Gemini.**

> MediClaimPilot reads a US medical bill or EOB, flags charges worth questioning, decodes denial codes, and drafts dispute and appeal letters for you to review — free for patients.

**Technical report:** *MediClaimPilot: A Multi-Agent LLM System for Auditing US Medical Bills and Drafting Patient Disputes* (v1.0, November 2026) — see [`docs/`](docs/) and [Citation](#citation). It describes the design, one real-world case study, and the system's limits.

---

## What It Does

Upload a US medical bill or Explanation of Benefits (EOB) document and MediClaimPilot runs a 6-agent AI pipeline:

| Agent | What It Does |
|---|---|
| 1. Parser | Extracts CPT codes, CARC/RARC codes, plan type, charges |
| 2. Bill Auditor | Flags possible duplicate charges, unbundling, prices far above Medicare rates, upcoding and phantom charges (rule checks + LLM review) |
| 3. Denial Analyzer | Decodes denial codes and identifies the applicable federal law |
| 4. Strategy Agent | Builds your appeal plan from the findings (rule-based) |
| 5. Document Writer | Drafts dispute and appeal letters for you to review before sending |
| 6. Deadline Tracker | Creates a calendar of appeal deadlines and check-ins (rule-based) |

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
- **Rule references** — letters point to the billing rule or appeal right behind each finding
- **Deadline tracking** — internal appeal windows, external review deadlines
- **Privacy-first** — your document is processed in memory and never permanently stored

---

## Tech Stack

- **Frontend:** Next.js 14.2, React 18, Tailwind CSS
- **AI:** Google Gemini Flash, model alias `gemini-flash-latest`, temperature 0 (via `@google/generative-ai`)
- **Reference data:** 35 CPT codes with Medicare rates and 18 CARC denial codes, as fixed lookup tables (no NCCI edit table yet)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (a Docker build for Google Cloud Run is also included)
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

## Limitations

- Accuracy has not yet been measured across many bills; the technical report documents one real-world case study only.
- Bundling (NCCI) findings come from LLM review, not an NCCI edit table, so verify them before disputing.
- A charge above the Medicare rate can be legitimate under a private contract; it is a flag for review, not proof of error.
- MediClaimPilot is not a HIPAA covered entity or business associate and is not certified for HIPAA compliance.

---

## Disclaimer

MediClaimPilot is an informational tool only. It does not provide legal advice. AI-generated appeal letters should be reviewed by a licensed healthcare attorney or patient advocate before submission. Results may contain errors — always verify independently.

---

## License

MIT License — free to use, modify, and distribute.

---

## Citation

If you use MediClaimPilot or its technical report, please cite it using [`CITATION.cff`](CITATION.cff). A DOI will be added here once the release is archived on Zenodo.

---

*Built for the International AI Agents Hackathon · Powered by Google Gemini AI*
