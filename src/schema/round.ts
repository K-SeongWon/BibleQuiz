import { z } from "zod";
import { Id, Markdown } from "./common";
import { GameMode, type ParseResult } from "./game-modes";
import { MediaAttachment } from "./media";
import { ResponseMethod } from "./question";

export const RoundDefaults = z.object({
  gameMode: GameMode.optional(),
  responseMethod: ResponseMethod.optional(),
});

export const QuizRound = z.object({
  type: z.literal("quiz"),
  id: Id,
  name: z.string().min(1),
  questionIds: z.array(Id),
  defaults: RoundDefaults.optional(),
});

export const KNOWN_INTERMISSION_SUBTYPES = [
  "scoreCheck",
  "break",
  "lottery",
  "raffle",
  "snack",
  "custom",
] as const;

export type KnownIntermissionSubtype = (typeof KNOWN_INTERMISSION_SUBTYPES)[number];

export const ScoreCheckOptions = z.object({
  highlightTopN: z.number().int().positive().default(3),
});

export const BreakOptions = z.object({
  message: Markdown.optional(),
  musicUrl: z.string().optional(),
});

export const LotteryOptions = z.object({
  candidates: z.array(z.string()).min(1),
  winners: z.number().int().positive().default(1),
});

export const RaffleOptions = z.object({
  scope: z.string().default("all"),
  winners: z.number().int().positive().default(1),
});

export const SnackOptions = z.object({
  message: Markdown.optional(),
  imageUrl: z.string().optional(),
});

export const CustomOptions = z.object({
  content: Markdown,
  media: z.array(MediaAttachment).optional(),
});

const INTERMISSION_OPTION_SCHEMAS: Record<KnownIntermissionSubtype, z.ZodTypeAny> = {
  scoreCheck: ScoreCheckOptions,
  break: BreakOptions,
  lottery: LotteryOptions,
  raffle: RaffleOptions,
  snack: SnackOptions,
  custom: CustomOptions,
};

export function isKnownIntermissionSubtype(s: string): s is KnownIntermissionSubtype {
  return (KNOWN_INTERMISSION_SUBTYPES as readonly string[]).includes(s);
}

/** Validates intermission `options` for a given subtype. Unknown subtypes pass through. */
export function parseIntermissionOptions(subtype: string, options: unknown): ParseResult {
  if (!isKnownIntermissionSubtype(subtype)) return { ok: true, data: options };
  const schema = INTERMISSION_OPTION_SCHEMAS[subtype];
  const result = schema.safeParse(options ?? {});
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error };
}

export const IntermissionRound = z.object({
  type: z.literal("intermission"),
  id: Id,
  name: z.string().min(1),
  /** Subtype string. Known subtypes get option validation via parseIntermissionOptions. */
  subtype: z.string().min(1),
  durationSec: z.number().int().positive().nullable().default(null),
  options: z.unknown().optional(),
});

/**
 * Round = QuizRound | IntermissionRound.
 * If `type` is omitted on an object, it defaults to "quiz" before discriminated-union dispatch.
 */
export const Round = z.preprocess(
  (val) => {
    if (typeof val === "object" && val !== null && !("type" in val)) {
      return { ...val, type: "quiz" };
    }
    return val;
  },
  z.discriminatedUnion("type", [QuizRound, IntermissionRound]),
);

export type Round = z.infer<typeof Round>;
