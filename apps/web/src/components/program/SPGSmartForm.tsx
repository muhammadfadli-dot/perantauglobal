import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

export default function SPGSmartForm() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionTag label="Program · SPG" />
        <MonoLabel className="mt-6">Pendaftaran sementara ditutup</MonoLabel>
        <DisplayHeadline size="section" className="mt-4">
          Pendaftaran <Italic>dibuka</Italic> <Accent>kembali</Accent> <br className="hidden md:block" />
          di gelombang berikutnya.
        </DisplayHeadline>
        <p className="mx-auto mt-8 max-w-[48ch] text-lg leading-[1.6] text-ink-70">
          Kami sedang menyempurnakan sistem onboarding SPG. Tinggalkan kontak via
          WhatsApp — kami kabari begitu pendaftaran dibuka lagi.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <EditorialButton
            href="https://wa.me/6285211415104?text=Halo%2C%20saya%20tertarik%20jadi%20Sahabat%20Perantau%20Global%20(SPG)%20saat%20pendaftaran%20dibuka%20kembali."
            variant="ink"
            suffix="→"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp untuk daftar waitlist
          </EditorialButton>
          <EditorialButton href="/program/global-talent-hub" variant="cream" suffix="→">
            Lihat program lain
          </EditorialButton>
        </div>
      </div>
    </section>
  );
}
