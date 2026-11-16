import { useWhatsNewOnce } from "../hooks/useWhatsNewOnce";

/** Renders nothing; opens "What's new" from the monitor when there is something new. */
export function WhatsNewTrigger() {
  useWhatsNewOnce();
  return null;
}
