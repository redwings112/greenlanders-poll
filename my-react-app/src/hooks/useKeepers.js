import { useEffect, useRef } from "react";

/**
 * A simple automation hook that periodically runs an action.
 * Used for "keeper"-like tasks such as checking rewards or auto-compounding.
 */
export const useKeepers = (action, intervalMs = 60000) => {
  const savedAction = useRef();

  useEffect(() => {
    savedAction.current = action;
  }, [action]);

  useEffect(() => {
    if (!intervalMs) return;
    const tick = () => {
      if (savedAction.current) savedAction.current();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
};
