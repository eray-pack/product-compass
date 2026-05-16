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
// ─────────────────────────────────────────────────────────────────────────────

import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabase";

export async function registerPushNotifications(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Request permission
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== "granted") {
    console.warn("[Push] Permission denied");
    return;
  }

  // Register with APNs / FCM — triggers 'registration' event below
  await PushNotifications.register();

  // Listen for token
  PushNotifications.addListener("registration", async (token) => {
    console.log("[Push] Token received:", token.value);
    await saveTokenToSupabase(userId, token.value);
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("[Push] Registration error:", err);
  });

  // Handle foreground notifications
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[Push] Received in foreground:", notification);
  });

  // Handle notification tap
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("[Push] Tapped:", action.notification);
    // TODO: navigate to relevant screen based on action.notification.data
  });
}

async function saveTokenToSupabase(userId: string, token: string): Promise<void> {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android'
  await supabase.from("device_tokens").upsert({
    user_id: userId,
    token,
    platform,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,token" });
}

export async function unregisterPushNotifications(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await PushNotifications.removeAllListeners();
  // Token stays in DB — APNs handles invalid tokens gracefully
}
