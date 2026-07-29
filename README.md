# Tailor — resume-to-job fit tool

Upload a resume (.docx/.pdf), paste a job posting, and get:

- A **fit score** based on keyword/skill overlap
- **Matched** keywords already in your resume
- **Missing** keywords the job cares about but your resume doesn't mention
- **AI-generated rewrite suggestions** (via the Claude API) that reword your
  *existing* experience into the job's language — it's instructed never to
  invent skills or experience you don't have.

Two separate apps, both Node/JavaScript: an **Express JSON API** and a
**Next.js/React** frontend that calls it.

## Project structure

```
resume-tailor/
├── backend/                     Express JSON API
│   ├── server.js                Routes: /api/analyze, /api/export-resume, /api/health
│   ├── src/
│   │   ├── resumeParser.js      .docx / .pdf → plain text (mammoth + unpdf) + contact hints
│   │   ├── keywordMatcher.js    keyword extraction + gap analysis (no AI needed)
│   │   ├── aiSuggester.js       Calls Claude for tailored rewrite suggestions
│   │   └── resumeExporter.js    Builds the ATS-friendly .docx download
│   ├── package.json
│   └── .env.example
└── frontend/                    Next.js (App Router) UI
    ├── app/
    │   ├── layout.js             fonts + global metadata
    │   ├── page.js                main page, holds all state
    │   └── globals.css
    ├── components/
    │   ├── ResumeDropzone.js
    │   ├── TapeMeasure.js         the fit-score visual
    │   ├── KeywordTags.js
    │   ├── AISuggestions.js
    │   ├── LanguageToggle.js
    │   └── AtsResumeBuilder.js    editable form + docx download
    ├── lib/
    │   ├── api.js                fetch wrappers for the backend API
    │   ├── i18n.js                translation strings (EN/ES)
    │   └── LanguageContext.js
    ├── package.json
    └── .env.local.example
```

## Setup

Requires **Node 20+** for both apps.

### 1. Backend (Express API)

```bash
cd resume-tailor/backend
npm install
cp .env.example .env
# edit .env and paste your key from https://console.anthropic.com/settings/keys
# (AI suggestions need this — fit score & keyword matching work without it)
npm start
```

Runs on **http://localhost:5000**. Use `npm run dev` instead of `npm start`
for auto-restart on file changes (uses Node's built-in `--watch`).

### 2. Frontend (Next.js)

In a second terminal:

```bash
cd resume-tailor/frontend
npm install
cp .env.local.example .env.local
# defaults to NEXT_PUBLIC_API_URL=http://localhost:5000, which matches the backend above
npm run dev
```

Open **http://localhost:3000** in your browser.

Both servers need to be running at the same time — the frontend is just the
UI; all parsing/matching/AI work happens in the backend API.

## How the matching works

`src/keywordMatcher.js` combines two techniques, no external NLP service required:

1. A curated dictionary of ~150 common tech/business/soft skills, matched
   against the job text (with a boost if they appear near phrases like
   "required" or "experience with").
2. Frequency-based 1–2 word phrase extraction for anything domain-specific
   that isn't in the dictionary.

Those keywords are then checked against your resume text to produce the
matched/missing lists and the fit score. This part is fast, free, and works
even without an API key.

## How the AI suggestions work

`src/aiSuggester.js` sends the resume text, job text, and the keyword gap list
to Claude (`claude-sonnet-4-6` by default — change via `ANTHROPIC_MODEL` in
`.env`) with a system prompt that explicitly forbids fabricating experience.
It returns three grouped sections, shown in that order in "03 — the
alterations":

1. **Unnecessary or risky details** — personal info actually found in the
   resume (full street address, nationality, date of birth, marital status,
   etc.) that's commonly unnecessary or risky on a professional resume, with
   a reason and a safer alternative for each.
2. **Missing keywords** — one tip per job keyword the resume doesn't
   mention: either how to honestly reword existing experience to surface it,
   or a plain admission that it's a genuine gap (never fabricated).
3. **Rewrites — the X-Y-Z formula** — 3-5 resume bullets rewritten using
   Google's People Analytics formula, *"Accomplished [X] as measured by [Y],
   by doing [Z]."* Each rewrite breaks out X (the accomplishment), Y (the
   metric — or a clearly-marked placeholder if the resume has no real
   number), and Z (the method), and weaves in missing keywords where the
   resume content honestly supports it.

## ATS-friendly resume builder & download

"04 — the finished piece" is a form pre-filled from your resume and the AI
suggestions above it — name/email/phone (best-effort guessed from the resume
text), summary, skills, experience bullets, and education. You review and
edit everything, then download it as a **single-column, plain-formatted
.docx** built to parse cleanly in applicant tracking systems.

This matters because a lot of visually nice resumes — multi-column layouts,
tables, icons, text boxes, graphics — get mangled or silently dropped by ATS
parsers before a human ever sees them. The generated file deliberately avoids
all of that: one column, standard fonts, plain bullet lists, no tables, no
headers/footers, no colors beyond a little muted gray for secondary text.

- `backend/src/resumeExporter.js` builds the .docx using the `docx` npm
  library.
- `POST /api/export-resume` takes the structured form JSON and returns the
  file as a download (`Content-Disposition: attachment`).
- `backend/src/resumeParser.js` also exports `extractContactHints()`, a
  best-effort (non-authoritative) regex pass over the resume text to guess a
  name/email/phone for pre-filling the form — the user reviews and can
  correct any of it before downloading.
- The missing-keyword chips from Group 2 above are clickable here too — tap
  one to add it to the Skills field, but only do that if it's honestly true.

## Extending it

Ideas if you want to keep building:
- Swap the paste-only job input for a URL fetch (LinkedIn's markup changes
  often and may require a scraping library or their API)
- Persist past analyses per user (add a database + auth)
- Offer a PDF download alongside the .docx (both are ATS-safe as long as the
  PDF is text-based, not a scanned image)
- Support multiple resume versions / A-B comparison against one job

## Language toggle

There's an EN / ESP switch in the top bar. It translates all the interface
copy (`frontend/lib/i18n.js`), and also tells the backend which language to
generate the AI suggestions in — so switching to ESP gives you a fully
Spanish tailored summary, bullet rewrites, and advice, not just a translated
shell around English AI output.

Known backend error messages (e.g. "Please upload a resume...") are also
translated on the frontend via an exact-match table in `i18n.js`. Anything
dynamic that comes straight from the Anthropic API (e.g. a raw upstream error
string) is shown as-is, since it can't be safely translated without guessing.

## Notes / limits

- Max upload size: 10 MB (adjustable in `backend/server.js`, the multer `limits` option)
- Scanned/image-only PDFs won't extract text — export as text-based PDF or
  DOCX instead
- PDF parsing uses `unpdf` (a maintained wrapper around Mozilla's PDF.js) —
  it was swapped in after the older, unmaintained `pdf-parse` failed on PDFs
  using a modern xref format
- The keyword list depends on job-posting length; longer, detailed postings
  give better results
- CORS on the backend only allows `FRONTEND_ORIGIN` (default
  `http://localhost:3000`) — update that env var when you deploy the
  frontend somewhere else
- `next/font/google` fetches font files at build time, so the frontend
  needs normal internet access the first time you `npm run build` / `npm run dev`
- Run `npm audit` in both `backend/` and `frontend/` periodically — dependency
  advisories get patched over time, so it's worth checking before deploying
