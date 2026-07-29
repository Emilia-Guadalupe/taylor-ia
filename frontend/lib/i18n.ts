export type Lang = "en" | "es";

export interface Translation {
  pageTitle: string;
  skipToContent: string;
  brandName: string;
  brandTag: string;
  heroTitleLines: [string, string];
  heroSub: string;
  panelLabel1: string;
  yourResume: string;
  dropLine1: string;
  dropLine2: string;
  chooseFile: string;
  panelLabel2: string;
  jobPosting: string;
  jobPlaceholder: string;
  measureButton: string;
  measuringButton: string;
  uploadFirst: string;
  pasteFirst: string;
  measuringStatus: string;
  doneStatus: string;
  genericError: string;
  networkError: string;
  invalidFile: string;
  fitScoreLabel: string;
  stitchedIn: string;
  looseThreads: string;
  nothingMatched: string;
  noGaps: string;
  panelLabel3: string;
  suggestedAlterations: string;
  noSuggestions: string;
  tailoredSummary: string;
  was: string;
  tryLabel: string;
  overallAdvice: string;
  footer: string;
  structureAdviceLabel: string;
  group1Heading: string;
  flagged: string;
  nothingFlagged: string;
  group2Heading: string;
  noGapsAdvice: string;
  group3Heading: string;
  formulaExplainer: string;
  group4Heading: string;
  noIrrelevantExperience: string;
  keepVerdict: string;
  trimVerdict: string;
  removeVerdict: string;
  panelLabel4: string;
  atsBuilderHeading: string;
  atsBuilderIntro: string;
  fieldFullName: string;
  fieldEmail: string;
  fieldPhone: string;
  addPhone: string;
  fieldLocation: string;
  fieldLink: string;
  linkPlaceholder: string;
  fieldSummary: string;
  fieldSkills: string;
  addSuggestedKeyword: string;
  fieldExperience: string;
  fieldRole: string;
  fieldCompany: string;
  fieldDates: string;
  bulletPlaceholder: string;
  addBullet: string;
  removeBullet: string;
  addJob: string;
  removeJob: string;
  addProjects: string;
  fieldProjects: string;
  fieldProjectName: string;
  fieldProjectDescription: string;
  projectDescriptionPlaceholder: string;
  addProject: string;
  removeProject: string;
  fieldEducation: string;
  educationPlaceholder: string;
  addLanguages: string;
  fieldLanguages: string;
  fieldLanguage: string;
  fieldLevel: string;
  levelPlaceholder: string;
  addLanguage: string;
  removeLanguage: string;
  downloadButton: string;
  downloadingButton: string;
  requiredFieldsError: string;
}

