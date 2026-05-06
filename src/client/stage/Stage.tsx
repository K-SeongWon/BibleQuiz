import { useTranslation } from "react-i18next";

export default function Stage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-50 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">{t("stage.title")}</h1>
        <p className="text-slate-400">{t("stage.placeholder")}</p>
      </div>
    </main>
  );
}
