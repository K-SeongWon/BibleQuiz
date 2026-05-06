import { useTranslation } from "react-i18next";

export default function Pad() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{t("pad.title")}</h1>
      <p className="text-muted-foreground">{t("pad.placeholder")}</p>
    </main>
  );
}
