import Link from "next/link";
import { POSITIONS } from "@/lib/positions";

export function InlineXlink() {
  return (
    <section className="px-5 md:px-8 py-8 md:py-10 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[14px] md:text-[15px] text-pg-ink-700 m-0 leading-relaxed">
          Liat dulu lowongannya, baru ambil Paspor yang sesuai negara —{" "}
          <Link
            href="/lowongan"
            className="text-pg-red-600 font-bold underline decoration-pg-red-200 underline-offset-2 hover:text-pg-red-700"
          >
            lihat {POSITIONS.length} lowongan resmi P3MI →
          </Link>
        </p>
      </div>
    </section>
  );
}
