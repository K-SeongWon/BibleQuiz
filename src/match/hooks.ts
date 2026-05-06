import type { Question } from "@/schema";
import { useSyncExternalStore } from "react";
import { getCurrentQuestion } from "./reducer";
import { type MatchStore, getMatchStore } from "./store";
import type { MatchIntent, MatchState } from "./types";

export function useStore(): MatchStore {
  return getMatchStore();
}

export function useMatchState(): MatchState {
  const store = useStore();
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState(),
  );
}

export function useDispatch(): (intent: MatchIntent) => void {
  const store = useStore();
  return (intent) => {
    store.dispatch(intent);
  };
}

export function useCurrentQuestion(): Question | null {
  const state = useMatchState();
  return getCurrentQuestion(state);
}
