// RevenueCat integration for Stopamine
// Uses dynamic imports so the native plugin never loads in the browser.
import { Capacitor } from "@capacitor/core";

const RC_API_KEY_IOS = "test_lpSpiHnqWYUyBaEYCWfJQqnWupe";
const ENTITLEMENT_ID = "Stopamine Pro";

let initialized = false;

async function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  // No @vite-ignore: Vite must bundle this into a resolvable chunk. A bare
  // specifier in production can't be resolved by the webview, which made every
  // RevenueCat call silently fail on device.
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  return Purchases;
}

export async function initPurchases(userId?: string) {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return;
    const { LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY_IOS });
    if (userId) await Purchases.logIn({ appUserID: userId });
    initialized = true;
  } catch (e) {
    console.warn("[RevenueCat] init failed", e);
  }
}

export async function checkPremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function purchaseAnnual(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const result = await Purchases.getOfferings();
    const offerings = ((result as unknown as Record<string, unknown>).offerings ?? result) as {
      current?: { annual?: unknown };
    };
    const annual = offerings.current?.annual;
    if (!annual) throw new Error("No annual package found");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: annual as any });
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const result = await Purchases.getOfferings();
    // RevenueCat SDK shape varies by version — cast through unknown for safety
    const offerings = ((result as unknown as Record<string, unknown>).offerings ?? result) as {
      current?: { monthly?: unknown };
    };
    const monthly = offerings.current?.monthly;
    if (!monthly) throw new Error("No monthly package found");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthly as any });
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
