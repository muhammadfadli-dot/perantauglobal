import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import AgentForm, { type AgentInitial } from "../../new/AgentForm";
import type { AffiliateAgentStatus } from "@perantauglobal/db";

export const dynamic = "force-dynamic";

type AgentRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  notes: string | null;
  status: AffiliateAgentStatus;
};

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("affiliate_agents")
    .select("id, name, email, phone, city, notes, status")
    .eq("id", id)
    .maybeSingle();

  const agent = data as AgentRow | null;
  if (!agent) return notFound();

  const initial: AgentInitial = {
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    city: agent.city,
    notes: agent.notes,
    status: agent.status,
  };

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href={`/admin/agents/${id}`}
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Kembali ke agen
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Edit agen
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
          {agent.name}
        </h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Perbarui nama, kontak, kota, status, atau catatan. Untuk menambah kode
          referral baru, pakai tombol di halaman detail agen.
        </p>
      </div>

      <div className="mt-6">
        <AgentForm mode="edit" agentId={agent.id} initial={initial} />
      </div>
    </main>
  );
}
