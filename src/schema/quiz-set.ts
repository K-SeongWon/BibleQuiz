import { z } from "zod";

// 본 파일은 모듈 위치를 잡아두는 placeholder.
// 전체 스키마는 후속 PR에서 docs/planning/QUIZ_SET_SCHEMA.md를 따라 채워나간다.

export const FormatVersion = z.literal(1);

export const QuizSetMeta = z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  language: z.string().default("ko"),
  license: z.string().optional(),
});

export const QuizSet = z.object({
  formatVersion: FormatVersion,
  meta: QuizSetMeta,
  match: z.unknown(),
  rounds: z.array(z.unknown()).optional(),
  questions: z.array(z.unknown()),
});

export type QuizSet = z.infer<typeof QuizSet>;
