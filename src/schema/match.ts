import { z } from "zod";
import { CssColor, Id } from "./common";

export const Team = z.object({
  id: Id,
  name: z.string().min(1),
  color: CssColor,
});

export type Team = z.infer<typeof Team>;

export const TieBreakerConfig = z.object({
  limit: z.number().int().positive(),
  questionIds: z.array(Id).min(1),
});

export const CompetitionMode = z.enum(["team", "individual"]);

export const MatchConfig = z.object({
  competitionMode: CompetitionMode,
  defaultPoints: z.number().nonnegative().default(1),
  teams: z.array(Team).default([]),
  tieBreaker: TieBreakerConfig.optional(),
});

export type MatchConfig = z.infer<typeof MatchConfig>;
