/**
 * keywordMatcher.js
 * Lightweight, dependency-free keyword/skill extraction and gap analysis
 * between a job posting and a resume. No heavy NLP libraries required.
 */

const STOPWORDS = new Set(
  `
a an the and or but if then else for while with without within into onto
of to in on at by from as is are was were be been being have has had do
does did will would shall should can could may might must this that these
those it its its you your youre we our i my me he she his her they their
them not no nor so than too very just about above below over under again
further here there when where why how all any both each few more most other
some such only own same so than too s t can will just dont should now our
job role position responsibilities requirements qualifications preferred
required require requires must nice have needed minimum
experience years work working team teams company looking seeking candidate
candidates strong excellent ability skills including etc using across
various new plus per year years month months per hour salary benefits
apply application applicants equal opportunity employer email resume

de la el en con para que un una unos unas los las del al es son ser estar
esta esta esto estos estas ese esa esos esas entre sin sobre ya muy tambien
tambien o y no si lo le les nos se su sus tu tus mi mis nuestro nuestra
nuestros nuestras que cual cuales quien quienes cuando donde porque aunque
desde hasta hacia durante mediante segun e u pero como este mas por eso
empleo puesto posicion responsabilidades requisitos calificaciones
preferido preferida requerido requerida requeridos requeridas necesario
necesaria deseable experiencia anos ano trabajo trabajando equipo equipos
empresa buscamos busca buscando candidato candidata candidatos candidatas
fuerte excelente habilidad habilidades incluyendo etc usando traves varios
varias nuevo nueva mes meses hora salario beneficios postulate postulacion
aplicar aplicantes igualdad oportunidad empleador correo curriculum cv
hola holaa buenas dias tardes noches saludo saludos cordial cordialmente
atentamente estimado estimada estimados estimadas gracias porfavor favor
abrazo abrazos bendiciones exitos amigo amiga amigos amigas tropa equipo
compañero compañera compañeros compañeras che bueno buenisimo genial
`
    .split(/\s+/)
    .filter(Boolean)
    .map(stripAccents)
);

// Curated multi-domain skills/keywords dictionary. Not exhaustive by design —
// it boosts recall for common terms while the n-gram frequency logic below
// handles anything domain-specific that isn't in this list.
const KNOWN_SKILLS = [
  "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang",
  "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "sql", "nosql",
  "html", "css", "sass", "scss", "less", "tailwind", "tailwindcss",
  "react", "react.js", "angular", "vue", "vue.js", "svelte", "node",
  "node.js", "express", "django", "flask", "fastapi", "spring", "spring boot",
  "rails", "next.js", "webpack", "vite", "babel", "graphql", "rest", "rest api", "restful", "api",
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
  "terraform", "ansible", "ci/cd", "jenkins", "github actions", "gitlab",
  "git", "linux", "bash", "shell scripting", "microservices", "serverless",
  "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "kafka",
  "spark", "hadoop", "airflow", "snowflake", "databricks", "tableau",
  "power bi", "excel", "pandas", "numpy", "scikit-learn", "tensorflow",
  "pytorch", "machine learning", "deep learning", "nlp", "computer vision",
  "data science", "data analysis", "data engineering", "etl", "big data",
  "llm", "large language models", "generative ai", "prompt engineering",
  "langchain", "claude", "claude code", "chatgpt", "codex",
  "github copilot", "cursor", "openai", "anthropic", "gemini",
  "agile", "scrum", "kanban", "jira", "confluence", "product management",
  "project management", "stakeholder management", "cross-functional",
  "leadership", "communication", "problem solving", "critical thinking",
  "team management", "mentoring", "public speaking", "negotiation",
  "sales", "marketing", "seo", "sem", "content marketing", "social media",
  "digital marketing", "email marketing", "crm", "salesforce", "hubspot",
  "google analytics", "a/b testing", "copywriting", "brand strategy",
  "financial modeling", "accounting", "budgeting", "forecasting", "gaap",
  "audit", "risk management", "compliance", "underwriting", "bookkeeping",
  "figma", "sketch", "adobe xd", "photoshop", "illustrator", "ui/ux",
  "user research", "wireframing", "prototyping", "design systems",
  "customer service", "customer success", "account management",
  "supply chain", "logistics", "operations", "six sigma", "lean",
  "recruiting", "talent acquisition", "hr", "onboarding", "payroll",
  "legal research", "contract negotiation", "litigation", "paralegal",
  "clinical research", "patient care", "nursing", "hipaa", "ehr", "emr",
  "manufacturing", "quality assurance", "qa", "testing", "automation",
  "selenium", "cypress", "unit testing", "test automation", "devops",
  "site reliability", "sre", "monitoring", "grafana", "prometheus",
];

