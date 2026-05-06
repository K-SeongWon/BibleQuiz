import { z } from "zod";
import { Iso8601, LanguageCode } from "./common";
import { MatchConfig } from "./match";
import { Question } from "./question";
import { Round } from "./round";

export const FORMAT_VERSION = 1 as const;
export const FormatVersion = z.literal(FORMAT_VERSION);

export const QuizSetMeta = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  createdAt: Iso8601.optional(),
  language: LanguageCode.default("ko"),
  license: z.string().optional(),
});

const QuizSetBase = z.object({
  $schema: z.string().optional(),
  formatVersion: FormatVersion,
  meta: QuizSetMeta,
  match: MatchConfig,
  rounds: z.array(Round).optional(),
  questions: z.array(Question).min(1),
});

/**
 * Top-level QuizSet schema with cross-validation:
 *  - question id uniqueness
 *  - tieBreaker.questionIds resolve to existing questions
 *  - QuizRound.questionIds resolve to existing questions
 */
export const QuizSet = QuizSetBase.superRefine((data, ctx) => {
  const ids = new Set<string>();
  for (let i = 0; i < data.questions.length; i++) {
    const id = data.questions[i].id;
    if (ids.has(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions", i, "id"],
        message: `중복된 question id: "${id}"`,
      });
    }
    ids.add(id);
  }

  const tb = data.match.tieBreaker;
  if (tb) {
    for (let i = 0; i < tb.questionIds.length; i++) {
      const id = tb.questionIds[i];
      if (!ids.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["match", "tieBreaker", "questionIds", i],
          message: `존재하지 않는 question id 참조: "${id}"`,
        });
      }
    }
  }

  const rounds = data.rounds ?? [];
  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    if (round.type === "quiz") {
      for (let q = 0; q < round.questionIds.length; q++) {
        const id = round.questionIds[q];
        if (!ids.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rounds", r, "questionIds", q],
            message: `존재하지 않는 question id 참조: "${id}"`,
          });
        }
      }
    }
  }
});

export type QuizSet = z.infer<typeof QuizSet>;

/** Convenience wrapper around `QuizSet.safeParse`. */
export function parseQuizSet(input: unknown) {
  return QuizSet.safeParse(input);
}
