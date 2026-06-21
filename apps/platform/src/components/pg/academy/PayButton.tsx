"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { createPaymentInvoiceAction } from "@/app/(candidate)/akademi/actions";

/**
 * Candidate-facing "Bayar" CTA for a paid program. Calls the server action to
 * create a Xendit invoice, then redirects to the hosted payment page. Access
 * unlocks only after the webhook confirms payment (server-trusted).
 */
export function PayButton({ slug, price }: { slug: string; price: number }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="px-5 pt-2">
      {err && (
        <p className="text-[12.5px] mb-2" style={{ color: "var(--pg-err)" }}>
          {err}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await createPaymentInvoiceAction(slug);
            if (!r.ok) {
              setErr(r.error);
              return;
            }
            window.location.href = r.data.invoiceUrl;
          })
        }
        className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-bold rounded-xl text-white disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
      >
        {pending ? "Menyiapkan pembayaran…" : `Bayar Rp${price.toLocaleString("id-ID")}`}
        <Icon name="arrow_right" size={18} />
      </button>
      <p className="text-[11px] text-pg-ink-500 mt-2 text-center">
        Pembayaran aman lewat Xendit · QRIS, transfer bank, e-wallet
      </p>
    </div>
  );
}
