import { Badge } from "@/client/shared/components/ui/badge";
import { Button } from "@/client/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/shared/components/ui/card";
import { useCurrentQuestion, useDispatch, useMatchState, useStore } from "@/match/hooks";
import { Check, Play, RotateCw, SkipForward, X, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Console() {
  const state = useMatchState();
  const question = useCurrentQuestion();
  const dispatch = useDispatch();
  const store = useStore();
  const { t } = useTranslation();

  const teams = state.quizSet.match.teams;
  const players = Object.values(state.players);
  const phase = state.questionPhase;

  return (
    <main className="min-h-dvh p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t("console.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {state.currentQuestionIndex >= 0
              ? t("console.qProgress", {
                  current: state.currentQuestionIndex + 1,
                  total: state.quizSet.questions.length,
                  phase: t(`phase.${phase}`),
                })
              : t("console.idle")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => store.reset()}>
          <RotateCw className="size-4 mr-2" />
          {t("console.reset")}
        </Button>
      </header>

      {/* Action bar */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-2">
          {phase === "idle" && (
            <Button size="lg" onClick={() => dispatch({ type: "intent.start" })}>
              <Play className="size-4 mr-2" />
              {t("console.start")}
            </Button>
          )}
          {phase === "showing" && (
            <Button
              size="lg"
              variant="destructive"
              onClick={() => dispatch({ type: "intent.armBuzzer" })}
            >
              <Zap className="size-4 mr-2" />
              {t("console.arm")}
            </Button>
          )}
          {phase === "armed" && (
            <span className="text-rose-500 font-bold animate-pulse self-center">
              {t("console.waitingBuzz")}
            </span>
          )}
          {phase === "locked" && (
            <>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => dispatch({ type: "intent.judge", correct: true })}
              >
                <Check className="size-4 mr-2" />
                {t("console.correct")}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => dispatch({ type: "intent.judge", correct: false })}
              >
                <X className="size-4 mr-2" />
                {t("console.wrong")}
              </Button>
            </>
          )}
          {(phase === "showing" || phase === "armed" || phase === "locked") && (
            <Button size="lg" variant="outline" onClick={() => dispatch({ type: "intent.pass" })}>
              <SkipForward className="size-4 mr-2" />
              {t("console.pass")}
            </Button>
          )}
          {(phase === "judged" || phase === "passed") && (
            <Button size="lg" onClick={() => dispatch({ type: "intent.next" })}>
              <SkipForward className="size-4 mr-2" />
              {t("console.next")}
            </Button>
          )}
          {phase === "ended" && (
            <Badge variant="secondary" className="text-base px-3 py-1.5">
              {t("console.ended")}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Current question */}
      {question && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Q{state.currentQuestionIndex + 1}. {question.prompt}
              </CardTitle>
              <Badge>{question.contentType}</Badge>
            </div>
            <CardDescription>{t("console.answer")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <AnswerView question={question} />
            {question.explanation && (
              <p className="text-muted-foreground">💡 {question.explanation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scoreboard + Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("console.scoreboard")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg p-3 border-l-4"
                style={{ borderColor: team.color, backgroundColor: `${team.color}11` }}
              >
                <span className="font-medium">{team.name}</span>
                <span className="text-2xl font-bold tabular-nums">
                  {state.scores[team.id] ?? 0}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("console.players")}{" "}
              <span className="text-muted-foreground text-sm">({players.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-auto">
            {players.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("console.noPlayers")}</p>
            )}
            {players.map((p) => {
              const team = teams.find((tt) => tt.id === p.teamId);
              const cd = state.cooldowns[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded p-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: team?.color }}
                    />
                    <span className="font-medium truncate">{p.name}</span>
                    {cd > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {t("console.cooldown", { n: cd })}
                      </Badge>
                    )}
                  </div>
                  <select
                    value={p.teamId}
                    onChange={(e) =>
                      dispatch({
                        type: "intent.changeTeam",
                        playerId: p.id,
                        toTeamId: e.target.value,
                        actor: "host",
                      })
                    }
                    className="text-xs border rounded px-2 py-1 bg-background"
                  >
                    {teams.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function AnswerView({ question }: { question: ReturnType<typeof useCurrentQuestion> & object }) {
  if (question.contentType === "MCQ") {
    const answers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const labels = answers
      .map((aid) => question.choices.find((c) => c.id === aid)?.text ?? aid)
      .join(", ");
    return <p className="font-mono">✅ {labels}</p>;
  }
  if (question.contentType === "OX") {
    return <p className="font-mono text-2xl">✅ {question.answer}</p>;
  }
  if (question.contentType === "Short") {
    return <p className="font-mono">✅ {question.answer}</p>;
  }
  if (question.contentType === "Blank") {
    return <p className="font-mono">✅ {question.blanks.map((b) => b.answer).join(" / ")}</p>;
  }
  return null;
}
