import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata = { title: "Daftar — Perantau Global" };

export default function SignUpPage() {
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
          Daftar akun<br />baru.
        </h1>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-3">
          Bikin akun untuk akses Perantau Global dan lamar posisi kerja ke luar negeri.
        </p>
      </section>

      <section className="px-6 pt-6 max-w-md mx-auto w-full flex-1">
        <SignUpForm />
      </section>

      <footer className="px-6 py-6 max-w-md mx-auto w-full">
        <div className="text-[12px] text-pg-ink-500 text-center">
          Sudah punya akun?{" "}
          <Link href="/auth/sign-in" className="text-pg-red-600 font-bold no-underline">
            Masuk di sini
          </Link>
        </div>
      </footer>
    </main>
  );
}
