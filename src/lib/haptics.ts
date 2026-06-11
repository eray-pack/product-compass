// Haptic feedback — the strongest "this is a real native app" signal on iPhone.
// Each helper is fire-and-forget, native-only, and guarded for older installed
// shells that don't carry the plugin yet (Path B: web updates outrun binaries).
import { Capacitor } from "@capacitor/core";

function available(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Haptics");
}

/** Light tick — tab changes, pill switches, carousel snaps */
export async function hapticLight() {
  if (!available()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* never surface haptic failures */ }
}

/** Medium thunk — confirming an action (check-in, send) */
export async function hapticMedium() {
  if (!available()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* noop */ }
}

/** Success pattern — milestone, urge survived, purchase complete */
export async function hapticSuccess() {
  if (!available()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch { /* noop */ }
}

/** Warning pattern — serious confirmations (logging a relapse) */
export async function hapticWarning() {
  if (!available()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Warning });
  } catch { /* noop */ }
}
