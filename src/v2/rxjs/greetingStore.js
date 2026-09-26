import { BehaviorSubject, timer } from "rxjs";
import { useSyncExternalStore, useEffect } from "react";

export function getGreetingFromHour(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

export function getGreetingPeriod(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getHourForTimezone(timeZone) {
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      timeZone,
      hour12: false,
    }).format(new Date());
    return parseInt(hourStr, 10);
  } catch {
    return new Date().getHours();
  }
}

export const countryToTimezone = {
  US: "America/New_York",
  CA: "America/Toronto",
  IN: "Asia/Kolkata",
  GB: "Europe/London",
  JP: "Asia/Tokyo",
  AU: "Australia/Sydney",
};

export function getTimezoneForCountry(country) {
  return countryToTimezone[country];
}

const initialHour = new Date().getHours();
const initialState = {
  hour: initialHour,
  period: getGreetingPeriod(initialHour),
  greeting: getGreetingFromHour(initialHour),
  location: "World",
};

// Singleton RxJS BehaviorSubject for greeting state
export const greetingState$ = new BehaviorSubject(initialState);

let activeTimezone = null;
let activeLocation = "World";
let isFetchingLocation = false;

function computeState(hour, loc) {
  return {
    hour,
    period: getGreetingPeriod(hour),
    greeting: getGreetingFromHour(hour),
    location: loc || activeLocation || "World",
  };
}

function updateIfChanged(nextState) {
  const current = greetingState$.value;
  if (
    current.hour !== nextState.hour ||
    current.period !== nextState.period ||
    current.greeting !== nextState.greeting ||
    current.location !== nextState.location
  ) {
    greetingState$.next(nextState);
  }
}

// Global RxJS timer (ticks every 30s) to update hour and period seamlessly
timer(0, 30000).subscribe(() => {
  const currentHour = activeTimezone
    ? getHourForTimezone(activeTimezone)
    : new Date().getHours();
  updateIfChanged(computeState(currentHour, activeLocation));
});

export async function syncUserGreeting(user) {
  let detectedHour = new Date().getHours();
  let detectedLocation = "World";
  let tz = user?.timezone || (user?.country ? getTimezoneForCountry(user.country) : null);

  if (user?.timezone) {
    tz = user.timezone;
    detectedHour = getHourForTimezone(user.timezone);
    detectedLocation = user.timezone.split("/").pop()?.replace(/_/g, " ") || "Unknown";
  } else if (user?.country) {
    const mappedTz = getTimezoneForCountry(user.country);
    if (mappedTz) {
      tz = mappedTz;
      detectedHour = getHourForTimezone(mappedTz);
      detectedLocation = mappedTz.split("/").pop()?.replace(/_/g, " ") || user.country;
    }
  }

  activeTimezone = tz;
  activeLocation = detectedLocation;
  updateIfChanged(computeState(detectedHour, detectedLocation));

  // If no timezone/country provided, fetch once via IP
  if (!tz && !user?.country && !isFetchingLocation && activeLocation === "World") {
    isFetchingLocation = true;
    try {
      const res = await fetch("https://ipwho.is/");
      const data = await res.json();
      detectedLocation = data.city || data.region || data.country || "World";
      activeLocation = detectedLocation;
      detectedHour = new Date().getHours();
      updateIfChanged(computeState(detectedHour, detectedLocation));
    } catch {
      // Keep fallback
    } finally {
      isFetchingLocation = false;
    }
  }
}

// React 18 / Sync External Store Hook with RxJS Subscription
export function useGreetingState() {
  return useSyncExternalStore(
    (callback) => {
      const sub = greetingState$.subscribe(callback);
      return () => sub.unsubscribe();
    },
    () => greetingState$.getValue()
  );
}
