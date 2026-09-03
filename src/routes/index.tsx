import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareBalance — Équilibre de charge des équipes soignantes" },
      {
        name: "description",
        content:
          "CareBalance aide les équipes soignantes à mesurer, répartir et alléger la charge de travail : journée, patients, travail invisible, prévisions et simulations.",
      },
      {
        property: "og:title",
        content: "CareBalance — Équilibre de charge des équipes soignantes",
      },
      {
        property: "og:description",
        content:
          "Mesurez et rééquilibrez la charge de travail de vos équipes soignantes, rendez visible le travail invisible et anticipez les tensions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center text-brand-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <App />
    </ClientOnly>
  );
}