export const translations: Record<Lang, Translation> = {
  en: {
    pageTitle: "A CV tailored to you",
    skipToContent: "Skip to main content",
    brandName: "Tailor.ia",
    brandTag: "measure twice, apply once",
    heroTitleLines: ["Cut your resume", "to fit the job."],
    heroSub:
      "Upload your resume, paste the posting, and see exactly where the seams need taking in — plus honest, non-fabricated rewrites in the job's own language.",
    panelLabel1: "01 — the fabric",
    yourResume: "Your resume",
    dropLine1: "Drop a .docx or .pdf here",
    dropLine2: "or",
    chooseFile: "choose a file",
    panelLabel2: "02 — the pattern",
    jobPosting: "Job posting",
    jobPlaceholder:
      "Paste the full job listing here — description, requirements, everything. More text means a better fit reading.",
    measureButton: "Measure the fit",
    measuringButton: "Measuring…",
    uploadFirst: "Upload a resume first.",
    pasteFirst: "Paste the job posting first.",
    measuringStatus: "Measuring the fit…",
    doneStatus: "Done.",
    genericError: "Something went wrong.",
    networkError: "Could not reach the backend. Is the server running?",
    invalidFile: "Please choose a .docx or .pdf file.",
    fitScoreLabel: "FIT SCORE",
    stitchedIn: "Stitched in (kew words already in the resume)",
    looseThreads: "Loose threads",
    nothingMatched: "Nothing matched yet.",
    noGaps: "No gaps — strong match.",
    panelLabel3: "03 — the alterations",
    suggestedAlterations: "Suggested alterations",
    noSuggestions: "No suggestions available.",
    tailoredSummary: "Tailored summary",
    was: "Was",
    tryLabel: "Try",
    overallAdvice: "Overall advice",
    footer: "Nothing you didn't already have — just tailored to fit.",
    structureAdviceLabel: "Suggested structure",
    group1Heading: "Unnecessary or risky details",
    flagged: "Found",
    nothingFlagged: "Nothing unnecessary found — your resume keeps it lean.",
    group2Heading: "Missing keywords",
    noGapsAdvice: "No keyword gaps — nothing to add here.",
    group3Heading: "Rewrites — the X-Y-Z formula",
    formulaExplainer:
      "Google's formula for strong resume bullets: “Accomplished [X] as measured by [Y], by doing [Z].”",
    group4Heading: "Experience that may not be relevant",
    noIrrelevantExperience: "Everything in your resume looks relevant to this role.",
    keepVerdict: "Keep it",
    trimVerdict: "Trim it down",
    removeVerdict: "Consider removing",
    panelLabel4: "04 — the finished piece",
    atsBuilderHeading: "Your ATS-ready resume",
    atsBuilderIntro:
      "Many resumes get rejected before a human ever sees them, because columns, tables, icons, and decorative layouts confuse applicant tracking systems (ATS). Fill the inputs below with your personal data and our suggestions — review it, then download a single-column, plain-formatted .docx built to parse cleanly.",
    fieldFullName: "Full name",
    fieldEmail: "Email",
    fieldPhone: "Phone",
    addPhone: "+ Add phone number",
    fieldLocation: "Location (city, state — not a full address)",
    fieldLink: "GitHub, portfolio, or website link",
    linkPlaceholder: "e.g. github.com/yourname",
    fieldSummary: "Professional summary",
    fieldSkills: "Skills (comma-separated)",
    addSuggestedKeyword: "Tap to add if it's genuinely true:",
    fieldExperience: "Experience",
    fieldRole: "Job title",
    fieldCompany: "Company",
    fieldDates: "Dates (e.g. 2021 – Present)",
    bulletPlaceholder: "Paste your rewritten experience suggestions here — fill in any real numbers first.",
    addBullet: "+ Add bullet",
    removeBullet: "Remove",
    addJob: "+ Add another role",
    removeJob: "Remove this role",
    addProjects: "+ Add projects or initiatives",
    fieldProjects: "Projects & initiatives",
    fieldProjectName: "Project / initiative name",
    fieldProjectDescription: "Description",
    projectDescriptionPlaceholder:
      "e.g. running a programming livestream channel, an open-source project, a side project…",
    addProject: "+ Add another project",
    removeProject: "Remove",
    fieldEducation: "Education",
    educationPlaceholder: "Degree, school, year — one per line",
    addLanguages: "+ Add languages",
    fieldLanguages: "Languages",
    fieldLanguage: "Language",
    fieldLevel: "Level",
    levelPlaceholder: "e.g. Native, Advanced, B2…",
    addLanguage: "+ Add another language",
    removeLanguage: "Remove",
    downloadButton: "Download ATS resume (.docx)",
    downloadingButton: "Preparing file…",
    requiredFieldsError: "Please add your name and email before downloading.",
  },
  es: {
    pageTitle: "CV a tu medida",
    skipToContent: "Ir al contenido principal",
    brandName: "Sastre.ia",
    brandTag: "Un CV a tu medida",
    heroTitleLines: ["Ajustá tu CV", "a la postulación."],
    heroSub:
      "Subí tu currículum, pegá la oferta y descubrí exactamente dónde ajustar las costuras — incluso con propuestas de reescritura. Propuestas claras, sin inventos, en el lenguaje de la oferta.",
    panelLabel1: "01 — la tela",
    yourResume: "Tu currículum",
    dropLine1: "Suelta un .docx o .pdf aquí",
    dropLine2: "o",
    chooseFile: "elige un archivo",
    panelLabel2: "02 — el molde",
    jobPosting: "Oferta de trabajo",
    jobPlaceholder:
      "Pega acá la oferta completa — descripción, requisitos, todo. Cuanto más texto, la lectura más precisa.",
    measureButton: "Empezar el trabajo de costura",
    measuringButton: "Midiendo…",
    uploadFirst: "Subí un CV primero.",
    pasteFirst: "Pegá primero la oferta de trabajo.",
    measuringStatus: "Midiendo el nuevo traje…",
    doneStatus: "Listo.",
    genericError: "Algo salió mal.",
    networkError: "No se pudo conectar con el servidor. ¿Está conectando?",
    invalidFile: "Elige un archivo .docx o .pdf.",
    fitScoreLabel: "PUNTAJE DE AJUSTE",
    stitchedIn: "Puntadas (palabras clave) ya incluidas",
    looseThreads: "Hilos sueltos",
    nothingMatched: "Todavía no hay coincidencias.",
    noGaps: "Sin cambios necesarios — muy buen CV.",
    panelLabel3: "03 — los arreglos",
    suggestedAlterations: "Arreglos sugeridos",
    noSuggestions: "No hay sugerencias disponibles.",
    tailoredSummary: "CV a medida",
    was: "Antes",
    tryLabel: "Recomendación",
    overallAdvice: "Consejo general",
    footer: "Nada que no tuvieras ya — solo que ajustado a tu medida.",
    structureAdviceLabel: "Estructura sugerida",
    group1Heading: "Datos innecesarios o de riesgo",
    flagged: "Encontrado",
    nothingFlagged: "No se encontró nada innecesario — tu currículum es directo.",
    group2Heading: "Palabras clave faltantes",
    noGapsAdvice: "Sin brechas de palabras clave — no hay nada que agregar aquí.",
    group3Heading: "Reescrituras — la fórmula X-Y-Z",
    formulaExplainer:
      "La fórmula de Google para experiencias laborales sólidas: “Logré [X], medido por [Y], haciendo [Z].”",
    group4Heading: "Experiencia que podría no ser relevante",
    noIrrelevantExperience: "Todo en tu currículum parece relevante para este puesto.",
    keepVerdict: "Mantenerla",
    trimVerdict: "Acortarla",
    removeVerdict: "Considerá quitarla",
    panelLabel4: "04 — la pieza terminada",
    atsBuilderHeading: "Tu currículum listo para ATS",
    atsBuilderIntro:
      "Muchos currículums se rechazan antes de que una persona los vea, porque las columnas, tablas, íconos y diseños decorativos confunden a los sistemas de seguimiento de candidatos (ATS). Completá los campos de abajo, revísalo y descarga un .docx de una sola columna, con formato simple, diseñado para leerse sin problemas.",
    fieldFullName: "Nombre completo",
    fieldEmail: "Correo electrónico",
    fieldPhone: "Teléfono",
    addPhone: "+ Agregar teléfono",
    fieldLocation: "Ubicación (ciudad, estado — no la dirección completa)",
    fieldLink: "Enlace a GitHub, portfolio o sitio web",
    linkPlaceholder: "ej. github.com/tunombre",
    fieldSummary: "Resumen profesional",
    fieldSkills: "Habilidades (separadas por comas)",
    addSuggestedKeyword: "Toca para agregar si es realmente cierto:",
    fieldExperience: "Experiencia",
    fieldRole: "Puesto",
    fieldCompany: "Empresa",
    fieldDates: "Fechas (ej. 2021 – Presente)",
    bulletPlaceholder: "Acá podés copiar las sugerencias de reescritura para tu experiencia — completá antes los datos o porcentajes reales.",
    addBullet: "+ Agregar viñeta",
    removeBullet: "Quitar",
    addJob: "+ Agregar otro puesto",
    removeJob: "Quitar este puesto",
    addProjects: "+ Agregar proyectos o iniciativas",
    fieldProjects: "Proyectos e iniciativas",
    fieldProjectName: "Nombre del proyecto o iniciativa",
    fieldProjectDescription: "Descripción",
    projectDescriptionPlaceholder:
      "ej. llevar un canal de streaming de programación, un proyecto open-source, un proyecto personal…",
    addProject: "+ Agregar otro proyecto",
    removeProject: "Quitar",
    fieldEducation: "Educación",
    educationPlaceholder: "Título, institución, año — uno por línea",
    addLanguages: "+ Agregar idiomas",
    fieldLanguages: "Idiomas",
    fieldLanguage: "Idioma",
    fieldLevel: "Nivel",
    levelPlaceholder: "ej. Nativo, Avanzado, B2…",
    addLanguage: "+ Agregar otro idioma",
    removeLanguage: "Quitar",
    downloadButton: "Descargar currículum ATS (.docx)",
    downloadingButton: "Preparando archivo…",
    requiredFieldsError: "Agrega tu nombre y tu correo electrónico antes de descargar.",
  },
};

