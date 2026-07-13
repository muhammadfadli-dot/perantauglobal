"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile in "managed + execute" mode for the apply funnel.
 *
 * Invisible-first: the widget renders nothing for most visitors (appearance
 * "interaction-only"), and only shows an interactive challenge when Cloudflare
 * deems the request risky. We use execution="execute" so no challenge runs until
 * we ask for a token right before a protected action (CV preview, submit), and
 * each action gets a FRESH single-use token (reset before execute).
 *
 * Feature-flagged on NEXT_PUBLIC_TURNSTILE_SITE_KEY: when it's absent
 * (preview/dev) the hook is inert and execute() resolves null, so the caller
 * proceeds without a token (server side is off too). Never throws.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string, opts?: Record<string, unknown>) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 8000;

export function useTurnstile(siteKey: string | undefined) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Resolver for the in-flight execute() — Turnstile delivers the token via an
  // async callback, so we bridge that back to the awaiting caller.
  const pendingRef = useRef<((token: string | null) => void) | null>(null);

  useEffect(() => {
    if (!siteKey || typeof window === "undefined") return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    const settle = (token: string | null) => {
      const resolve = pendingRef.current;
      pendingRef.current = null;
      resolve?.(token);
    };

    const renderWidget = () => {
      if (cancelled || widgetIdRef.current || !window.turnstile || !containerRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          execution: "execute",
          appearance: "interaction-only",
          retry: "never",
          callback: (token: string) => settle(token),
          "error-callback": () => settle(null),
          "expired-callback": () => settle(null),
          "timeout-callback": () => settle(null),
        });
      } catch {
        // ignore — execute() will resolve null and callers fail open/closed per policy
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!document.querySelector(`script[src^="${SCRIPT_SRC.split("?")[0]}"]`)) {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      poll = setInterval(() => {
        if (window.turnstile) {
          if (poll) clearInterval(poll);
          poll = null;
          renderWidget();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey]);

  /**
   * Get a fresh single-use token for one protected action. Resolves null when
   * Turnstile is off, not ready, errors, or times out — callers decide policy.
   */
  const execute = useCallback((): Promise<string | null> => {
    if (!siteKey || typeof window === "undefined" || !window.turnstile || !widgetIdRef.current) {
      return Promise.resolve(null);
    }
    return new Promise<string | null>((resolve) => {
      const timeout = setTimeout(() => {
        if (pendingRef.current) {
          pendingRef.current = null;
          resolve(null);
        }
      }, TOKEN_TIMEOUT_MS);
      pendingRef.current = (token) => {
        clearTimeout(timeout);
        resolve(token);
      };
      try {
        window.turnstile!.reset(widgetIdRef.current!);
        window.turnstile!.execute(widgetIdRef.current!);
      } catch {
        clearTimeout(timeout);
        pendingRef.current = null;
        resolve(null);
      }
    });
  }, [siteKey]);

  // Callback ref (not the RefObject) so callers can do `ref={setContainer}`
  // without tripping react-hooks/refs "access ref during render".
  const setContainer = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
  }, []);

  return { setContainer, execute };
}
