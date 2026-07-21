interface Window {
  dataLayer: Record<string, unknown>[];
  /**
   * Defined by the inline Consent Mode bootstrap in <head> (see
   * lib/consent-mode.ts) and later by the GTM container itself. Loosely typed
   * on purpose: gtag is variadic and its argument shapes differ per command
   * ('consent', 'config', 'event'), so a precise signature would fight the
   * call sites without catching anything real.
   */
  gtag?: (...args: unknown[]) => void;
}