// \p{L} (Unicode "letter") instead of A-Za-z so accented characters (á, é,
// í, ó, ú, ñ, ü...) don't split a word in two — e.g. "inglés" tokenizing as
// "ingl" + "s" instead of staying "inglés".
const WORD_RE = /[\p{L}][\p{L}\p{N}+.#/-]*/gu;
const EMPHASIS_RE =
  /(required|must have|must-have|proficien\w*|experience (with|in)|knowledge of|strong|solid understanding of|hands-on)/i;

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Plain \b relies on \w, which (even with the "u" flag) only covers ASCII
// word characters — it misreads the boundary right before/after an accented
// letter. This lookaround-based boundary uses \p{L}/\p{N} instead, so terms
// starting or ending in á/é/í/ó/ú/ñ/ü match (and only match) as whole words.
function wholeWordRegExp(term, flags = "i") {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, `${flags}u`);
}

function tokenize(text) {
  return text.match(WORD_RE) || [];
}

function normalize(token) {
  return token.toLowerCase().replace(/^[.-]+|[.-]+$/g, "");
}

// Accent-insensitive form, used only for comparing against STOPWORDS so
// "más"/"mas" and "según"/"segun" match the same entry — the accented
// spelling from normalize() is still what gets returned/displayed as a term.
function stripAccents(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Extract the most relevant keywords/phrases from a job posting.
 * Returns [{ term, weight }, ...] sorted by weight desc.
 */
export function extractJobKeywords(jobText, topN = 25) {
  const lowerText = jobText.toLowerCase();
  const scores = new Map();

  const bump = (term, amount) => scores.set(term, (scores.get(term) || 0) + amount);

  // 1. Dictionary matches (weighted higher, boosted further near emphasis phrases)
  for (const skill of KNOWN_SKILLS) {
    const pattern = wholeWordRegExp(skill, "gi");
    const matches = [...lowerText.matchAll(pattern)];
    if (!matches.length) continue;

    let weight = matches.length * 3;
    for (const m of matches) {
      const windowStart = Math.max(0, m.index - 60);
      const window = lowerText.slice(windowStart, m.index);
      if (EMPHASIS_RE.test(window)) weight += 2;
    }
    bump(skill, weight);
  }

  // 2. Frequency-based n-grams for anything not already captured
  const tokens = tokenize(jobText)
    .map(normalize)
    .filter((t) => t && !STOPWORDS.has(stripAccents(t)) && t.length > 2);

  const unigramCounts = new Map();
  for (const t of tokens) unigramCounts.set(t, (unigramCounts.get(t) || 0) + 1);
  for (const [term, count] of unigramCounts) {
    if (!scores.has(term) && count >= 2) bump(term, count);
  }

  const bigramCounts = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    if (STOPWORDS.has(stripAccents(tokens[i])) || STOPWORDS.has(stripAccents(tokens[i + 1]))) continue;
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
  }
  for (const [term, count] of bigramCounts) {
    if (count >= 2 && !scores.has(term)) bump(term, count * 2);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term, weight]) => ({ term, weight }));
}

/**
 * Compare extracted job keywords against resume text.
 * Returns { matched, missing, matchScore }.
 */
export function matchResumeToJob(resumeText, jobKeywords) {
  const lowerResume = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const { term } of jobKeywords) {
    const pattern = wholeWordRegExp(term, "i");
    if (pattern.test(lowerResume)) matched.push(term);
    else missing.push(term);
  }

  const total = jobKeywords.length || 1;
  const matchScore = Math.round((matched.length / total) * 100);

  return { matched, missing, matchScore };
}
