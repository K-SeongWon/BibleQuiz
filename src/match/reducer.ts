import type { Question } from "@/schema";
import type { MatchEvent, MatchState, Player } from "./types";

export function getCurrentQuestion(state: MatchState): Question | null {
  if (state.currentQuestionIndex < 0) return null;
  return state.quizSet.questions[state.currentQuestionIndex] ?? null;
}

export function getQuestionPoints(state: MatchState, q: Question): number {
  return q.points ?? state.quizSet.match.defaultPoints;
}

export function reduce(state: MatchState, event: MatchEvent): MatchState {
  const next = applyEvent(state, event);
  return { ...next, history: [...state.history, event] };
}

function applyEvent(state: MatchState, event: MatchEvent): MatchState {
  switch (event.type) {
    case "match.started":
      return state;

    case "match.ended":
      return { ...state, questionPhase: "ended" };

    case "player.joined": {
      const player: Player = { id: event.playerId, name: event.name, teamId: event.teamId };
      return { ...state, players: { ...state.players, [event.playerId]: player } };
    }

    case "team.changed": {
      const p = state.players[event.playerId];
      if (!p) return state;
      return {
        ...state,
        players: { ...state.players, [event.playerId]: { ...p, teamId: event.toTeamId } },
      };
    }

    case "question.shown": {
      // Each new question = 1 round → decrement all cooldowns.
      const cd: Record<string, number> = {};
      for (const [pid, n] of Object.entries(state.cooldowns)) {
        if (n - 1 > 0) cd[pid] = n - 1;
      }
      return {
        ...state,
        currentQuestionIndex: event.questionIndex,
        questionPhase: "showing",
        buzzedPlayerId: null,
        cooldowns: cd,
        retryCount: 0,
      };
    }

    case "buzzer.armed":
      return { ...state, questionPhase: "armed", buzzedPlayerId: null };

    case "buzzer.locked":
      return { ...state, questionPhase: "locked", buzzedPlayerId: event.playerId };

    case "judged.correct": {
      const scores = { ...state.scores };
      scores[event.teamId] = (scores[event.teamId] ?? 0) + event.delta;
      return { ...state, questionPhase: "judged", scores };
    }

    case "judged.wrong":
      // 같은 문제에서 첫 오답자 쿨타임 적용 + showing 상태로 복귀하여 재-armed 가능.
      return {
        ...state,
        questionPhase: "showing",
        buzzedPlayerId: null,
        cooldowns: { ...state.cooldowns, [event.playerId]: event.cooldownRounds },
        retryCount: state.retryCount + 1,
      };

    case "question.passed":
      return { ...state, questionPhase: "passed" };

    default:
      return state;
  }
}
