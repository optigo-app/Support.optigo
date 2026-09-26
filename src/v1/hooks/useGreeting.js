import { useEffect } from "react";
import {
  syncUserGreeting,
  useGreetingState,
  getGreetingFromHour,
  getGreetingPeriod,
  greetingState$,
} from "../rxjs/greetingStore";

export { getGreetingFromHour, getGreetingPeriod, greetingState$ };

export function useGreeting(user) {
  useEffect(() => {
    syncUserGreeting(user);
  }, [user]);

  const state = useGreetingState();
  return state;
}
