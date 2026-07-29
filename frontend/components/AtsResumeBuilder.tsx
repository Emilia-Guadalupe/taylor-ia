"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translateApiMessage } from "@/lib/i18n";
import {
  exportResume,
  ApiError,
  type AiSuggestions,
  type MissingKeywordAdvice,
  type ResumeHints,
  type ExportJob,
  type ExportLanguage,
  type ExportProject,
} from "@/lib/api";

function emptyJob(): ExportJob {
  return { role: "", company: "", dates: "", bullets: [""] };
}

function emptyLanguage(): ExportLanguage {
  return { language: "", level: "" };
}

function emptyProject(): ExportProject {
  return { name: "", description: "" };
}

export default function AtsResumeBuilder({
  hints,
  matchedKeywords,
  missingKeywordsAdvice,
  aiSuggestions,
}: {
  hints?: ResumeHints;
  matchedKeywords?: string[];
  missingKeywordsAdvice?: MissingKeywordAdvice[];
  aiSuggestions?: AiSuggestions | null;
}) {
  const { t, lang } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [summary, setSummary] = useState(aiSuggestions?.tailored_summary || "");
  const [skillsText, setSkillsText] = useState((matchedKeywords || []).join(", "));
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState<ExportJob[]>([emptyJob()]);

  const [showLanguages, setShowLanguages] = useState(false);
  const [languages, setLanguages] = useState<ExportLanguage[]>([emptyLanguage()]);

  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<ExportProject[]>([emptyProject()]);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const missingKeywords = (missingKeywordsAdvice || []).map((m) => m.keyword);

  function addSkill(keyword: string) {
    const current = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (current.some((s) => s.toLowerCase() === keyword.toLowerCase())) return;
    setSkillsText([...current, keyword].join(", "));
  }

  function updateJob(index: number, patch: Partial<ExportJob>) {
    setExperience((prev) => prev.map((job, i) => (i === index ? { ...job, ...patch } : job)));
  }

  function updateBullet(jobIndex: number, bulletIndex: number, value: string) {
    setExperience((prev) =>
      prev.map((job, i) => {
        if (i !== jobIndex) return job;
        const bullets = job.bullets.map((b, bi) => (bi === bulletIndex ? value : b));
        return { ...job, bullets };
      })
    );
  }

  function addBullet(jobIndex: number) {
    setExperience((prev) =>
      prev.map((job, i) => (i === jobIndex ? { ...job, bullets: [...job.bullets, ""] } : job))
    );
  }

  function removeBullet(jobIndex: number, bulletIndex: number) {
    setExperience((prev) =>
      prev.map((job, i) =>
        i === jobIndex ? { ...job, bullets: job.bullets.filter((_, bi) => bi !== bulletIndex) } : job
      )
    );
  }

  function addJob() {
    setExperience((prev) => [...prev, emptyJob()]);
  }

  function removeJob(index: number) {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLanguage(index: number, patch: Partial<ExportLanguage>) {
    setLanguages((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLanguage() {
    setLanguages((prev) => [...prev, emptyLanguage()]);
  }

  function removeLanguage(index: number) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProject(index: number, patch: Partial<ExportProject>) {
    setProjects((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addProject() {
    setProjects((prev) => [...prev, emptyProject()]);
  }

  function removeProject(index: number) {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDownload() {
    setDownloadError("");

    if (!name.trim() || !email.trim()) {
      setDownloadError(t.requiredFieldsError);
      return;
    }

    setDownloading(true);
    try {
      const payload = {
        name,
        email,
        phone,
        location,
        link,
        summary,
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: experience.map((job) => ({
          ...job,
          bullets: job.bullets.map((b) => b.trim()).filter(Boolean),
        })),
        education,
        languages: languages
          .map((l) => ({ language: l.language.trim(), level: l.level.trim() }))
          .filter((l) => l.language || l.level),
        projects: projects
          .map((p) => ({ name: p.name.trim(), description: p.description.trim() }))
          .filter((p) => p.name || p.description),
        lang,
      };

      const blob = await exportResume(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = name.trim().replace(/[^a-z0-9]+/gi, "_").slice(0, 40) || "resume";
      a.download = `${safeName}_ATS_resume.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof ApiError ? translateApiMessage(err.message, lang) : t.genericError;
      setDownloadError(message || t.genericError);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="ats-block">
      <div className="panel-label">{t.panelLabel4}</div>
      <h2>{t.atsBuilderHeading}</h2>
      <p className="ats-intro">{t.atsBuilderIntro}</p>

      <div className="ats-grid">
        <label className="ats-field">
          <span className="ats-field-label">{t.fieldFullName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="ats-field">
          <span className="ats-field-label">{t.fieldEmail}</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {showPhone && (
          <label className="ats-field">
            <span className="ats-field-label">{t.fieldPhone}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        )}
        <label className="ats-field">
          <span className="ats-field-label">{t.fieldLocation}</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <label className="ats-field">
          <span className="ats-field-label">{t.fieldLink}</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t.linkPlaceholder} />
        </label>
      </div>

      {!showPhone && (
        <button type="button" className="ats-link-button" onClick={() => setShowPhone(true)}>
          {t.addPhone}
        </button>
      )}

      <label className="ats-field ats-field-full">
        <span className="ats-field-label">{t.fieldSummary}</span>
        <textarea
          className="ats-textarea"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>

      <label className="ats-field ats-field-full">
        <span className="ats-field-label">{t.fieldSkills}</span>
        <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
      </label>

      {missingKeywords.length > 0 && (
        <div className="ats-suggest-row">
          <span className="ats-suggest-label">{t.addSuggestedKeyword}</span>
          <div className="ats-suggest-chips">
            {missingKeywords.map((kw) => (
              <button type="button" className="ats-chip" key={kw} onClick={() => addSkill(kw)}>
                + {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ats-field-full">
        <span className="ats-field-label">{t.fieldExperience}</span>
        {experience.map((job, jobIndex) => (
          <div className="ats-job-card" key={jobIndex}>
            <div className="ats-grid ats-grid-3">
              <label className="ats-field">
                <span className="ats-field-label">{t.fieldRole}</span>
                <input
                  value={job.role}
                  onChange={(e) => updateJob(jobIndex, { role: e.target.value })}
                />
              </label>
              <label className="ats-field">
                <span className="ats-field-label">{t.fieldCompany}</span>
                <input
                  value={job.company}
                  onChange={(e) => updateJob(jobIndex, { company: e.target.value })}
                />
              </label>
              <label className="ats-field">
                <span className="ats-field-label">{t.fieldDates}</span>
                <input
                  value={job.dates}
                  onChange={(e) => updateJob(jobIndex, { dates: e.target.value })}
                />
              </label>
            </div>

            {job.bullets.map((bullet, bulletIndex) => (
              <div className="ats-bullet-row" key={bulletIndex}>
                <textarea
                  className="ats-textarea"
                  rows={2}
                  placeholder={t.bulletPlaceholder}
                  value={bullet}
                  onChange={(e) => updateBullet(jobIndex, bulletIndex, e.target.value)}
                />
                {job.bullets.length > 1 && (
                  <button
                    type="button"
                    className="ats-link-button"
                    onClick={() => removeBullet(jobIndex, bulletIndex)}
                  >
                    {t.removeBullet}
                  </button>
                )}
              </div>
            ))}

            <div className="ats-row-actions">
              <button type="button" className="ats-link-button" onClick={() => addBullet(jobIndex)}>
                {t.addBullet}
              </button>
              {experience.length > 1 && (
                <button type="button" className="ats-link-button danger" onClick={() => removeJob(jobIndex)}>
                  {t.removeJob}
                </button>
              )}
            </div>
          </div>
        ))}

        <button type="button" className="ats-link-button" onClick={addJob}>
          {t.addJob}
        </button>
      </div>

      {!showProjects && (
        <button type="button" className="ats-link-button" onClick={() => setShowProjects(true)}>
          {t.addProjects}
        </button>
      )}

      {showProjects && (
        <div className="ats-field-full">
          <span className="ats-field-label">{t.fieldProjects}</span>
          {projects.map((project, projectIndex) => (
            <div className="ats-job-card" key={projectIndex}>
              <label className="ats-field ats-field-full">
                <span className="ats-field-label">{t.fieldProjectName}</span>
                <input
                  value={project.name}
                  onChange={(e) => updateProject(projectIndex, { name: e.target.value })}
                />
              </label>
              <label className="ats-field ats-field-full">
                <span className="ats-field-label">{t.fieldProjectDescription}</span>
                <textarea
                  className="ats-textarea"
                  rows={2}
                  placeholder={t.projectDescriptionPlaceholder}
                  value={project.description}
                  onChange={(e) => updateProject(projectIndex, { description: e.target.value })}
                />
              </label>
              {projects.length > 1 && (
                <button
                  type="button"
                  className="ats-link-button danger"
                  onClick={() => removeProject(projectIndex)}
                >
                  {t.removeProject}
                </button>
              )}
            </div>
          ))}
          <button type="button" className="ats-link-button" onClick={addProject}>
            {t.addProject}
          </button>
        </div>
      )}

      <label className="ats-field ats-field-full">
        <span className="ats-field-label">{t.fieldEducation}</span>
        <textarea
          className="ats-textarea"
          rows={2}
          placeholder={t.educationPlaceholder}
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </label>

      {!showLanguages && (
        <button type="button" className="ats-link-button" onClick={() => setShowLanguages(true)}>
          {t.addLanguages}
        </button>
      )}

      {showLanguages && (
        <div className="ats-field-full">
          <span className="ats-field-label">{t.fieldLanguages}</span>
          {languages.map((entry, langIndex) => (
            <div className="ats-grid ats-grid-3" key={langIndex}>
              <label className="ats-field">
                <span className="ats-field-label">{t.fieldLanguage}</span>
                <input
                  value={entry.language}
                  onChange={(e) => updateLanguage(langIndex, { language: e.target.value })}
                />
              </label>
              <label className="ats-field">
                <span className="ats-field-label">{t.fieldLevel}</span>
                <input
                  value={entry.level}
                  onChange={(e) => updateLanguage(langIndex, { level: e.target.value })}
                  placeholder={t.levelPlaceholder}
                />
              </label>
              {languages.length > 1 && (
                <button
                  type="button"
                  className="ats-link-button danger"
                  onClick={() => removeLanguage(langIndex)}
                >
                  {t.removeLanguage}
                </button>
              )}
            </div>
          ))}
          <button type="button" className="ats-link-button" onClick={addLanguage}>
            {t.addLanguage}
          </button>
        </div>
      )}

      <div className="ats-download-row">
        <button type="button" className="brass-button" onClick={handleDownload} disabled={downloading}>
          <span>{downloading ? t.downloadingButton : t.downloadButton}</span>
        </button>
        {downloadError && (
          <p className="measure-hint error" role="alert">
            {downloadError}
          </p>
        )}
      </div>
    </div>
  );
}
