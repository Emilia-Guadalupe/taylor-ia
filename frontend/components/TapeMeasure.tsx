"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function TapeMeasure({ score }: { score: number }) {
  const { t } = useLanguage();
  const clamped = Math.max(0, Math.min(100, score));
  const pinClass = clamped < 40 ? "low" : clamped < 70 ? "mid" : "";
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className="tape-block">
      <div className="tape-label">{t.fitScoreLabel}</div>
      <div className="tape-measure">
        <div className="tape-ticks">
          {ticks.map((val) => (
            <div className="tick" data-val={val} key={val} />
          ))}
        </div>
        <div
          className={`tape-pin ${pinClass}`}
          style={{ left: `${clamped}%` }}
        >
          {clamped}%
        </div>
      </div>
    </div>
  );
}
