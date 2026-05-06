import { useTranslation } from "react-i18next";

export default function Console() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh p-6">
      <h1 className="text-3xl font-bold mb-4">{t("console.title")}</h1>
      <p className="text-muted-foreground">{t("console.placeholder")}</p>
    </main>
  );
}
