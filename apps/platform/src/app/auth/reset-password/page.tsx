import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Bikin password baru — Perantau Global",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <header
        className="px-6 py-5 flex items-center gap-2.5 text-white"
        style={{ background: "var(--pg-red-600)" }}
      >
        <div className="w-8 h-8 rounded-lg grid place-items-center text-pg-red-600 bg-white font-extrabold text-base tracking-tight">
          P
        </div>
        <div className="font-extrabold text-[17px] tracking-tight">PerantauGlobal</div>
      </header>

      <section className="px-6 pt-8 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-[34px] font-extrabold tracking-tight leading-[1.1]">
          Bikin password<br />baru.
        </h1>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-3">
          Masukkan password baru untuk akun kamu. Nanti bisa dipakai untuk masuk
          ke Talent Hub.
        </p>
      </section>

      <section className="px-6 pt-6 max-w-md mx-auto w-full flex-1">
        <ResetPasswordForm />
      </section>
    </main>
  );
}
