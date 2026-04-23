/**
 * Supabase Auth returns English, sometimes cryptic, error messages. Map the
 * ones we actually surface to candidates into Bahasa Indonesia. Falls back
 * to the raw message for anything unmapped (logged in console for triage).
 */
export function translateAuthError(raw: string | undefined | null): string {
  if (!raw) return "Terjadi kesalahan. Coba lagi sebentar.";

  const m = raw.toLowerCase();

  // Sign-in
  if (m.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }
  if (m.includes("email not confirmed")) {
    return "Email belum diverifikasi. Cek inbox kamu untuk link verifikasi.";
  }

  // Sign-up
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Email sudah terdaftar. Coba masuk atau gunakan lupa password.";
  }
  if (m.includes("password should be at least")) {
    return "Password kurang kuat. Minimal 10 karakter.";
  }
  if (m.includes("weak password") || m.includes("pwned")) {
    return "Password terlalu umum atau pernah bocor di database publik. Pilih yang lain.";
  }

  // Rate limits
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Terlalu banyak percobaan. Coba lagi dalam beberapa menit.";
  }

  // Reset / update password
  if (m.includes("same as the old password") || m.includes("new password should be different")) {
    return "Password baru harus berbeda dari yang lama.";
  }
  if (m.includes("token has expired") || m.includes("invalid token")) {
    return "Tautan kedaluwarsa. Minta link baru.";
  }

  // Fallback — show raw, but friendly
  return raw;
}

/**
 * Client-side password policy. Mirrors the Supabase dashboard config
 * (10 char min + basic complexity). Supabase enforces authoritative rules
 * server-side; this is just for instant feedback before the round-trip.
 */
export function validatePassword(pw: string): string | null {
  if (pw.length < 10) return "Password minimal 10 karakter.";
  if (!/[a-z]/.test(pw)) return "Password harus mengandung huruf kecil.";
  if (!/[A-Z]/.test(pw)) return "Password harus mengandung huruf besar.";
  if (!/[0-9]/.test(pw)) return "Password harus mengandung angka.";
  return null;
}
