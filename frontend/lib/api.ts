import type { Lang } from "@/lib/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface UnnecessaryInfoItem {
  item: string;
  reason: string;
  suggestion?: string;
}

export interface MissingKeywordAdvice {
  keyword: string;
  tip: string;
}

export interface BulletRewrite {
  original?: string;
  suggested: string;
  x_accomplished?: string;
  y_measured_by?: string;
  z_by_doing?: string;
  why?: string;
}

export type ExperienceVerdict = "keep" | "trim" | "remove";

export interface IrrelevantExperienceAdvice {
  experience: string;
  keep_or_cut: ExperienceVerdict;
  advice: string;
}

export interface AiSuggestions {
  tailored_summary?: string;
  structure_advice?: string;
  unnecessary_info?: UnnecessaryInfoItem[];
  missing_keywords_advice?: MissingKeywordAdvice[];
  bullet_rewrites?: BulletRewrite[];
  irrelevant_experience_advice?: IrrelevantExperienceAdvice[];
  overall_advice?: string;
}

export interface ResumeHints {
  guessedName?: string;
  email?: string;
  phone?: string;
}

export interface AnalyzeResult {
  match_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  ai_suggestions: AiSuggestions | null;
  ai_error?: string | null;
  resume_hints?: ResumeHints;
}

export interface ExportJob {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface ExportLanguage {
  language: string;
  level: string;
}

export interface ExportProject {
  name: string;
  description: string;
}

export interface ExportResumePayload {
  name: string;
  email: string;
  phone: string;
  location: string;
  link: string;
  summary: string;
  skills: string[];
  experience: ExportJob[];
  education: string;
  languages: ExportLanguage[];
  projects: ExportProject[];
  lang: Lang;
}

export class ApiError extends Error {}

/**
 * Sends the resume file + job posting text to the backend.
 * Returns the parsed JSON body whether the request succeeded or failed,
 * so the caller can read `.error` on non-OK responses.
 */
export async function analyzeResume(
  file: File,
  jobText: string,
  lang: Lang = "en"
): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_text", jobText);
  formData.append("lang", lang);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new ApiError("Could not reach the backend. Is the server running?");
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err) {
    throw new ApiError("The backend returned an unexpected response.");
  }

  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong analyzing your resume.");
  }

  return data as AnalyzeResult;
}

/**
 * Sends the structured ATS resume form data to the backend and returns the
 * generated .docx as a Blob for the caller to trigger a download with.
 */
export async function exportResume(payload: ExportResumePayload): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/export-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new ApiError("Could not reach the backend. Is the server running?");
  }

  if (!res.ok) {
    let message = "Could not generate the resume file.";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // response wasn't JSON; keep the default message
    }
    throw new ApiError(message);
  }

  return res.blob();
}
