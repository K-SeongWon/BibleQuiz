import { Badge } from "@/client/shared/components/ui/badge";
import { Button } from "@/client/shared/components/ui/button";
import { cn } from "@/client/shared/lib/utils";
import { useDispatch, useMatchState } from "@/match/hooks";
import { useTranslation } from "react-i18next";

type Props = {
  playerId: string;
  /** Compact variant for embedding multiple pads side-by-side (e.g., /demo). */
  compact?: boolean;
};

/**
 * Pad view scoped to a single playerId. The player must already be joined.
 * For self-onboarding (name + team selection) use the wrapping Pad route.
 */
export function PadView({ playerId, compact = false }: Props) {
  const state = useMatchState();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const player = state.players[playerId];
  const team = player ? state.quizSet.match.teams.find((tt) => tt.id === player.teamId) : null;
  const cooldown = state.cooldowns[playerId] ?? 0;
  const isMyBuzz = state.buzzedPlayerId === playerId;

  if (!player) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        {t("pad.notJoined")}
      </div>
    );
  }

  const buzzerState = computeBuzzerState({
    phase: state.questionPhase,
    cooldown,
    isMyBuzz,
    locked: state.buzzedPlayerId !== null,
  });

  const onPress = () => dispatch({ type: "intent.pressBuzzer", playerId });

  return (
    <div className={cn("flex flex-col gap-3", compact ? "p-3" : "p-4")}>
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: team?.color }} />
          <span className="font-semibold truncate">{player.name}</span>
          <Badge variant="outline" className="shrink-0">
            {team?.name ?? "?"}
          </Badge>
        </div>
        {cooldown > 0 && <Badge variant="secondary">{t("pad.cooldown", { n: cooldown })}</Badge>}
      </header>

      <Button
        type="button"
        disabled={!buzzerState.enabled}
        onClick={onPress}
        className={cn(
          "w-full font-bold transition-all",
          compact ? "h-32 text-2xl" : "h-56 text-4xl",
          buzzerState.className,
        )}
        aria-live="polite"
      >
        {t(`pad.buzzer.${buzzerState.label}`)}
      </Button>

      <div className="flex justify-end">
        <select
          value={player.teamId}
          onChange={(e) =>
            dispatch({
              type: "intent.changeTeam",
              playerId,
              toTeamId: e.target.value,
              actor: "self",
            })
          }
          className="text-xs border rounded px-2 py-1 bg-background"
          aria-label={t("pad.changeTeam")}
        >
          {state.quizSet.match.teams.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {tt.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

type BuzzerState = { enabled: boolean; label: string; className: string };

function computeBuzzerState(args: {
  phase: string;
  cooldown: number;
  isMyBuzz: boolean;
  locked: boolean;
}): BuzzerState {
  const { phase, cooldown, isMyBuzz, locked } = args;
  if (phase === "ended") return { enabled: false, label: "ended", className: "bg-slate-500" };
  if (phase === "idle") return { enabled: false, label: "idle", className: "bg-slate-400" };
  if (cooldown > 0) return { enabled: false, label: "cooldown", className: "bg-amber-500" };
  if (phase === "armed")
    return {
      enabled: true,
      label: "armed",
      className: "bg-rose-600 hover:bg-rose-700 animate-pulse",
    };
  if (phase === "locked" && isMyBuzz)
    return { enabled: false, label: "youBuzzed", className: "bg-emerald-600" };
  if (phase === "locked" && locked)
    return { enabled: false, label: "otherBuzzed", className: "bg-slate-500" };
  if (phase === "judged" && isMyBuzz)
    return { enabled: false, label: "correct", className: "bg-emerald-600" };
  if (phase === "judged") return { enabled: false, label: "judged", className: "bg-slate-500" };
  if (phase === "passed") return { enabled: false, label: "passed", className: "bg-slate-500" };
  return { enabled: false, label: "waiting", className: "bg-slate-400" };
}
