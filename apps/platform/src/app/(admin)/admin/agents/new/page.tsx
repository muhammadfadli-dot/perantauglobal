import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import AgentForm from "./AgentForm";

export const dynamic = "force-dynamic";

export default function NewAgentPage() {
  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Agen afiliasi
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Buat agen
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
          Agen afiliasi baru.
        </h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Cuma nama yang wajib. Saat disimpan, sistem otomatis bikin{" "}
          <span className="font-mono text-[13px]">kode referral</span> pertama buat agen ini —
          kasih kode itu ke agen biar kandidatnya ter-attribute.
        </p>
      </div>

      <div className="mt-6">
        <AgentForm />
      </div>
    </main>
  );
}
