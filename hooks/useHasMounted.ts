import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Canonical hydration-safe "has the client mounted yet" gate. Returns false
 * on the server and on the client's first (hydration) render, then true from
 * then on — so any conditional based on this never mismatches server HTML,
 * unlike the common `useEffect(() => setState(true), [])` pattern, which
 * calls setState synchronously inside an effect.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
