import { Button } from "@/client/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/shared/components/ui/card";
import { Input } from "@/client/shared/components/ui/input";
import { useDispatch, useMatchState } from "@/match/hooks";
import {
  getOrCreatePlayerId,
  getStoredName,
  getStoredTeamId,
  setStoredName,
  setStoredTeamId,
} from "@/match/identity";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PadView } from "./PadView";

export default function Pad() {
  const state = useMatchState();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [playerId, setPlayerId] = useState<string>("");
  const [name, setName] = useState<string>(getStoredName());
  const [teamId, setTeamId] = useState<string>(
    getStoredTeamId() || state.quizSet.match.teams[0]?.id || "",
  );

  useEffect(() => {
    setPlayerId(getOrCreatePlayerId());
  }, []);

  const joined = playerId && Boolean(state.players[playerId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId || !playerId) return;
    setStoredName(name.trim());
    setStoredTeamId(teamId);
    dispatch({ type: "intent.join", playerId, name: name.trim(), teamId });
  };

  if (!joined) {
    return (
      <main className="min-h-dvh p-4 grid place-items-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("pad.joinTitle")}</CardTitle>
            <CardDescription>{t("pad.joinDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="pad-name" className="text-sm font-medium">
                  {t("pad.name")}
                </label>
                <Input
                  id="pad-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("pad.namePlaceholder")}
                  required
                  maxLength={30}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pad-team" className="text-sm font-medium">
                  {t("pad.team")}
                </label>
                <select
                  id="pad-team"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-background"
                >
                  {state.quizSet.match.teams.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim()}>
                {t("pad.joinButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-dvh p-2">
      <PadView playerId={playerId} />
    </main>
  );
}
