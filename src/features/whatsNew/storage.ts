import * as SecureStore from "expo-secure-store";
import { WHATS_NEW_ID } from "./constants";

const KEY_SEEN = "whats_new_seen";

export async function hasSeenWhatsNew(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEY_SEEN)) === WHATS_NEW_ID;
}

/** Also called on first launch, so new users (who just read the disclaimer) don't get "what's new". */
export async function markWhatsNewSeen(): Promise<void> {
  await SecureStore.setItemAsync(KEY_SEEN, WHATS_NEW_ID).catch(() => {});
}
