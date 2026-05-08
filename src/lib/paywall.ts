// Tiny pubsub for triggering the in-app premium offer modal.
import { useEffect, useState } from "react";

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();
let openState = false;

export function triggerPaywall() {
  openState = true;
  listeners.forEach((l) => l(true));
}

export function closePaywall() {
  openState = false;
  listeners.forEach((l) => l(false));
}

export function usePaywallOpen() {
  const [open, setOpen] = useState(openState);
  useEffect(() => {
    listeners.add(setOpen);
    return () => { listeners.delete(setOpen); };
  }, []);
  return open;
}
