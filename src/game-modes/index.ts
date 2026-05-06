import { BuzzerTeamIndividualOptions } from "@/schema";

/**
 * Game mode plugin registry.
 * MVP: BuzzerTeamIndividual only. Future modes will register here.
 */
export const gameModes = {
  BuzzerTeamIndividual: {
    id: "BuzzerTeamIndividual" as const,
    optionsSchema: BuzzerTeamIndividualOptions,
  },
} as const;

export type GameModeId = keyof typeof gameModes;
