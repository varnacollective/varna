"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import FilePreview, { type PreviewTarget } from "./FilePreview";
import { uploadedFile } from "./uploaded-file";

interface FileInfo {
  id: string;
  name: string;
  detail: string;
}

/** The files of an upload, each with a Preview button. */
export default function UploadedFiles({ uploadId, files }: { uploadId: string; files: FileInfo[] }) {
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  return (
    <>
      <ul className="flex flex-col gap-1">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-x-2">
            <span className="break-all">{f.name}</span>
            <span className="text-[var(--sa-caption)]">({f.detail})</span>
            <button
              type="button"
              onClick={() => setPreview({ name: f.name, load: uploadedFile(uploadId, f.id) })}
              className="cursor-pointer inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-[var(--sa-accent)] hover:bg-[var(--sa-accent-tint)]"
              aria-label={`Preview ${f.name}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
            </button>
          </li>
        ))}
      </ul>
      {preview && <FilePreview {...preview} onClose={() => setPreview(null)} />}
    </>
  );
}
