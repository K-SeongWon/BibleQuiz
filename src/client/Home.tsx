import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">{t("app.title")}</h1>
      <p className="text-muted-foreground text-center max-w-prose">{t("app.tagline")}</p>
      <nav className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/stage"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
        >
          {t("nav.stage")}
        </Link>
        <Link
          to="/console"
          className="rounded-lg bg-secondary text-secondary-foreground px-4 py-2 hover:opacity-90"
        >
          {t("nav.console")}
        </Link>
        <Link
          to="/pad"
          className="rounded-lg bg-accent text-accent-foreground px-4 py-2 hover:opacity-90 border"
        >
          {t("nav.pad")}
        </Link>
      </nav>
      <p className="text-xs text-muted-foreground">{t("common.version")}</p>
    </main>
  );
}
