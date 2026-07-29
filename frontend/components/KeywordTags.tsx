"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function KeywordTags({
  matched,
  missing,
}: {
  matched: string[];
  missing: string[];
}) {
  const { t } = useLanguage();

  return (
    <div className="tags-block">
      <div className="tags-col">
        <h3 className="tags-heading matched">
          {t.stitchedIn} <span>({matched.length})</span>
        </h3>
        <div className="tag-list">
          {matched.length ? (
            matched.map((kw) => (
              <span className="tag matched" key={kw}>
                {kw}
              </span>
            ))
          ) : (
            <span className="empty-note">{t.nothingMatched}</span>
          )}
        </div>
      </div>
      <div className="tags-col">
        <h3 className="tags-heading missing">
          {t.looseThreads} <span>({missing.length})</span>
        </h3>
        <div className="tag-list">
          {missing.length ? (
            missing.map((kw) => (
              <span className="tag missing" key={kw}>
                {kw}
              </span>
            ))
          ) : (
            <span className="empty-note">{t.noGaps}</span>
          )}
        </div>
      </div>
    </div>
  );
}
