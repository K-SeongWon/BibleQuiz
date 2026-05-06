import type { QuizSet } from "@/schema";

export type Player = {
  id: string;
  name: string;
  teamId: string;
};

export type QuestionPhase = "idle" | "showing" | "armed" | "locked" | "judged" | "passed" | "ended";

export type MatchState = {
  matchId: string;
  quizSet: QuizSet;
  players: Record<string, Player>;
  scores: Record<string, number>;
  currentQuestionIndex: number;
  questionPhase: QuestionPhase;
  buzzedPlayerId: string | null;
  cooldowns: Record<string, number>;
  retryCount: number;
  history: MatchEvent[];
};

export type MatchEvent =
  | { type: "match.started"; at: number }
  | { type: "match.ended"; at: number }
  | { type: "player.joined"; playerId: string; name: string; teamId: string; at: number }
  | {
      type: "team.changed";
      playerId: string;
      toTeamId: string;
      actor: "self" | "host";
      at: number;
    }
  | { type: "question.shown"; questionIndex: number; at: number }
  | { type: "buzzer.armed"; at: number }
  | { type: "buzzer.locked"; playerId: string; at: number }
  | { type: "judged.correct"; teamId: string; delta: number; at: number }
  | { type: "judged.wrong"; playerId: string; cooldownRounds: number; at: number }
  | { type: "question.passed"; at: number };

export type MatchIntent =
  | { type: "intent.start" }
  | { type: "intent.join"; playerId: string; name: string; teamId: string }
  | { type: "intent.changeTeam"; playerId: string; toTeamId: string; actor: "self" | "host" }
  | { type: "intent.armBuzzer" }
  | { type: "intent.pressBuzzer"; playerId: string }
  | { type: "intent.judge"; correct: boolean }
  | { type: "intent.pass" }
  | { type: "intent.next" };
