/**
 * server.js
 * Pure JSON API exposing resume parsing, keyword-gap matching, and AI
 * suggestions. The frontend is a separate Next.js app in /frontend.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

import { extractResumeText, extractContactHints, UnsupportedFileTypeError, EmptyResumeError } from "./src/resumeParser.js";
import { extractJobKeywords, matchResumeToJob } from "./src/keywordMatcher.js";
import { getAiSuggestions, AISuggestionError } from "./src/aiSuggester.js";
import { buildAtsResumeDocx } from "./src/resumeExporter.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the Next.js dev server (and whatever origin you deploy it to) to call this API.
// Set FRONTEND_ORIGIN in .env for production (e.g. https://your-app.vercel.app).
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: [FRONTEND_ORIGIN, "http://localhost:3000"] }));
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  const jobText = (req.body.job_text || "").trim();
  const lang = req.body.lang === "es" ? "es" : "en";
  const resumeFile = req.file;

  if (!jobText) {
    return res.status(400).json({ error: "Please paste the job posting text." });
  }
  if (!resumeFile) {
    return res.status(400).json({ error: "Please upload a resume (.docx or .pdf)." });
  }

  let resumeText;
  try {
    resumeText = await extractResumeText(resumeFile.originalname, resumeFile.buffer);
  } catch (err) {
    if (err instanceof UnsupportedFileTypeError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof EmptyResumeError) {
      return res.status(422).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Could not read the uploaded file." });
  }

  const jobKeywords = extractJobKeywords(jobText);
  const { matched, missing, matchScore } = matchResumeToJob(resumeText, jobKeywords);
  const resumeHints = extractContactHints(resumeText);

  const result = {
    match_score: matchScore,
    matched_keywords: matched,
    missing_keywords: missing,
    resume_hints: resumeHints,
    ai_suggestions: null,
    ai_error: null,
  };

  try {
    result.ai_suggestions = await getAiSuggestions(resumeText, jobText, matched, missing, lang);
  } catch (err) {
    if (err instanceof AISuggestionError) {
      result.ai_error = err.message;
    } else {
      console.error(err);
      result.ai_error = "Unexpected error generating AI suggestions.";
    }
  }

  res.json(result);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ai_configured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post("/api/export-resume", async (req, res) => {
  const {
    name = "",
    email = "",
    phone = "",
    location = "",
    link = "",
    summary = "",
    skills = [],
    experience = [],
    education = "",
    languages = [],
    projects = [],
    lang = "en",
  } = req.body || {};

  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ error: "Please add your name and email before downloading." });
  }

  try {
    const buffer = await buildAtsResumeDocx({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      link: link.trim(),
      summary: summary.trim(),
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      experience: Array.isArray(experience) ? experience : [],
      education: education.trim(),
      languages: Array.isArray(languages) ? languages : [],
      projects: Array.isArray(projects) ? projects : [],
      lang: lang === "es" ? "es" : "en",
    });

    const safeName = name.trim().replace(/[^a-z0-9]+/gi, "_").slice(0, 40) || "resume";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}_ATS_resume.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate the resume file." });
  }
});

// Multer errors (e.g. file too large) land here instead of the route handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Tailor backend running on http://localhost:${PORT}`);
});
