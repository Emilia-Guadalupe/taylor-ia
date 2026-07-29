/**
 * resumeExporter.js
 * Builds a clean, single-column, ATS-friendly .docx resume from structured
 * data the user filled in on the frontend. Deliberately avoids everything
 * that trips up ATS parsers: tables, columns, text boxes, headers/footers,
 * icons/graphics, non-standard fonts, and decorative colors.
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

const FONT = "Calibri";
const BODY_SIZE = 22; // half-points -> 11pt
const NAME_SIZE = 32; // 16pt
const HEADING_SIZE = 24; // 12pt

const HEADINGS = {
  en: {
    summary: "Professional Summary",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects & Initiatives",
    education: "Education",
    languages: "Languages",
  },
  es: {
    summary: "Resumen Profesional",
    skills: "Habilidades",
    experience: "Experiencia",
    projects: "Proyectos e Iniciativas",
    education: "Educación",
    languages: "Idiomas",
  },
};

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function heading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    border: { bottom: { color: "999999", space: 2, style: "single", size: 4 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: HEADING_SIZE, font: FONT }),
    ],
  });
}

function bodyParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, size: BODY_SIZE, font: FONT, ...opts })],
  });
}

function bulletParagraph(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: BODY_SIZE, font: FONT })],
  });
}

/**
 * data: {
 *   name, email, phone, location, link,
 *   summary,
 *   skills: string[],
 *   experience: [{ company, role, dates, bullets: string[] }],
 *   education: string,
 *   languages: [{ language, level }],
 *   projects: [{ name, description }],
 *   lang: "en" | "es",
 * }
 */
export function buildAtsResumeDocx(data) {
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
  } = data;

  const h = HEADINGS[lang] || HEADINGS.en;
  const children = [];

  // --- Header: name + contact line, plain paragraphs (not a real docx
  // header/footer, which some ATS parsers skip entirely) ---
  if (name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 40 },
        children: [new TextRun({ text: name, bold: true, size: NAME_SIZE, font: FONT })],
      })
    );
  }

  const contactLine = [location, phone, email, link].filter(Boolean).join("   |   ");
  if (contactLine) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: BODY_SIZE, font: FONT, color: "444444" })],
      })
    );
  }

  // --- Summary ---
  if (summary) {
    children.push(heading(h.summary));
    children.push(bodyParagraph(summary));
  }

  // --- Skills ---
  if (skills.length) {
    children.push(heading(h.skills));
    children.push(bodyParagraph(skills.map(capitalize).join("  •  ")));
  }

  // --- Experience ---
  if (experience.length) {
    children.push(heading(h.experience));
    for (const job of experience) {
      const titleLine = [job.role, job.company].filter(Boolean).join(" - ");
      if (titleLine) {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 20 },
            children: [new TextRun({ text: titleLine, bold: true, size: BODY_SIZE, font: FONT })],
          })
        );
      }
      if (job.dates) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: job.dates, italics: true, size: BODY_SIZE, font: FONT, color: "555555" }),
            ],
          })
        );
      }
      for (const bullet of job.bullets || []) {
        if (bullet.trim()) children.push(bulletParagraph(bullet.trim()));
      }
    }
  }

  // --- Projects & Initiatives ---
  if (projects.length) {
    children.push(heading(h.projects));
    for (const project of projects) {
      if (project.name) {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 20 },
            children: [new TextRun({ text: project.name, bold: true, size: BODY_SIZE, font: FONT })],
          })
        );
      }
      if (project.description) {
        children.push(bodyParagraph(project.description));
      }
    }
  }

  // --- Education ---
  if (education) {
    children.push(heading(h.education));
    for (const line of education.split("\n").map((l) => l.trim()).filter(Boolean)) {
      children.push(bodyParagraph(line));
    }
  }

  // --- Languages ---
  if (languages.length) {
    children.push(heading(h.languages));
    const languageLine = languages
      .map((l) => [l.language, l.level].filter(Boolean).join(" — "))
      .filter(Boolean)
      .join("   |   ");
    if (languageLine) children.push(bodyParagraph(languageLine));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_SIZE },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 }, // ~0.5-0.6in, single column
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
