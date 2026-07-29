"use client";

import { useEffect, useState } from "react";
import ResumeDropzone from "@/components/ResumeDropzone";
import TapeMeasure from "@/components/TapeMeasure";
import KeywordTags from "@/components/KeywordTags";
import AISuggestions from "@/components/AISuggestions";
import LanguageToggle from "@/components/LanguageToggle";
import AtsResumeBuilder from "@/components/AtsResumeBuilder";
import { analyzeResume, ApiError, type AnalyzeResult } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { translateApiMessage } from "@/lib/i18n";

export default function Home() {
  const { t, lang } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [results, setResults] = useState<AnalyzeResult | null>(null);
  const [analysisId, setAnalysisId] = useState(0);

  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

  function setError(msg: string) {
    setStatus(msg);
    setStatusIsError(true);
  }

  async function handleAnalyze() {
    if (!file) {
      setError(t.uploadFirst);
      return;
    }
    if (!jobText.trim()) {
      setError(t.pasteFirst);
      return;
    }

    setLoading(true);
    setStatus(t.measuringStatus);
    setStatusIsError(false);
    setResults(null);

    try {
      const data = await analyzeResume(file, jobText.trim(), lang);
      setResults(data);
      setAnalysisId((id) => id + 1);
      setStatus(t.doneStatus);
      setStatusIsError(false);
    } catch (err) {
      const rawMessage = err instanceof ApiError ? err.message : null;
      const message = rawMessage
        ? translateApiMessage(rawMessage, lang)
        : t.genericError;
      setError(message || t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <span className="brand-mark">✂</span>
            <span className="brand-word">{t.brandName}</span>
          </div>
          <p className="brand-tag">{t.brandTag}</p>
        </div>
        <LanguageToggle />
      </header>

      <main className="workshop">
        <section className="hero">
          <h1>
            {t.heroTitleLines[0]}
            <br />
            {t.heroTitleLines[1]}
          </h1>
          <p className="hero-sub">{t.heroSub}</p>
        </section>

        <section className="cutting-table">
          <ResumeDropzone
            file={file}
            onFileSelected={(f) => {
              setFile(f);
              setStatus("");
              setStatusIsError(false);
            }}
            onInvalidFile={setError}
          />

          <div className="panel slip-panel">
            <div className="panel-label">{t.panelLabel2}</div>
            <h2>{t.jobPosting}</h2>
            <textarea
              className="job-textarea"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder={t.jobPlaceholder}
            />
          </div>
        </section>

        <div className="measure-row">
          <button className="brass-button" onClick={handleAnalyze} disabled={loading}>
            <span>{loading ? t.measuringButton : t.measureButton}</span>
          </button>
          <p className={`measure-hint ${statusIsError ? "error" : ""}`}>{status}</p>
        </div>

        {results && (
          <section className="results">
            <TapeMeasure score={results.match_score} />

            <KeywordTags matched={results.matched_keywords} missing={results.missing_keywords} />

            <div className="ai-block">
              <div className="panel-label">{t.panelLabel3}</div>
              <h2>{t.suggestedAlterations}</h2>
              <AISuggestions
                suggestions={results.ai_suggestions}
                error={translateApiMessage(results.ai_error, lang)}
              />
            </div>

            <AtsResumeBuilder
              key={analysisId}
              hints={results.resume_hints}
              matchedKeywords={results.matched_keywords}
              missingKeywordsAdvice={results.ai_suggestions?.missing_keywords_advice}
              aiSuggestions={results.ai_suggestions}
            />
          </section>
        )}
      </main>

      <footer className="workshop-footer">
        <p>{t.footer}</p>
      </footer>
    </>
  );
}
