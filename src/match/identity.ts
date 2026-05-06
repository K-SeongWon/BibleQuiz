/**
 * Anonymous participant identity, stored in localStorage.
 * Per PROJECT_PLAN §6 #2 / QUIZ_SET_SCHEMA §9.5: no IP/MAC, no PII.
 */

const ID_KEY = "biblequiz.player.id";
const NAME_KEY = "biblequiz.player.name";
const TEAM_KEY = "biblequiz.player.teamId";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(ID_KEY);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  window.localStorage.setItem(ID_KEY, fresh);
  return fresh;
}

export function getStoredName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function setStoredName(name: string): void {
  window.localStorage.setItem(NAME_KEY, name);
}

export function getStoredTeamId(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TEAM_KEY) ?? "";
}

export function setStoredTeamId(teamId: string): void {
  window.localStorage.setItem(TEAM_KEY, teamId);
}

export function clearIdentity(): void {
  window.localStorage.removeItem(ID_KEY);
  window.localStorage.removeItem(NAME_KEY);
  window.localStorage.removeItem(TEAM_KEY);
}
