import { processIntent } from "./intent";
import { reduce } from "./reducer";
import { seedMatchState } from "./seed";
import type { MatchEvent, MatchIntent, MatchState } from "./types";

type Subscriber = () => void;

/**
 * In-memory match store. Single tab / single React tree.
 * Cross-tab / cross-device sync comes in a follow-up PR (Transport).
 */
export class MatchStore {
  private state: MatchState;
  private subscribers = new Set<Subscriber>();

  constructor(initial: MatchState) {
    this.state = initial;
  }

  getState(): MatchState {
    return this.state;
  }

  subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  /** Apply an intent, derive events, mutate state, notify. Returns produced events. */
  dispatch(intent: MatchIntent): MatchEvent[] {
    const events = processIntent(this.state, intent);
    if (events.length === 0) return events;
    let s = this.state;
    for (const ev of events) {
      s = reduce(s, ev);
    }
    this.state = s;
    this.notify();
    return events;
  }

  /** Reset to a fresh seed match. */
  reset(): void {
    this.state = seedMatchState(this.state.matchId);
    this.notify();
  }

  private notify(): void {
    for (const cb of this.subscribers) cb();
  }
}

/** Module-level singleton — lets multiple routes within one tab share state. */
let singleton: MatchStore | null = null;

export function getMatchStore(): MatchStore {
  if (!singleton) singleton = new MatchStore(seedMatchState());
  return singleton;
}
