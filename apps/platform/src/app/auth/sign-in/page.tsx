import SignInForm from "./SignInForm";

export const metadata = { title: "Masuk — Perantau Global" };

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[var(--color-dtg-cream)] py-16">
      <div className="mx-auto max-w-[460px] px-6">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
          Perantau Global — Portal
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
          Masuk ke akun kamu.
        </h1>
        <p className="mt-3 text-sm opacity-70">
          Masukin email kamu. Kami kirim tautan masuk yang bisa diklik, tanpa
          password.
        </p>
        <div className="mt-8">
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
