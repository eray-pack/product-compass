// RevenueCat integration for Stopamine
// Uses @revenuecat/purchases-capacitor (works in Capacitor native + falls back gracefully on web)
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

const RC_API_KEY_IOS = "test_lpSpiHnqWYUyBaEYCWfJQqnWupe";
const ENTITLEMENT_ID = "Stopamine Pro";

let initialized = false;

export async function initPurchases(userId?: string) {
  // Only initialise in a native Capacitor context (iOS/Android)
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY_IOS });
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }
    initialized = true;
  } catch (e) {
    console.warn("[RevenueCat] init failed", e);
  }
}

export async function checkPremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  try {
    const { offerings } = await Purchases.getOfferings();
    const monthly = offerings.current?.monthly;
    if (!monthly) throw new Error("No monthly package found");
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthly });
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
