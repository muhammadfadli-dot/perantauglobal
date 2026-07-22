import { NextResponse } from "next/server";

/**
 * Shape we need off a Supabase AuthError. Kept structural so callers can pass
 * the error straight through without importing auth-js types into route files.
 */
export interface SignUpErrorLike {
  message?: string | null;
  code?: string | null;
}

export type SignUpFailureKind =
  | "email_exists"
  | "weak_password"
  | "rate_limit"
  | "unknown";

/**
 * Classify a Supabase signUp failure.
 *
 * Matches on the OFFICIAL `error.code` (auth-js sets these on every HTTP-backed
 * error) and only falls back to sniffing the English message for responses that
 * arrive without one.
 *
 * Why this exists: the routes used to classify by substring alone, looking for
 * "weak password" or "pwned". GoTrue's actual leaked-password message reads
 * "Password is known to be weak and easy to guess, please choose a different
 * one." — it contains neither substring, so that branch never fired and every
 * rejection fell through to a generic HTTP 500 "Gagal membuat akun. Coba lagi
 * sebentar." In the 7 days to 2026-07-22 that swallowed 48 sign-ups across the
 * apply + academy funnels: each candidate was told to retry, while retrying was
 * the one thing that could not work. Codes do not rot the way copy does.
 */
export function classifySignUpError(err: SignUpErrorLike): SignUpFailureKind {
  switch (err.code) {
    case "weak_password":
      return "weak_password";
    case "user_already_exists":
    case "email_exists":
    case "identity_already_exists":
      return "email_exists";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rate_limit";
  }

  // Fallback for errors that carry no code (older GoTrue, network-shaped
  // failures). Deliberately broad: a wrong-but-specific answer beats a 500.
  const msg = (err.message || "").toLowerCase();
  if (
    msg.includes("weak") ||
    msg.includes("pwned") ||
    msg.includes("known to be weak") ||
    msg.includes("easy to guess")
  ) {
    return "weak_password";
  }
  if (msg.includes("already") || msg.includes("registered")) {
    return "email_exists";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "rate_limit";
  }
  return "unknown";
}

/**
 * Candidate-facing copy for a leaked/weak password.
 *
 * Says what is actually wrong and what to do about it. The old wording ("Pilih
 * yang lain.") never reached anyone, but it also would not have helped much:
 * people read "terlalu umum" and try another password of the same shape.
 */
export const WEAK_PASSWORD_MESSAGE =
  "Password ini pernah muncul di kebocoran data publik, jadi tidak bisa dipakai. " +
  "Pilih password lain yang tidak umum: hindari nama, tanggal lahir, atau kata " +
  "yang gampang ditebak. Menggabungkan beberapa kata acak biasanya paling aman.";

export const RATE_LIMIT_MESSAGE =
  "Terlalu banyak percobaan. Coba lagi dalam beberapa menit.";

/**
 * Build the API response for a failed signUp. `emailExistsMessage` stays
 * per-flow because the next step differs (buka kelas, lanjutkan lamaran, atau
 * langsung masuk ke portal).
 */
export function signUpErrorResponse(
  err: SignUpErrorLike,
  opts: { logPrefix: string; emailExistsMessage: string },
): NextResponse {
  switch (classifySignUpError(err)) {
    case "email_exists":
      return NextResponse.json(
        { error: opts.emailExistsMessage, code: "email_exists" },
        { status: 409 },
      );
    case "weak_password":
      return NextResponse.json(
        { error: WEAK_PASSWORD_MESSAGE, code: "weak_password", field: "password" },
        { status: 400 },
      );
    case "rate_limit":
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE, code: "rate_limit" },
        { status: 429 },
      );
    default:
      // Genuinely unknown: log the raw message + code so the next unmapped
      // failure mode shows up in triage instead of hiding behind the 500.
      console.error(
        `${opts.logPrefix} signUp failed (unmapped):`,
        err.code ?? "no-code",
        err.message,
      );
      return NextResponse.json(
        { error: "Gagal membuat akun. Coba lagi sebentar." },
        { status: 500 },
      );
  }
}
