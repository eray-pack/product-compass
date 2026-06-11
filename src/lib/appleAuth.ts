// Native Sign in with Apple for Stopamine.
// On iOS this uses the OS-level AuthenticationServices sheet (the experience
// App Review expects) and exchanges the identity token directly with Supabase
// via signInWithIdToken — no browser redirect chain at all, which is what
// failed review (2.1a: OAuth bounced to Safari → Supabase redirect → error).
// On web it falls back to the normal Supabase OAuth redirect flow.
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase";

// Apple requires the request nonce to be the SHA-256 of a raw nonce; the raw
// nonce is then given to Supabase, which hashes and compares it to the token.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Sign in with Apple.
 * Returns { error } like supabase-js calls so callers can handle uniformly.
 * Native path resolves with a live session; web path triggers a redirect.
 */
export async function signInWithApple(): Promise<{ error: Error | null }> {
  if (!Capacitor.isNativePlatform()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: "https://stopamineapp.com/auth" },
    });
    return { error: error ?? null };
  }

  try {
    // NOTE: no @vite-ignore here — Vite must bundle/code-split this import.
    // A bare specifier left in the production bundle cannot be resolved by the
    // WKWebView (no import map) and the native path would fail 100% of the time.
    const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");

    const rawNonce = crypto.randomUUID() + crypto.randomUUID();
    const hashedNonce = await sha256Hex(rawNonce);

    const result = await SignInWithApple.authorize({
      // Native flow validates the token audience against the app's bundle id.
      // (Supabase Apple provider must list com.eraypack.stopamine as a client ID.)
      clientId: "com.eraypack.stopamine",
      redirectURI: "https://stopamineapp.com/auth",
      scopes: "email name",
      nonce: hashedNonce,
    });

    const idToken = result.response?.identityToken;
    if (!idToken) return { error: new Error("Apple did not return an identity token") };

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: idToken,
      nonce: rawNonce,
    });
    return { error: error ?? null };
  } catch (e) {
    // User cancelled the native sheet — not an error worth surfacing loudly
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel/i.test(msg)) return { error: null };
    return { error: e instanceof Error ? e : new Error(msg) };
  }
}
