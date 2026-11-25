import { useEffect, useState } from "react";

/** The current time, refreshed right when the minute changes, so a clock never shows a stale minute. */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const current = new Date();
      setNow(current);
      const msToNextMinute = 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds());
      timeout = setTimeout(schedule, msToNextMinute + 50);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return now;
}
