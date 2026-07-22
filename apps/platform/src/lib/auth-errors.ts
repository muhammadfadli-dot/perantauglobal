/**
 * Candidate-facing copy for a leaked/weak password. Says what is wrong and what
 * to do next, because "pilih yang lain" makes people try another password of
 * the same shape and fail again.
 */
export const WEAK_PASSWORD_MESSAGE =
  "Password ini pernah muncul di kebocoran data publik, jadi tidak bisa dipakai. " +
  "Pilih password lain yang tidak umum: hindari nama, tanggal lahir, atau kata " +
  "yang gampang ditebak. Menggabungkan beberapa kata acak biasanya paling aman.";

/**
 * Supabase Auth returns English, sometimes cryptic, error messages. Map the
 * ones we actually surface to candidates into Bahasa Indonesia. Prefers the
 * official `error.code`, falls back to message matching, then the raw message.
 */
export function translateAuthError(
  raw: string | undefined | null,
  code?: string | null,
): string {
  // Prefer the official auth-js error code. Substring matching on English copy
  // rots silently: GoTrue's leaked-password message is "Password is known to be
  // weak and easy to guess, please choose a different one.", which matches
  // neither "weak password" nor "pwned" below. On the web funnels that exact
  // gap swallowed 48 sign-ups in the week to 2026-07-22 behind a generic error.
  // Codes are part of the API contract; the message is not.
  switch (code) {
    case "weak_password":
      return WEAK_PASSWORD_MESSAGE;
    case "user_already_exists":
    case "email_exists":
    case "identity_already_exists":
      return "Email sudah terdaftar. Coba masuk atau gunakan lupa password.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Terlalu banyak percobaan. Coba lagi dalam beberapa menit.";
    case "invalid_credentials":
      return "Email atau password salah.";
    case "email_not_confirmed":
      return "Email belum diverifikasi. Cek inbox kamu untuk link verifikasi.";
    case "same_password":
      return "Password baru harus berbeda dari yang lama.";
  }

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
  if (
    m.includes("weak") ||
    m.includes("pwned") ||
    m.includes("easy to guess")
  ) {
    return WEAK_PASSWORD_MESSAGE;
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
