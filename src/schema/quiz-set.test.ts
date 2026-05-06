import { describe, expect, it } from "vitest";
import {
  FORMAT_VERSION,
  parseGameModeOptions,
  parseIntermissionOptions,
  parseQuizSet,
} from "./index";

const minimalValid = (): Record<string, unknown> => ({
  formatVersion: FORMAT_VERSION,
  meta: { title: "Test" },
  match: { competitionMode: "team" },
  questions: [
    {
      id: "q-1",
      contentType: "OX",
      gameMode: "BuzzerTeamIndividual",
      prompt: "Test",
      answer: "O",
    },
  ],
});

describe("parseQuizSet — happy path", () => {
  it("minimal valid set parses", () => {
    expect(parseQuizSet(minimalValid()).success).toBe(true);
  });

  it("full example with rounds + tieBreaker + intermissions parses", () => {
    const data = {
      formatVersion: 1,
      meta: { title: "Full", language: "ko" },
      match: {
        competitionMode: "team",
        defaultPoints: 1,
        teams: [
          { id: "t1", name: "이스라엘", color: "#1e88e5" },
          { id: "t2", name: "유다", color: "#e53935" },
        ],
        tieBreaker: { limit: 3, questionIds: ["tb-1"] },
      },
      rounds: [
        { id: "r1", name: "1라운드", questionIds: ["q-1", "q-2"] },
        {
          id: "i1",
          type: "intermission",
          subtype: "scoreCheck",
          name: "Score check",
          durationSec: 60,
          options: { highlightTopN: 3 },
        },
      ],
      questions: [
        {
          id: "q-1",
          contentType: "MCQ",
          gameMode: "BuzzerTeamIndividual",
          prompt: "다윗의 아버지?",
          choices: [
            { id: "a", text: "사울" },
            { id: "b", text: "이새" },
          ],
          answer: "b",
          points: 1,
        },
        {
          id: "q-2",
          contentType: "OX",
          gameMode: "BuzzerTeamIndividual",
          prompt: "예수님은 베들레헴에서 태어나셨다.",
          answer: "O",
        },
        {
          id: "tb-1",
          contentType: "Short",
          gameMode: "BuzzerTeamIndividual",
          prompt: "사도행전 저자?",
          answer: "누가",
        },
      ],
    };
    const r = parseQuizSet(data);
    expect(r.success).toBe(true);
  });

  it("MCQ accepts array answer (multiple correct)", () => {
    const v = minimalValid();
    v.questions = [
      {
        id: "q-mc",
        contentType: "MCQ",
        gameMode: "BuzzerTeamIndividual",
        prompt: "사복음서?",
        choices: [
          { id: "a", text: "마태" },
          { id: "b", text: "마가" },
          { id: "c", text: "사도행전" },
        ],
        answer: ["a", "b"],
      },
    ];
    expect(parseQuizSet(v).success).toBe(true);
  });

  it("Blank with multiple blanks parses", () => {
    const v = minimalValid();
    v.questions = [
      {
        id: "q-blank",
        contentType: "Blank",
        gameMode: "BuzzerTeamIndividual",
        prompt: "주의 ___ 은 내 발에 등이요 내 길에 ___",
        blanks: [{ answer: "말씀" }, { answer: "빛" }],
      },
    ];
    expect(parseQuizSet(v).success).toBe(true);
  });

  it("media attachments (image/audio/video/youtube)", () => {
    const v = minimalValid();
    v.questions = [
      {
        id: "q-m",
        contentType: "OX",
        gameMode: "BuzzerTeamIndividual",
        prompt: "...",
        answer: "O",
        media: [
          { type: "image", url: "https://x.test/a.png" },
          { type: "audio", url: "https://x.test/a.mp3" },
          { type: "video", url: "https://x.test/a.mp4" },
          { type: "youtube", videoId: "dQw4w9WgXcQ", start: 30, end: 60 },
        ],
      },
    ];
    expect(parseQuizSet(v).success).toBe(true);
  });

  it("markdown prompts with multi-line content pass through unchanged", () => {
    const v = minimalValid();
    const prompt = "## 문제\n\n**굵은 글씨** 와 *이탤릭* 그리고\n\n- 목록\n- 두 번째";
    (v.questions as Array<Record<string, unknown>>)[0].prompt = prompt;
    const r = parseQuizSet(v);
    expect(r.success).toBe(true);
  });
});

