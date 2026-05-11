"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { updateIdentity } from "./actions";

interface Props {
  initial: {
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    birth_date: string | null;
    gender: string | null;
    education: string | null;
  };
}

const GENDER_OPTIONS = [
  { value: "male", label: "Pria" },
  { value: "female", label: "Wanita" },
];

const EDUCATION_OPTIONS = [
  { value: "sma", label: "SMA / SMK" },
  { value: "d3", label: "D3 sederajat" },
  { value: "s1", label: "S1 sederajat" },
  { value: "s2", label: "S2 sederajat" },
];

export default function IdentityForm({ initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState({
    full_name: initial.full_name ?? "",
    phone: initial.phone ?? "",
    city: initial.city ?? "",
    birth_date: initial.birth_date ?? "",
    gender: initial.gender ?? "",
    education: initial.education ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<
    { kind: "ok" } | { kind: "error"; message: string } | null
  >(null);

  function setField(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setToast(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateIdentity(formData);
      if (result.ok) {
        setToast({ kind: "ok" });
        setTimeout(() => {
          setToast(null);
          router.push("/profile");
        }, 800);
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Email (read-only) */}
      <FieldCard label="Email" hint="Tidak bisa diubah dari sini.">
        <div
          className="w-full px-3.5 py-3 rounded-xl text-[14px] font-medium"
          style={{
            background: "var(--pg-ink-50)",
            color: "var(--pg-ink-tertiary)",
            border: "1.5px solid transparent",
          }}
        >
          {initial.email ?? "—"}
        </div>
      </FieldCard>

      <FieldCard label="Nama lengkap" required>
        <input
          type="text"
          name="full_name"
          value={values.full_name}
          onChange={(e) => setField("full_name", e.target.value)}
          required
          minLength={2}
          maxLength={200}
          className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] bg-pg-white text-[15px] font-medium focus:outline-none"
          style={{ borderColor: "var(--pg-ink-200)" }}
          placeholder="Sesuai KTP"
        />
      </FieldCard>

      <FieldCard label="Nomor HP / WhatsApp" hint="Diawali 08, +62, atau 62.">
        <input
          type="tel"
          name="phone"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] bg-pg-white text-[15px] font-medium focus:outline-none"
          style={{ borderColor: "var(--pg-ink-200)" }}
          placeholder="08123456789"
        />
      </FieldCard>

      <FieldCard label="Kota">
        <input
          type="text"
          name="city"
          value={values.city}
          onChange={(e) => setField("city", e.target.value)}
          className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] bg-pg-white text-[15px] font-medium focus:outline-none"
          style={{ borderColor: "var(--pg-ink-200)" }}
          placeholder="Jakarta"
        />
      </FieldCard>

      <FieldCard label="Tanggal lahir">
        <input
          type="date"
          name="birth_date"
          value={values.birth_date}
          onChange={(e) => setField("birth_date", e.target.value)}
          className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] bg-pg-white text-[15px] font-medium focus:outline-none"
          style={{ borderColor: "var(--pg-ink-200)" }}
        />
      </FieldCard>

      <FieldCard label="Gender">
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <RadioPill
              key={opt.value}
              name="gender"
              value={opt.value}
              label={opt.label}
              selected={values.gender === opt.value}
              onSelect={() => setField("gender", opt.value)}
            />
          ))}
        </div>
      </FieldCard>

      <FieldCard label="Pendidikan terakhir">
        <div className="grid gap-2">
          {EDUCATION_OPTIONS.map((opt) => (
            <RadioPill
              key={opt.value}
              name="education"
              value={opt.value}
              label={opt.label}
              selected={values.education === opt.value}
              onSelect={() => setField("education", opt.value)}
            />
          ))}
        </div>
      </FieldCard>

      <div className="sticky bottom-[68px] z-10 pt-3 -mx-5 px-5" style={{ background: "var(--pg-paper)" }}>
        {toast?.kind === "error" && (
          <div
            className="px-4 py-3 mb-2 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={16} />
            <span>{toast.message}</span>
          </div>
        )}
        {toast?.kind === "ok" && (
          <div
            className="px-4 py-3 mb-2 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
          >
            <Icon name="check" size={16} />
            <span>Tersimpan</span>
          </div>
        )}
        <Button type="submit" variant="primary" block disabled={isPending}>
          {isPending ? "Menyimpan…" : (
            <>
              Simpan perubahan <Icon name="check" size={18} stroke={2.6} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function FieldCard({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
        boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
      }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[13px] font-bold text-pg-ink-primary">
          {label}
          {required && <span style={{ color: "var(--pg-red-600)" }}> *</span>}
        </label>
        {hint && (
          <span className="text-[11px] text-pg-ink-tertiary">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function RadioPill({
  name,
  value,
  label,
  selected,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className="flex items-center gap-3 px-3.5 py-3 rounded-xl border-[1.5px] cursor-pointer transition"
      style={
        selected
          ? { borderColor: "var(--pg-red-600)", background: "var(--pg-red-50)" }
          : { borderColor: "var(--pg-ink-200)", background: "var(--pg-white)" }
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div
        className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0"
        style={{
          borderColor: selected ? "var(--pg-red-600)" : "var(--pg-ink-300)",
        }}
      >
        {selected && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--pg-red-600)" }}
          />
        )}
      </div>
      <span
        className={`text-[14px] flex-1 ${selected ? "font-bold" : "font-medium"}`}
      >
        {label}
      </span>
    </label>
  );
}
