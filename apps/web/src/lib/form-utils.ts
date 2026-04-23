import { NextResponse } from "next/server";

/**
 * Validate that all required fields are present and non-empty.
 * Returns an error response if validation fails, or null if valid.
 */
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): NextResponse | null {
  for (const field of fields) {
    if (!body[field] && body[field] !== 0 && body[field] !== false) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }
  return null;
}

/**
 * Validate email format. Returns error response or null.
 */
export function validateEmail(email: string): NextResponse | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }
  return null;
}