// Known backend messages, translated by exact match. Anything from the API
// that isn't in this table (e.g. raw Anthropic error details) is shown as-is,
// since we can't safely translate arbitrary upstream error text.
const API_MESSAGE_MAP: Record<string, Partial<Record<Lang, string>>> = {
  "Please paste the job posting text.": {
    es: "Pegá el texto de la oferta de empleo.",
  },
  "Please upload a resume (.docx or .pdf).": {
    es: "Subí un currículum (.docx o .pdf).",
  },
  "Unsupported file type. Please upload a .docx or .pdf resume.": {
    es: "Tipo de archivo no compatible. Sube un currículum en .docx o .pdf.",
  },
  "Could not read the uploaded file.": {
    es: "No se pudo leer el archivo subido.",
  },
  "Unexpected server error.": {
    es: "Error inesperado del servidor.",
  },
  "ANTHROPIC_API_KEY is not set on the server. Add it to your .env file to enable AI-powered suggestions.": {
    es: "No se configuró ANTHROPIC_API_KEY en el servidor. Agrégala a tu archivo .env para activar las sugerencias con IA.",
  },
  "Please add your name and email before downloading.": {
    es: "Agrega tu nombre y tu correo electrónico antes de descargar.",
  },
  "Could not generate the resume file.": {
    es: "No se pudo generar el archivo del currículum.",
  },
};

/**
 * Translates a known backend message into the given language.
 * Falls back to the original message if there's no exact match
 * (e.g. dynamic messages that include upstream API error details).
 */
export function translateApiMessage(
  message: string | null | undefined,
  lang: Lang
): string | null | undefined {
  if (!message || lang === "en") return message;
  const entry = API_MESSAGE_MAP[message];
  return entry?.[lang] || message;
}
