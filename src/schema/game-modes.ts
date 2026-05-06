import { z } from "zod";

/** Known game modes. Unknown values are accepted (forward-compat) but options are not validated for them. */
export const KNOWN_GAME_MODES = [
  "BuzzerTeamIndividual",
  "AllRespondTeamRanking",
  "TeamCollab",
  "FastestTeam",
  "Lightning",
  "Repechage",
] as const;

export type KnownGameMode = (typeof KNOWN_GAME_MODES)[number];

/** Any non-empty string. Unknown modes are preserved with a runtime warning. */
export const GameMode = z.string().min(1);

export const BuzzerTeamIndividualOptions = z.object({
  firstWrongCooldownRounds: z.number().int().nonnegative().default(1),
  maxRetries: z.number().int().positive().nullable().default(null),
});

export const AllRespondTeamRankingOptions = z.object({
  rankPoints: z.array(z.number()).min(1),
  responseWindowSec: z.number().positive().nullable().default(null),
  tieBreaker: z.enum(["split", "speed", "none"]).default("split"),
});

const GAME_MODE_OPTION_SCHEMAS: Record<KnownGameMode, z.ZodTypeAny | null> = {
  BuzzerTeamIndividual: BuzzerTeamIndividualOptions,
  AllRespondTeamRanking: AllRespondTeamRankingOptions,
  TeamCollab: null,
  FastestTeam: null,
  Lightning: null,
  Repechage: null,
};

export function isKnownGameMode(mode: string): mode is KnownGameMode {
  return (KNOWN_GAME_MODES as readonly string[]).includes(mode);
}

export type ParseResult = { ok: true; data: unknown } | { ok: false; error: z.ZodError };

/** Validates `gameModeOptions` for a given mode. Unknown modes pass through unchanged. */
export function parseGameModeOptions(mode: string, options: unknown): ParseResult {
  if (!isKnownGameMode(mode)) return { ok: true, data: options };
  const schema = GAME_MODE_OPTION_SCHEMAS[mode];
  if (!schema) return { ok: true, data: options };
  const result = schema.safeParse(options ?? {});
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error };
}
