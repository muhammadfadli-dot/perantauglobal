import { Icon } from "@/components/pg/Icon";

export function PricingTransparency() {
  return (
    <section className="px-5 md:px-8 py-14 md:py-20 bg-pg-paper border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
              Transparency · Biaya
            </div>
            <h2 className="text-[22px] md:text-[32px] font-extrabold tracking-[-0.022em] leading-[1.15] text-pg-ink-900 text-balance mt-2 m-0">
              Paspor Perantau Global berbayar. Begini kenapa.
            </h2>
            <p className="text-[14px] md:text-[15.5px] font-medium leading-relaxed text-pg-ink-700 mt-3 max-w-[60ch]">
              Paspor adalah produk berbayar — bukan biaya tersembunyi yang muncul belakangan.
              Setiap rupiah yang kamu bayar masuk ke nilai inti paketnya:{" "}
              <b>psikotes formal</b> dan <b>modul kurikulum yang dirawat</b>. Biaya placement
              lowongan tetap gratis sebelum offering letter — terpisah dari Paspor.
            </p>
            <div className="flex flex-col gap-3 mt-5">
              {[
                "Bayar sekali per Paspor per negara. Bukan langganan, bukan bertahap.",
                "Tidak ada biaya tersembunyi. Total udah final saat kamu ambil.",
                "Tidak ada hubungannya dengan lamaran. Kamu tetap bisa apply lowongan tanpa ambil Paspor.",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-pg-ink-700 leading-relaxed">
                  <span
                    className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5"
                    style={{ background: "var(--pg-gold-700)", color: "var(--pg-cream)" }}
                  >
                    <Icon name="check" size={11} stroke={3} />
                  </span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price callout — masked */}
          <div
            className="rounded-[20px] p-7 md:p-8 flex flex-col gap-3 text-center"
            style={{
              background: "linear-gradient(155deg, #6e1923 0%, #4b1018 100%)",
              color: "var(--pg-cream)",
              boxShadow: "0 20px 50px rgba(74,16,24,0.30)",
            }}
          >
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] opacity-78">
              Biaya per Paspor
            </span>
            <div
              className="font-mono font-extrabold tracking-[-0.02em] leading-none"
              style={{ fontSize: "clamp(36px, 5vw, 52px)" }}
            >
              Rp •••• ••••
            </div>
            <p className="text-[13px] leading-relaxed opacity-88 m-0 max-w-[34ch] mx-auto">
              Rincian biaya final menyusul dan akan diumumkan di aplikasi Perantau Global. Kami
              menghindari angka pra-rilis biar gak ada miscommunication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
