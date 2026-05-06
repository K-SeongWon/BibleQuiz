import { ThemeToggle } from "@/client/shared/components/theme-toggle";
import { Badge } from "@/client/shared/components/ui/badge";
import { Button } from "@/client/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/shared/components/ui/card";
import { Github, Monitor, Sliders, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();

  const surfaces = [
    { to: "/stage", icon: Monitor, key: "stage" as const },
    { to: "/console", icon: Sliders, key: "console" as const },
    { to: "/pad", icon: Smartphone, key: "pad" as const },
  ];

  return (
    <main className="min-h-dvh">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="font-bold">{t("app.title")}</span>
          <Badge variant="secondary">{t("common.version")}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="GitHub">
            <a href="https://github.com/K-SeongWon/BibleQuiz" target="_blank" rel="noreferrer">
              <Github className="size-5" />
            </a>
          </Button>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center gap-3 px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight">{t("app.title")}</h1>
        <p className="text-muted-foreground max-w-prose text-balance">{t("app.tagline")}</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto px-6 pb-16">
        {surfaces.map(({ to, icon: Icon, key }) => (
          <Card key={to} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Icon className="size-8 mb-2 text-muted-foreground" />
              <CardTitle>{t(`nav.${key}`)}</CardTitle>
              <CardDescription>{t(`${key}.placeholder`)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={to}>{t("home.open")}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
