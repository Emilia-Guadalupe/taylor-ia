"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function ResumeDropzone({
  file,
  onFileSelected,
  onInvalidFile,
}: {
  file: File | null;
  onFileSelected: (file: File) => void;
  onInvalidFile: (message: string) => void;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function validateAndSet(candidate: File | null | undefined) {
    if (!candidate) return;
    const okExt = /\.(docx|pdf)$/i.test(candidate.name);
    if (!okExt) {
      onInvalidFile(t.invalidFile);
      return;
    }
    onFileSelected(candidate);
  }

  return (
    <div className="panel swatch-panel">
      <div className="panel-label">{t.panelLabel1}</div>
      <h2>{t.yourResume}</h2>
      <input
        type="file"
        ref={inputRef}
        accept=".docx,.pdf"
        hidden
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />
      <div
        className={`drop-target ${dragOver ? "drag-over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          validateAndSet(e.dataTransfer.files?.[0]);
        }}
      >
        <p className="drop-instructions">
          {t.dropLine1}
          <br />
          {t.dropLine2} <span className="link-like">{t.chooseFile}</span>
        </p>
        {file && <p className="file-chosen">✓ {file.name}</p>}
      </div>
    </div>
  );
}
