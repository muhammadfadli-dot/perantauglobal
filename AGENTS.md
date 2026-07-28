# Perantau Global Platform

**Sumber kebenaran ada di [CLAUDE.md](./CLAUDE.md). Baca itu dulu, lalu [TASKS.md](./TASKS.md) untuk keadaan terakhir.**

File ini sengaja tipis. Sebelumnya isinya salinan CLAUDE.md yang dibekukan 10 Juni 2026 lalu ditinggal, sehingga selama tujuh minggu memberi peta yang salah: menyebut pekerjaan yang sudah selesai sebagai tertunda, menunjuk tabel dan folder yang sudah tidak ada, dan tidak tahu `apps/demand` itu ada. Salinan yang tidak dirawat lebih menyesatkan daripada tidak ada salinan.

## Tiga hal yang wajib diketahui sebelum menyentuh apa pun

**1. Migration lewat Supabase MCP `apply_migration`, bukan lewat SQL editor.** Folder `packages/db/migrations/` adalah catatan resmi. Perubahan yang dijalankan lewat SQL editor tidak masuk catatan itu, dan schema akan menyimpang diam-diam.

**2. Skill baru jangan ditaruh di folder `.claude/` mana pun.** Baris 37 di `.gitignore` mengabaikan `.claude/` di kedalaman berapa pun, jadi skill yang ditulis di sana tidak akan pernah ikut ke commit. Kamu akan mengira sudah membagikannya padahal tidak. SOP dan skill tim DTG tinggal di repo terpisah `dtg-sop`.

**3. Merge ke `main` langsung tayang di produksi**, tiga situs sekaligus: perantauglobal.com, app.perantauglobal.com, dan dayatalentaglobal.com. Tidak ada branch staging dan tidak ada gerbang CI yang menahan. Perlakukan tiap merge sebagai rilis.
