"use client";

import { useState, useTransition } from "react";
import { getDocumentSignedUrl } from "../../documents/actions";

/**
 * Opens a candidate document file directly in a new tab from the profile page.
 *
 * Reuses the same server action as the document review queue
 * (getDocumentSignedUrl): admin session → 60s signed URL → window.open. Every
 * call writes a PDP `view_document` audit entry, same as the queue.
 *
 * Replaces the old "Lihat" link that bounced admins to /admin/documents (the
 * full review list), where they had to scroll/search to find this candidate's
 * CV. Shown for every doc regardless of verification status.
 */
export default function DocViewButton({ filePath }: { filePath: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function view() {
    setError(null);
    start(async () => {
      try {
        const res = await getDocumentSignedUrl(filePath);
        if (res.ok) {
          window.open(res.url, "_blank", "noopener");
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal buka file");
      }
    });
  }

  return (
    <div className="flex flex-col items-end shrink-0">
      <button
        type="button"
        onClick={view}
        disabled={pending}
        className="text-[11px] font-bold text-pg-red-600 no-underline disabled:opacity-50"
      >
        {pending ? "Membuka…" : "Lihat"}
      </button>
      {error && (
        <span className="text-[9px] text-pg-err mt-0.5 max-w-[140px] text-right leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}
