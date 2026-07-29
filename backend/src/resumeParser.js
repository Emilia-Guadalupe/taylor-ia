/**
 * resumeParser.js
 * Extracts plain text from an uploaded resume file (.docx or .pdf).
 */
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export class UnsupportedFileTypeError extends Error {}
export class EmptyResumeError extends Error {}

async function extractTextFromDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

async function extractTextFromPdf(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

/**
 * Dispatch to the correct extractor based on file extension.
 * Throws UnsupportedFileTypeError for anything other than .docx / .pdf,
 * and EmptyResumeError if no text could be extracted.
 */
export async function extractResumeText(filename, buffer) {
  const lower = filename.toLowerCase();
  let text;

  if (lower.endsWith(".docx")) {
    text = await extractTextFromDocx(buffer);
  } else if (lower.endsWith(".pdf")) {
    text = await extractTextFromPdf(buffer);
  } else {
    throw new UnsupportedFileTypeError(
      "Unsupported file type. Please upload a .docx or .pdf resume."
    );
  }

  text = (text || "").trim();
  if (!text) {
    throw new EmptyResumeError(
      "Could not extract any text from this file. If it's a scanned/image-based PDF, " +
        "try exporting your resume as a text-based PDF or DOCX instead."
    );
  }
  return text;
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\(?\d[\d\-.\s()]{6,}\d\)?)/;

/**
 * Best-effort, non-authoritative hints pulled from the raw resume text to
 * pre-fill the ATS resume builder. These are just a starting point — the
 * user reviews and edits everything before downloading.
 */
export function extractContactHints(text) {
  const email = text.match(EMAIL_RE)?.[0] || "";
  const phone = text.match(PHONE_RE)?.[0]?.trim() || "";

  // Heuristic: the name is usually the first short, non-empty line that
  // isn't itself the email/phone and doesn't look like a section header.
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let guessedName = "";
  for (const line of lines.slice(0, 5)) {
    if (line.includes("@")) continue;
    if (PHONE_RE.test(line) && line.replace(/\D/g, "").length >= 7) continue;
    if (line.length > 0 && line.length <= 60) {
      guessedName = line;
      break;
    }
  }

  return { guessedName, email, phone };
}
