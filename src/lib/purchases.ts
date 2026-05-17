// RevenueCat integration for Stopamine
// All Capacitor/RevenueCat imports are fully dynamic so the web build is unaffected.

const RC_API_KEY_IOS = "test_lpSpiHnqWYUyBaEYCWfJQqnWupe";
const ENTITLEMENT_ID = "Stopamine Pro";

let initialized = false;

/** Returns true only when running inside a native Capacitor shell. */
async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function getPlugin() {
  if (!(await isNative())) return null;
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  return Purchases;
}

export async function initPurchases(userId?: string) {
  if (!(await isNative())) return;
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
  if (!(await isNative())) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  if (!(await isNative())) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
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
  if (!(await isNative())) return false;
  try {
    const Purchases = await getPlugin();
    if (!Purchases) return false;
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
