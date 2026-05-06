import { z } from "zod";
import { Id, Markdown } from "./common";
import { GameMode } from "./game-modes";
import { MediaAttachment } from "./media";

export const ResponseMethod = z.enum(["pad", "verbal"]);
export const GradingMode = z.enum(["manual", "auto", "auto-then-manual"]);

export const NormalizeOptions = z.object({
  trimWhitespace: z.boolean().default(true),
  ignoreSpaces: z.boolean().default(true),
  ignoreCase: z.boolean().default(true),
  ignorePunctuation: z.boolean().default(true),
  nfcNormalize: z.boolean().default(true),
});

const Choice = z.object({
  id: Id,
  text: z.string(),
});

const Blank = z.object({
  answer: z.string().min(1),
  acceptedAnswers: z.array(z.string()).optional(),
  normalize: NormalizeOptions.optional(),
});

const QuestionShared = {
  id: Id,
  gameMode: GameMode,
  gameModeOptions: z.unknown().optional(),
  responseMethod: ResponseMethod.optional(),
  gradingMode: GradingMode.optional(),
  prompt: Markdown,
  points: z.number().nonnegative().optional(),
  explanation: Markdown.optional(),
  media: z.array(MediaAttachment).optional(),
};

export const MCQQuestion = z.object({
  ...QuestionShared,
  contentType: z.literal("MCQ"),
  choices: z.array(Choice).min(2),
  answer: z.union([Id, z.array(Id).min(1)]),
  scoring: z.enum(["all-or-nothing", "partial"]).default("all-or-nothing"),
});

export const OXQuestion = z.object({
  ...QuestionShared,
  contentType: z.literal("OX"),
  answer: z.enum(["O", "X"]),
});

export const ShortQuestion = z.object({
  ...QuestionShared,
  contentType: z.literal("Short"),
  answer: z.string().min(1),
  acceptedAnswers: z.array(z.string()).optional(),
  normalize: NormalizeOptions.optional(),
});

export const BlankQuestion = z.object({
  ...QuestionShared,
  contentType: z.literal("Blank"),
  blanks: z.array(Blank).min(1),
});

export const Question = z.discriminatedUnion("contentType", [
  MCQQuestion,
  OXQuestion,
  ShortQuestion,
  BlankQuestion,
]);

export type Question = z.infer<typeof Question>;
