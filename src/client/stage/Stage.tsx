import { useCurrentQuestion, useMatchState } from "@/match/hooks";
import type { Question } from "@/schema";
import { useTranslation } from "react-i18next";

export default function Stage() {
  const state = useMatchState();
  const question = useCurrentQuestion();
  const { t } = useTranslation();

  const totalQuestions = state.quizSet.questions.length;
  const teams = state.quizSet.match.teams;

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <div className="text-sm uppercase tracking-widest text-slate-400">{t("stage.title")}</div>
        <div className="text-sm text-slate-400">
          {state.currentQuestionIndex >= 0
            ? t("stage.questionCounter", {
                current: state.currentQuestionIndex + 1,
                total: totalQuestions,
              })
            : t("stage.notStarted")}
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center gap-8 p-12">
        {state.questionPhase === "idle" && (
          <h1 className="text-5xl font-bold text-slate-300">{t("stage.waiting")}</h1>
        )}
        {state.questionPhase === "ended" && (
          <h1 className="text-6xl font-bold">{t("stage.ended")}</h1>
        )}
        {question && state.questionPhase !== "idle" && state.questionPhase !== "ended" && (
          <QuestionView state={state} question={question} />
        )}
      </section>

      <footer className="border-t border-slate-800 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-lg p-3 flex items-center justify-between"
              style={{ backgroundColor: `${team.color}22`, borderLeft: `4px solid ${team.color}` }}
            >
              <span className="font-semibold">{team.name}</span>
              <span className="text-2xl font-bold tabular-nums">{state.scores[team.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}

function QuestionView({
  state,
  question,
}: {
  state: ReturnType<typeof useMatchState>;
  question: Question;
}) {
  const { t } = useTranslation();
  const buzzedPlayer = state.buzzedPlayerId ? state.players[state.buzzedPlayerId] : null;
  const buzzedTeam = buzzedPlayer
    ? state.quizSet.match.teams.find((tt) => tt.id === buzzedPlayer.teamId)
    : null;

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-8">
      <div className="text-xs uppercase tracking-widest text-slate-500">
        {phaseLabel(state.questionPhase, t)}
      </div>

      <h1 className="text-5xl font-bold leading-tight text-center text-balance">
        {question.prompt}
      </h1>

      {question.contentType === "MCQ" && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl">
          {question.choices.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-slate-700 px-4 py-3 text-2xl bg-slate-900"
            >
              <span className="text-slate-500 mr-2 uppercase">{c.id}.</span>
              {c.text}
            </li>
          ))}
        </ul>
      )}

      {question.contentType === "OX" && (
        <div className="flex gap-6">
          <div className="size-32 rounded-full border-4 border-emerald-500 grid place-items-center text-6xl font-bold">
            O
          </div>
          <div className="size-32 rounded-full border-4 border-rose-500 grid place-items-center text-6xl font-bold">
            X
          </div>
        </div>
      )}

      {state.questionPhase === "armed" && (
        <div className="text-3xl font-bold text-rose-400 animate-pulse">{t("stage.armed")}</div>
      )}

      {state.questionPhase === "locked" && buzzedPlayer && buzzedTeam && (
        <div
          className="rounded-xl px-8 py-4 text-3xl font-bold"
          style={{ backgroundColor: buzzedTeam.color, color: "white" }}
        >
          {t("stage.locked", { name: buzzedPlayer.name, team: buzzedTeam.name })}
        </div>
      )}

      {state.questionPhase === "judged" && (
        <div className="text-3xl font-semibold text-emerald-400">{t("stage.correct")}</div>
      )}

      {state.questionPhase === "passed" && (
        <div className="text-3xl font-semibold text-slate-400">{t("stage.passed")}</div>
      )}
    </div>
  );
}

function phaseLabel(phase: string, t: (k: string) => string): string {
  switch (phase) {
    case "showing":
      return t("phase.showing");
    case "armed":
      return t("phase.armed");
    case "locked":
      return t("phase.locked");
    case "judged":
      return t("phase.judged");
    case "passed":
      return t("phase.passed");
    default:
      return "";
  }
}
