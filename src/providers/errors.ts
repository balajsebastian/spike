/**
 * The provider rejected the saved login (wrong or changed password, locked account).
 * Never retry on this: repeated failed logins get the user's real CGM account locked.
 */
export class CredentialsRejectedError extends Error {
  readonly locked: boolean;

  constructor(message: string, locked = false) {
    super(message);
    this.name = "CredentialsRejectedError";
    this.locked = locked;
  }
}
