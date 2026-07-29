"use client";

import { useLanguage } from "@/lib/LanguageContext";
import type { AiSuggestions } from "@/lib/api";

export default function AISuggestions({
  suggestions,
  error,
}: {
  suggestions: AiSuggestions | null | undefined;
  error?: string | null;
}) {
  const { t } = useLanguage();

  if (error) {
    return <div className="ai-error">{error}</div>;
  }

  if (!suggestions) {
    return <p className="empty-note">{t.noSuggestions}</p>;
  }

  const {
    tailored_summary,
    structure_advice,
    unnecessary_info,
    missing_keywords_advice,
    bullet_rewrites,
    irrelevant_experience_advice,
    overall_advice,
  } = suggestions;

  const verdictLabels = {
    keep: t.keepVerdict,
    trim: t.trimVerdict,
    remove: t.removeVerdict,
  };

  return (
    <div>
      {tailored_summary && (
        <div className="summary-card">
          <span className="card-label">{t.tailoredSummary}</span>
          {tailored_summary}
        </div>
      )}

      {structure_advice && (
        <div className="summary-card">
          <span className="card-label">{t.structureAdviceLabel}</span>
          {structure_advice}
        </div>
      )}

      {/* Group 1 — unnecessary / risky personal info */}
      <div className="group-block">
        <h3 className="group-heading">
          <span className="group-num">1</span> {t.group1Heading}
        </h3>
        {Array.isArray(unnecessary_info) && unnecessary_info.length > 0 ? (
          unnecessary_info.map((u, i) => (
            <div className="flag-card" key={i}>
              <div className="row">
                <span className="row-label">{t.flagged}:</span>
                <span className="flagged-item">{u.item}</span>
              </div>
              <div className="card-why">{u.reason}</div>
              {u.suggestion && (
                <div className="row suggestion-row">
                  <span className="row-label">{t.tryLabel}:</span>
                  <span className="suggested">{u.suggestion}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="empty-note">{t.nothingFlagged}</p>
        )}
      </div>

      {/* Group 2 — missing keyword advice */}
      <div className="group-block">
        <h3 className="group-heading">
          <span className="group-num">2</span> {t.group2Heading}
        </h3>
        {Array.isArray(missing_keywords_advice) && missing_keywords_advice.length > 0 ? (
          <ul className="tips-list">
            {missing_keywords_advice.map((m, i) => (
              <li key={i}>
                <span className="keyword-chip">{m.keyword}</span> {m.tip}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-note">{t.noGapsAdvice}</p>
        )}
      </div>

      {/* Group 3 — X-Y-Z formula bullet rewrites */}
      <div className="group-block">
        <h3 className="group-heading">
          <span className="group-num">3</span> {t.group3Heading}
        </h3>
        <p className="formula-explainer">{t.formulaExplainer}</p>

        {Array.isArray(bullet_rewrites) &&
          bullet_rewrites.map((b, i) => (
            <div className="pattern-card" key={i}>
              {b.original && (
                <div className="row">
                  <span className="row-label">{t.was}</span>
                  <span className="original">{b.original}</span>
                </div>
              )}
              <div className="row">
                <span className="row-label">{t.tryLabel}</span>
                <span className="suggested">{b.suggested}</span>
              </div>

              {(b.x_accomplished || b.y_measured_by || b.z_by_doing) && (
                <div className="xyz-breakdown">
                  {b.x_accomplished && (
                    <div className="xyz-chip xyz-x">
                      <span className="xyz-letter">X</span> {b.x_accomplished}
                    </div>
                  )}
                  {b.y_measured_by && (
                    <div className="xyz-chip xyz-y">
                      <span className="xyz-letter">Y</span> {b.y_measured_by}
                    </div>
                  )}
                  {b.z_by_doing && (
                    <div className="xyz-chip xyz-z">
                      <span className="xyz-letter">Z</span> {b.z_by_doing}
                    </div>
                  )}
                </div>
              )}

              {b.why && <div className="card-why">{b.why}</div>}
            </div>
          ))}
      </div>

      {/* Group 4 — irrelevant experience */}
      <div className="group-block">
        <h3 className="group-heading">
          <span className="group-num">4</span> {t.group4Heading}
        </h3>
        {Array.isArray(irrelevant_experience_advice) && irrelevant_experience_advice.length > 0 ? (
          irrelevant_experience_advice.map((e, i) => (
            <div className="flag-card" key={i}>
              <div className="row">
                <span className="row-label">{t.flagged}</span>
                <span className="flagged-item">{e.experience}</span>
              </div>
              {e.keep_or_cut in verdictLabels && (
                <div className="row suggestion-row">
                  <span className="row-label">{t.tryLabel}</span>
                  <span className="suggested">{verdictLabels[e.keep_or_cut]}</span>
                </div>
              )}
              <div className="card-why">{e.advice}</div>
            </div>
          ))
        ) : (
          <p className="empty-note">{t.noIrrelevantExperience}</p>
        )}
      </div>

      {overall_advice && (
        <div className="advice-card">
          <span className="card-label">{t.overallAdvice}</span>
          {overall_advice}
        </div>
      )}
    </div>
  );
}
