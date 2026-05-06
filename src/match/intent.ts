import { getCurrentQuestion, getQuestionPoints } from "./reducer";
import type { MatchEvent, MatchIntent, MatchState } from "./types";

/** Host-side intent processor. Pure: (state, intent) -> events[]. */
export function processIntent(state: MatchState, intent: MatchIntent): MatchEvent[] {
  const at = Date.now();

  switch (intent.type) {
    case "intent.start": {
      if (state.currentQuestionIndex >= 0) return [];
      if (state.quizSet.questions.length === 0) return [];
      return [
        { type: "match.started", at },
        { type: "question.shown", questionIndex: 0, at },
      ];
    }

    case "intent.join": {
      if (state.players[intent.playerId]) return [];
      const teamExists = state.quizSet.match.teams.some((t) => t.id === intent.teamId);
      if (!teamExists) return [];
      return [
        {
          type: "player.joined",
          playerId: intent.playerId,
          name: intent.name,
          teamId: intent.teamId,
          at,
        },
      ];
    }

    case "intent.changeTeam": {
      const p = state.players[intent.playerId];
      if (!p) return [];
      if (p.teamId === intent.toTeamId) return [];
      const teamExists = state.quizSet.match.teams.some((t) => t.id === intent.toTeamId);
      if (!teamExists) return [];
      return [
        {
          type: "team.changed",
          playerId: intent.playerId,
          toTeamId: intent.toTeamId,
          actor: intent.actor,
          at,
        },
      ];
    }

    case "intent.armBuzzer":
      if (state.questionPhase !== "showing") return [];
      return [{ type: "buzzer.armed", at }];

    case "intent.pressBuzzer": {
      if (state.questionPhase !== "armed") return [];
      if (state.buzzedPlayerId !== null) return [];
      if ((state.cooldowns[intent.playerId] ?? 0) > 0) return [];
      if (!state.players[intent.playerId]) return [];
      return [{ type: "buzzer.locked", playerId: intent.playerId, at }];
    }

    case "intent.judge": {
      if (state.questionPhase !== "locked" || !state.buzzedPlayerId) return [];
      const player = state.players[state.buzzedPlayerId];
      const question = getCurrentQuestion(state);
      if (!player || !question) return [];

      if (intent.correct) {
        const delta = getQuestionPoints(state, question);
        return [{ type: "judged.correct", teamId: player.teamId, delta, at }];
      }

      const opts = (question.gameModeOptions ?? {}) as { firstWrongCooldownRounds?: number };
      const cooldown = opts.firstWrongCooldownRounds ?? 1;
      return [
        {
          type: "judged.wrong",
          playerId: state.buzzedPlayerId,
          cooldownRounds: cooldown,
          at,
        },
      ];
    }

    case "intent.pass":
      if (state.questionPhase === "judged" || state.questionPhase === "passed") return [];
      if (state.questionPhase === "idle" || state.questionPhase === "ended") return [];
      return [{ type: "question.passed", at }];

    case "intent.next": {
      const next = state.currentQuestionIndex + 1;
      if (next >= state.quizSet.questions.length) {
        return [{ type: "match.ended", at }];
      }
      return [{ type: "question.shown", questionIndex: next, at }];
    }
  }
}
