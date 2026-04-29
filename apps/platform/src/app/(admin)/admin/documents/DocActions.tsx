"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { verifyDocument, rejectDocument, getDocumentSignedUrl } from "./actions";

export default function DocActions({
  id,
  filePath,
  verified,
  rejected,
}: {
  id: string;
  filePath: string;
  verified: boolean;
  rejected: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  function view() {
    setError(null);
    start(async () => {
      try {
        const url = await getDocumentSignedUrl(filePath);
        window.open(url, "_blank", "noopener");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal buka file");
      }
    });
  }

  function approve() {
    setError(null);
    start(async () => {
      try {
        await verifyDocument(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal verify");
      }
    });
  }

  function submitReject() {
    setError(null);
    if (!reason.trim()) {
      setError("Alasan tolak wajib diisi.");
      return;
    }
    start(async () => {
      try {
        await rejectDocument(id, reason);
        setShowReject(false);
        setReason("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal tolak");
      }
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 shrink-0 w-full sm:w-auto sm:min-w-[180px]">
      <Button variant="ghost" small onClick={view} disabled={pending}>
        <Icon name="zoom" size={14} /> Lihat file
      </Button>
      {!verified && !showReject && (
        <Button variant="primary" small onClick={approve} disabled={pending}>
          <Icon name="check" size={14} /> Verify
        </Button>
      )}
      {!rejected && !showReject && (
        <button
          type="button"
          onClick={() => setShowReject(true)}
          disabled={pending}
          className="inline-flex items-center justify-center gap-1 min-h-[40px] px-4 text-sm font-semibold rounded-xl border-[1.5px] border-pg-err text-pg-err hover:bg-pg-err-bg disabled:opacity-50"
        >
          <Icon name="x" size={14} /> Tolak
        </button>
      )}
      {showReject && (
        <div className="bg-pg-paper border border-pg-ink-200 rounded-xl p-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Alasan tolak (mis. 'KTP buram, mohon foto ulang')"
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-pg-err"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submitReject}
              disabled={pending}
              className="inline-flex items-center justify-center gap-1 min-h-[36px] px-3 text-[13px] font-semibold rounded-lg bg-pg-err text-white disabled:opacity-50"
            >
              {pending ? "Menyimpan…" : "Konfirmasi tolak"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReject(false);
                setReason("");
              }}
              className="inline-flex items-center justify-center min-h-[36px] px-3 text-[13px] font-semibold text-pg-ink-700 hover:bg-pg-ink-100 rounded-lg"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="text-[12px] text-pg-err flex items-start gap-1 max-w-[220px] break-words">
          <Icon name="warn" size={12} className="mt-0.5 shrink-0" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}
    </div>
  );
}
