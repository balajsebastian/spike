/** The alarm last went off long enough ago to ring again (with a little grace for readings that arrive slightly early). */
export function isRepeatDue(lastAt: number, now: number, repeatMinutes: number, graceMs: number): boolean {
  return now - lastAt >= repeatMinutes * 60_000 - graceMs;
}
