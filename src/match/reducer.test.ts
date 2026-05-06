import { describe, expect, it } from "vitest";
import { processIntent } from "./intent";
import { reduce } from "./reducer";
import { seedMatchState } from "./seed";
import { MatchStore } from "./store";
import type { MatchEvent, MatchIntent, MatchState } from "./types";

function applyIntents(initial: MatchState, intents: MatchIntent[]): MatchState {
  let s = initial;
  for (const intent of intents) {
    const events = processIntent(s, intent);
    for (const ev of events) {
      s = reduce(s, ev);
    }
  }
  return s;
}

const ALICE = "p-alice";
const BOB = "p-bob";

function joinedState(): MatchState {
  return applyIntents(seedMatchState(), [
    { type: "intent.join", playerId: ALICE, name: "Alice", teamId: "t1" },
    { type: "intent.join", playerId: BOB, name: "Bob", teamId: "t2" },
    { type: "intent.start" },
  ]);
}

describe("match start", () => {
  it("intent.start advances to first question in 'showing' phase", () => {
    const s = joinedState();
    expect(s.currentQuestionIndex).toBe(0);
    expect(s.questionPhase).toBe("showing");
  });

  it("intent.start is no-op once already started", () => {
    const s = joinedState();
    const events = processIntent(s, { type: "intent.start" });
    expect(events).toEqual([]);
  });
});

describe("buzzer lifecycle (BuzzerTeamIndividual)", () => {
  it("press while not armed is rejected", () => {
    const s = joinedState();
    expect(processIntent(s, { type: "intent.pressBuzzer", playerId: ALICE })).toEqual([]);
  });

  it("first press in armed phase locks that player", () => {
    let s = joinedState();
    s = applyIntents(s, [{ type: "intent.armBuzzer" }]);
    expect(s.questionPhase).toBe("armed");

    s = applyIntents(s, [{ type: "intent.pressBuzzer", playerId: ALICE }]);
    expect(s.questionPhase).toBe("locked");
    expect(s.buzzedPlayerId).toBe(ALICE);
  });

  it("second press while locked is ignored", () => {
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
    ]);
    const events = processIntent(s, { type: "intent.pressBuzzer", playerId: BOB });
    expect(events).toEqual([]);
    expect(s.buzzedPlayerId).toBe(ALICE);
  });

  it("correct answer awards points to the buzzer player's team", () => {
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
    ]);
    expect(s.questionPhase).toBe("judged");
    expect(s.scores.t1).toBe(1);
    expect(s.scores.t2).toBe(0);
  });

  it("wrong answer puts the player on cooldown and re-opens the question", () => {
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: false },
    ]);
    expect(s.questionPhase).toBe("showing");
    expect(s.buzzedPlayerId).toBeNull();
    expect(s.cooldowns[ALICE]).toBe(1);
    expect(s.retryCount).toBe(1);
  });

  it("player on cooldown cannot press in the same question", () => {
    let s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: false },
      { type: "intent.armBuzzer" },
    ]);
    expect(s.questionPhase).toBe("armed");
    // Alice is on cooldown — her press is rejected
    expect(processIntent(s, { type: "intent.pressBuzzer", playerId: ALICE })).toEqual([]);
    // Bob can still press
    s = applyIntents(s, [{ type: "intent.pressBuzzer", playerId: BOB }]);
    expect(s.buzzedPlayerId).toBe(BOB);
  });

  it("cooldown decrements when next question is shown", () => {
    let s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: false },
    ]);
    expect(s.cooldowns[ALICE]).toBe(1);
    // Pass current question and advance
    s = applyIntents(s, [{ type: "intent.pass" }, { type: "intent.next" }]);
    expect(s.currentQuestionIndex).toBe(1);
    // Cooldown should now be 0 (key removed)
    expect(s.cooldowns[ALICE]).toBeUndefined();
  });

  it("question.shown resets retryCount and clears any locked buzzer", () => {
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
      { type: "intent.next" },
    ]);
    expect(s.currentQuestionIndex).toBe(1);
    expect(s.questionPhase).toBe("showing");
    expect(s.buzzedPlayerId).toBeNull();
    expect(s.retryCount).toBe(0);
  });
});

describe("scoring uses question points override or match default", () => {
  it("question without points uses match defaultPoints (1)", () => {
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
    ]);
    expect(s.scores.t1).toBe(1);
  });

  it("question with explicit points uses that value", () => {
    // Advance to q-3 which has points: 2
    const s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
      { type: "intent.next" }, // q-2
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
      { type: "intent.next" }, // q-3 (points: 2)
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: BOB },
      { type: "intent.judge", correct: true },
    ]);
    expect(s.scores.t1).toBe(2); // q-1 + q-2
    expect(s.scores.t2).toBe(2); // q-3
  });
});

describe("match end", () => {
  it("intent.next past the last question ends the match", () => {
    let s = joinedState();
    // 4 questions in the seed set
    for (let i = 0; i < 4; i++) {
      s = applyIntents(s, [{ type: "intent.pass" }, { type: "intent.next" }]);
    }
    expect(s.questionPhase).toBe("ended");
  });
});

describe("team change", () => {
  it("changes player team but keeps already-earned scores in old team", () => {
    let s = applyIntents(joinedState(), [
      { type: "intent.armBuzzer" },
      { type: "intent.pressBuzzer", playerId: ALICE },
      { type: "intent.judge", correct: true },
    ]);
    expect(s.scores.t1).toBe(1);
    s = applyIntents(s, [
      { type: "intent.changeTeam", playerId: ALICE, toTeamId: "t2", actor: "self" },
    ]);
    expect(s.players[ALICE].teamId).toBe("t2");
    expect(s.scores.t1).toBe(1);
    expect(s.scores.t2).toBe(0);
  });
});

describe("MatchStore", () => {
  it("notifies subscribers on dispatch and unsubscribes cleanly", () => {
    const store = new MatchStore(seedMatchState());
    let n = 0;
    const unsub = store.subscribe(() => {
      n++;
    });
    store.dispatch({ type: "intent.start" });
    expect(n).toBeGreaterThanOrEqual(1);
    unsub();
    store.dispatch({ type: "intent.armBuzzer" });
    const after = n;
    store.dispatch({ type: "intent.pressBuzzer", playerId: "ghost" });
    expect(n).toBe(after);
  });

  it("does not notify when intent produces no events", () => {
    const store = new MatchStore(seedMatchState());
    let n = 0;
    store.subscribe(() => {
      n++;
    });
    // press while idle → no events
    store.dispatch({ type: "intent.pressBuzzer", playerId: "x" });
    expect(n).toBe(0);
  });

  it("history accumulates only authoritative events", () => {
    const store = new MatchStore(seedMatchState());
    const events: MatchEvent[] = store.dispatch({ type: "intent.start" });
    expect(events.length).toBeGreaterThanOrEqual(1);
    const historyLen = store.getState().history.length;
    expect(historyLen).toBe(events.length);
  });
});
