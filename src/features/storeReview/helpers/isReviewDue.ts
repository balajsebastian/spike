const DAY_MS = 24 * 60 * 60_000;

/** Used Spike for at least `afterDays`, and not asked in the last `againAfterDays`. */
export function isReviewDue(
  firstSeenAt: number,
  requestedAt: number | null,
  now: number,
  afterDays: number,
  againAfterDays: number,
): boolean {
  if (now - firstSeenAt < afterDays * DAY_MS) return false;
  return requestedAt === null || now - requestedAt >= againAfterDays * DAY_MS;
}
