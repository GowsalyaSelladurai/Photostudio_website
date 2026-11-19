"use client";

import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { ARTWORK_UPLOAD } from "../../config/frameOptions";

interface ArtworkUploadProps {
  fileName: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}

export default function ArtworkUpload({
  fileName,
  onSelect,
  onClear,
}: ArtworkUploadProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (!(ARTWORK_UPLOAD.acceptedTypes as readonly string[]).includes(file.type)) {
      setError("Upload a JPG, PNG or WebP photograph.");
      return;
    }
    if (file.size > ARTWORK_UPLOAD.maxSizeMb * 1024 * 1024) {
      setError(`That file is too large. Choose one under ${ARTWORK_UPLOAD.maxSizeMb} MB.`);
      return;
    }

    setError(null);
    onSelect(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="fs-section" aria-labelledby={`${inputId}-title`}>
      <h2 className="fs-section__title" id={`${inputId}-title`}>
        Your photograph
      </h2>

      <input
        id={inputId}
        className="fs-sr-only"
        type="file"
        accept={ARTWORK_UPLOAD.acceptAttribute}
        onChange={handleChange}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      <label
        htmlFor={inputId}
        className="fs-upload"
        data-dragging={dragging}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <svg className="fs-upload__icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M12 16V5m0 0-4 4m4-4 4 4M5 15v3a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18v-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="fs-upload__text">
          <strong>{fileName ? "Replace photograph" : "Upload your photograph"}</strong>
          <span>
            Drag a file here or browse. JPG, PNG or WebP, up to {ARTWORK_UPLOAD.maxSizeMb} MB.
          </span>
        </span>
      </label>

      {fileName && (
        <div className="fs-upload__file">
          <span className="fs-upload__name" title={fileName}>
            {fileName}
          </span>
          <button type="button" className="fs-link-button" onClick={onClear}>
            Remove
          </button>
        </div>
      )}

      {error && (
        <p className="fs-error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}