describe("parseQuizSet — rejects", () => {
  it("missing formatVersion fails", () => {
    const { formatVersion: _omit, ...rest } = minimalValid();
    expect(parseQuizSet(rest).success).toBe(false);
  });

  it("wrong formatVersion fails", () => {
    const v = { ...minimalValid(), formatVersion: 2 };
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("duplicate question ids fail with explicit message", () => {
    const v = minimalValid();
    v.questions = [
      { id: "q-1", contentType: "OX", gameMode: "X", prompt: "a", answer: "O" },
      { id: "q-1", contentType: "OX", gameMode: "X", prompt: "b", answer: "X" },
    ];
    const r = parseQuizSet(v);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes("중복"))).toBe(true);
    }
  });

  it("tieBreaker referencing missing question fails", () => {
    const v = minimalValid();
    v.match = {
      competitionMode: "team",
      tieBreaker: { limit: 1, questionIds: ["nonexistent"] },
    };
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("round referencing missing question fails", () => {
    const v = minimalValid();
    v.rounds = [{ id: "r1", name: "R1", questionIds: ["nope"] }];
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("OX with invalid answer fails", () => {
    const v = minimalValid();
    (v.questions as Array<Record<string, unknown>>)[0].answer = "Y";
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("MCQ with empty choices fails", () => {
    const v = minimalValid();
    v.questions = [
      {
        id: "q",
        contentType: "MCQ",
        gameMode: "X",
        prompt: "?",
        choices: [],
        answer: "a",
      },
    ];
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("media url that is neither https nor data fails", () => {
    const v = minimalValid();
    (v.questions as Array<Record<string, unknown>>)[0].media = [
      { type: "image", url: "http://insecure.test/a.png" },
    ];
    expect(parseQuizSet(v).success).toBe(false);
  });

  it("empty questions array fails", () => {
    const v = minimalValid();
    v.questions = [];
    expect(parseQuizSet(v).success).toBe(false);
  });
});

describe("forward compatibility", () => {
  it("unknown gameMode is accepted at parse time", () => {
    const v = minimalValid();
    (v.questions as Array<Record<string, unknown>>)[0].gameMode = "FutureGameModeWeDontKnowYet";
    expect(parseQuizSet(v).success).toBe(true);
  });

  it("unknown intermission subtype is accepted at parse time", () => {
    const v = minimalValid();
    v.rounds = [
      {
        id: "i1",
        type: "intermission",
        subtype: "futureSubtype",
        name: "?",
        options: { anything: 1 },
      },
    ];
    expect(parseQuizSet(v).success).toBe(true);
  });

  it("round without `type` defaults to quiz", () => {
    const v = minimalValid();
    v.rounds = [{ id: "r1", name: "no-type", questionIds: ["q-1"] }];
    expect(parseQuizSet(v).success).toBe(true);
  });
});

describe("parseGameModeOptions", () => {
  it("validates BuzzerTeamIndividual options with defaults", () => {
    const r = parseGameModeOptions("BuzzerTeamIndividual", {});
    expect(r.ok).toBe(true);
    if (r.ok) {
      const data = r.data as { firstWrongCooldownRounds: number; maxRetries: number | null };
      expect(data.firstWrongCooldownRounds).toBe(1);
      expect(data.maxRetries).toBe(null);
    }
  });

  it("AllRespondTeamRanking requires rankPoints", () => {
    expect(parseGameModeOptions("AllRespondTeamRanking", {}).ok).toBe(false);
    expect(parseGameModeOptions("AllRespondTeamRanking", { rankPoints: [5, 3] }).ok).toBe(true);
  });

  it("unknown gameMode passes through options unchanged", () => {
    const r = parseGameModeOptions("Unknown", { foo: "bar" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toEqual({ foo: "bar" });
    }
  });
});

describe("parseIntermissionOptions", () => {
  it("scoreCheck applies defaults", () => {
    const r = parseIntermissionOptions("scoreCheck", {});
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect((r.data as { highlightTopN: number }).highlightTopN).toBe(3);
    }
  });

  it("custom requires content", () => {
    expect(parseIntermissionOptions("custom", {}).ok).toBe(false);
    expect(parseIntermissionOptions("custom", { content: "hi" }).ok).toBe(true);
  });

  it("unknown subtype passes through", () => {
    expect(parseIntermissionOptions("future", { x: 1 }).ok).toBe(true);
  });
});
