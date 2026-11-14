import { CredentialsRejectedError } from "../errors";

/** Share's error body is `{ Code, Message }`. Login errors must not be retried (see CredentialsRejectedError). */
export function toLoginError(status: number, text: string): Error {
  let code = "";
  let message = "";
  try {
    const body = JSON.parse(text);
    code = String(body?.Code ?? "");
    message = String(body?.Message ?? "");
  } catch {
    // Not JSON: fall through to the generic error.
  }

  if (code === "SSO_AuthenticateMaxAttemptsExceeded") {
    return new CredentialsRejectedError(`Dexcom account locked: ${code}`, true);
  }
  if (
    code === "AccountPasswordInvalid" ||
    (code === "SSO_InternalError" && message.includes("Cannot Authenticate")) ||
    (code === "InvalidArgument" && /accountName|password/i.test(message))
  ) {
    return new CredentialsRejectedError(`Dexcom login rejected: ${code}`);
  }
  return new Error(`Dexcom API error ${status}: ${text}`);
}
