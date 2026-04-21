import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import DaftarHero from "@/components/daftar/DaftarHero";
import RegisterForm from "@/components/sections/RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Daftar Sekarang" : "Register Now",
    description: isId
      ? "Daftarkan diri Anda untuk berkarir di luar negeri bersama Perantau Global. Proses legal, tanpa biaya penempatan."
      : "Register to build your career abroad with Perantau Global. Legal process, zero placement fees.",
    locale: locale as "id" | "en",
    path: isId ? "daftar" : "register",
  });
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  return (
    <>
      <DaftarHero />
      <RegisterForm />
    </>
  );
}
