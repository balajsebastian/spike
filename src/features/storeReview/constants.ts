/** Ask only once Spike has proven itself for a few days. */
export const REVIEW_AFTER_DAYS = 5;
/** Asked before (and the system may not even have shown it): wait this long before asking again. */
export const REVIEW_AGAIN_AFTER_DAYS = 120;
/** How long things have to stay calm (in range, no alarm) before asking. */
export const CALM_FOR_MS = 2 * 60_000;
/** Daytime only (local hours, [start, end)), even without night mode. */
export const REVIEW_HOURS = { start: 9, end: 21 };
