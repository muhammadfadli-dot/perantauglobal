import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import InviteForm from "./InviteForm";
import RemoveButton from "./RemoveButton";

export const dynamic = "force-dynamic";

type AdminRow = {
  email: string;
  notes: string | null;
  added_at: string | null;
  added_by: string | null;
};

export default async function TeamPage() {
  const { session } = await getSessionAndRole();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("email, notes, added_at, added_by")
    .order("added_at", { ascending: false });

  if (error) {
    return <main className="p-10"><p className="text-sm text-pg-err">Query gagal: {error.message}</p></main>;
  }
  const rows = (data ?? []) as AdminRow[];

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Tim
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">Tim admin</h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
        Email yang bisa akses dashboard ini. Setelah ditambahkan, mereka tinggal sign-in pakai
        magic link via{" "}
        <code className="font-mono text-[13px]">app.perantauglobal.com/auth/sign-in</code> dan
        otomatis dapat role admin.
      </p>

      <div className="mt-6">
        <InviteForm />
      </div>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-2.5">
          {rows.length} admin terdaftar
        </div>
        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
          {rows.map((r, i) => {
            const isMe = session?.email && session.email.toLowerCase() === r.email.toLowerCase();
            return (
              <div
                key={r.email}
                className={`px-5 py-4 flex items-center justify-between gap-4 ${
                  i ? "border-t border-pg-ink-100" : ""
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-white font-extrabold text-sm shrink-0"
                    style={{ background: "var(--pg-red-600)" }}
                  >
                    {r.email.split("@")[0]?.[0]?.toUpperCase() ?? "A"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold truncate">
                      {r.email}
                      {isMe && (
                        <span className="ml-2 text-[11px] font-bold tracking-wide uppercase text-pg-red-600">
                          (kamu)
                        </span>
                      )}
                    </div>
                    {r.notes && (
                      <div className="text-[13px] text-pg-ink-500 mt-0.5">{r.notes}</div>
                    )}
                    {r.added_at && (
                      <div className="text-[11px] text-pg-ink-400 font-mono mt-0.5">
                        Ditambahkan {new Date(r.added_at).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>
                </div>
                {!isMe && <RemoveButton email={r.email} />}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-6 px-4 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
      >
        <Icon name="info" size={18} className="shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed">
          <b>Cara kerja:</b> kita pakai email allowlist. Akun di-elevate ke role <code className="font-mono">admin</code>
          {" "}saat <code className="font-mono">is_admin()</code> RPC dipanggil — fungsi itu cek email
          user vs <code className="font-mono">admin_users</code> table. Tidak ada flow invite link
          terpisah; admin baru tinggal sign-in pakai magic link biasa.
        </div>
      </div>
    </main>
  );
}
