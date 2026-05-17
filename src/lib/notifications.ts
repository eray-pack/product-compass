// Push notification infrastructure for Stopamine
// Works in native Capacitor (iOS/Android) only.
// On web, all functions are no-ops.
//
// ── TODO before launch ────────────────────────────────────────────────────────
// 1. Enroll in Apple Developer Program ($99/year)
// 2. Create APNs key in Apple Developer portal (Keys → +)
// 3. Upload the .p8 key to Supabase:
//    Dashboard → Edge Functions → Secrets → add:
//      APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY, APNS_BUNDLE_ID
// 4. Add push capability in Xcode:
//    Target → Signing & Capabilities → + Capability → Push Notifications
// 5. Run `npx cap sync` after adding capability
// 6. Install @capacitor/push-notifications: `bun add @capacitor/push-notifications`
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabase";

// Typed stub so the rest of the file type-checks without the package installed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PushPlugin = any;

async function getPushPlugin(): Promise<PushPlugin | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    // @ts-ignore — @capacitor/push-notifications is a native-only peer dep
    const mod = await import("@capacitor/push-notifications");
    return mod.PushNotifications as PushPlugin;
  } catch {
    return null;
  }
}

export async function registerPushNotifications(userId: string): Promise<void> {
  const PushNotifications = await getPushPlugin();
  if (!PushNotifications) return;

  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== "granted") {
    console.warn("[Push] Permission denied");
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", async (token: { value: string }) => {
    console.log("[Push] Token received:", token.value);
    await saveTokenToSupabase(userId, token.value);
  });

  PushNotifications.addListener("registrationError", (err: unknown) => {
    console.error("[Push] Registration error:", err);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification: unknown) => {
    console.log("[Push] Received in foreground:", notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action: { notification: unknown }) => {
    console.log("[Push] Tapped:", action.notification);
    // TODO: navigate to relevant screen based on action.notification.data
  });
}

async function saveTokenToSupabase(userId: string, token: string): Promise<void> {
  const platform = Capacitor.getPlatform();
  await supabase.from("device_tokens").upsert(
    { user_id: userId, token, platform, updated_at: new Date().toISOString() },
    { onConflict: "user_id,token" },
  );
}

export async function unregisterPushNotifications(_userId: string): Promise<void> {
  const PushNotifications = await getPushPlugin();
  if (!PushNotifications) return;
  await PushNotifications.removeAllListeners();
}
