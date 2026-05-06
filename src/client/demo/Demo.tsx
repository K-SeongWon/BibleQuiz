import Console from "@/client/console/Console";
import { PadView } from "@/client/pad/PadView";
import { Button } from "@/client/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/shared/components/ui/card";
import Stage from "@/client/stage/Stage";
import { useDispatch, useMatchState } from "@/match/hooks";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SAMPLE_NAMES = ["요한", "베드로", "안드레", "야고보", "마태", "도마", "빌립", "맛디아"];

export default function Demo() {
  const state = useMatchState();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [counter, setCounter] = useState(0);

  const players = Object.values(state.players);
  const teams = state.quizSet.match.teams;

  const addSyntheticPlayer = () => {
    const idx = players.length;
    const name =
      SAMPLE_NAMES[idx % SAMPLE_NAMES.length] + (idx >= SAMPLE_NAMES.length ? `${idx}` : "");
    const teamId = teams[idx % teams.length].id;
    const playerId = `synthetic-${counter}-${crypto.randomUUID().slice(0, 8)}`;
    dispatch({ type: "intent.join", playerId, name, teamId });
    setCounter((n) => n + 1);
  };

  return (
    <main className="min-h-dvh">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Stage */}
        <section className="lg:col-span-2 rounded-xl overflow-hidden border min-h-[400px]">
          <Stage />
        </section>

        {/* Console */}
        <section className="rounded-xl border bg-card">
          <Console />
        </section>

        {/* Multiple Pads */}
        <section className="rounded-xl border bg-card p-4 space-y-3">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {t("demo.pads")}{" "}
              <span className="text-muted-foreground text-sm font-normal">({players.length})</span>
            </h2>
            <Button size="sm" onClick={addSyntheticPlayer}>
              <UserPlus className="size-4 mr-1" />
              {t("demo.addPlayer")}
            </Button>
          </header>

          {players.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("demo.empty")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={addSyntheticPlayer} variant="outline" size="sm">
                  <Plus className="size-4 mr-1" />
                  {t("demo.addFirst")}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((p) => (
              <Card key={p.id}>
                <PadView playerId={p.id} compact />
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
