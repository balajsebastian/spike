import { CredentialsRejectedError } from "@/providers/errors";
import { NightscoutError } from "@/providers/nightscout/client";
import type { LoginSource } from "./connection";

/** i18n key for a form that can't be submitted yet, or null when it's complete. */
export function validateLoginForm(source: LoginSource, field1: string, field2: string): string | null {
  if (!field1) return source === "nightscout" ? "login.errors.nightscoutUrl" : "login.errors.fillAll";
  // The Nightscout token is optional.
  if (source !== "nightscout" && !field2) return "login.errors.fillAll";
  return null;
}

/** A failed login as an i18n key; anything unexpected gets a generic "couldn't connect". */
export function describeLoginError(err: unknown, source: LoginSource): { key: string } {
  // A Dexcom account only exists in its own region, so a wrong region looks exactly like a wrong password.
  const invalidKey = source === "dexcom" ? "login.errors.invalidDexcom" : "login.errors.invalidCredentials";
  if (err instanceof CredentialsRejectedError) {
    return { key: err.locked ? "login.errors.accountLocked" : invalidKey };
  }
  if (err instanceof NightscoutError) {
    return { key: err.kind === "auth" ? "login.errors.nightscoutToken" : "login.errors.nightscoutNotFound" };
  }
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("500") ? { key: invalidKey } : { key: "login.errors.connectionFailed" };
}
