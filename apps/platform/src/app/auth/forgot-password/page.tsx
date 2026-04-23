import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Lupa password — Perantau Global" };

export default function ForgotPasswordPage() {
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
          Lupa password?
        </h1>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-3">
          Masukkan email kamu, kami kirim link untuk bikin password baru.
        </p>
      </section>

      <section className="px-6 pt-6 max-w-md mx-auto w-full flex-1">
        <ForgotPasswordForm />
      </section>

      <footer className="px-6 py-6 max-w-md mx-auto w-full">
        <div className="text-[12px] text-pg-ink-500 text-center">
          Ingat password?{" "}
          <Link href="/auth/sign-in" className="text-pg-red-600 font-bold no-underline">
            Kembali ke halaman masuk
          </Link>
        </div>
      </footer>
    </main>
  );
}
