import { FORMAT_VERSION, type QuizSet, parseQuizSet } from "@/schema";
import type { MatchState } from "./types";

export function seedQuizSet(): QuizSet {
  const input = {
    formatVersion: FORMAT_VERSION,
    meta: { title: "데모 매치", language: "ko" },
    match: {
      competitionMode: "team" as const,
      defaultPoints: 1,
      teams: [
        { id: "t1", name: "이스라엘", color: "#1e88e5" },
        { id: "t2", name: "유다", color: "#e53935" },
      ],
    },
    questions: [
      {
        id: "q-1",
        contentType: "OX",
        gameMode: "BuzzerTeamIndividual",
        prompt: "예수님은 베들레헴에서 태어나셨다.",
        answer: "O",
        explanation: "마태복음 2:1, 누가복음 2:4-7",
      },
      {
        id: "q-2",
        contentType: "MCQ",
        gameMode: "BuzzerTeamIndividual",
        prompt: "다윗의 아버지의 이름은?",
        choices: [
          { id: "a", text: "사울" },
          { id: "b", text: "이새" },
          { id: "c", text: "사무엘" },
          { id: "d", text: "솔로몬" },
        ],
        answer: "b",
      },
      {
        id: "q-3",
        contentType: "Short",
        gameMode: "BuzzerTeamIndividual",
        prompt: "예수님이 처음 기적을 행하신 동네는?",
        answer: "가나",
        points: 2,
        explanation: "요한복음 2:1-11",
      },
      {
        id: "q-4",
        contentType: "Blank",
        gameMode: "BuzzerTeamIndividual",
        prompt: "주의 ___ 은 내 발에 등이요 내 길에 빛이니이다.",
        blanks: [{ answer: "말씀" }],
        points: 2,
        explanation: "시편 119:105",
      },
    ],
  };
  const result = parseQuizSet(input);
  if (!result.success) {
    throw new Error(`Seed quiz set is invalid: ${result.error.message}`);
  }
  return result.data;
}

export function seedMatchState(matchId = "demo"): MatchState {
  const quizSet = seedQuizSet();
  return {
    matchId,
    quizSet,
    players: {},
    scores: Object.fromEntries(quizSet.match.teams.map((t) => [t.id, 0])),
    currentQuestionIndex: -1,
    questionPhase: "idle",
    buzzedPlayerId: null,
    cooldowns: {},
    retryCount: 0,
    history: [],
  };
}
