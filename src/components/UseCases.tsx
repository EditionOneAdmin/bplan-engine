"use client";

import FadeIn from "./FadeIn";
import { Building2, Clock, Repeat } from "lucide-react";

const cases = [
  {
    icon: Building2,
    title: "Portfolio-Rollout",
    desc: "Bewerten Sie 50 Standorte in der Zeit, die Sie heute für 5 brauchen. Gleiche Standards, konsistente Qualität.",
  },
  {
    icon: Clock,
    title: "Ankaufsprüfung in 48h",
    desc: "Machbarkeit prüfen bevor der Letter of Intent unterschrieben ist. Fundierte Entscheidung statt Bauchgefühl.",
  },
  {
    icon: Repeat,
    title: "Serielle Planung mit Standards",
    desc: "Bewährte Gebäudestandards wiederverwenden. Weniger Entwurfsaufwand, schnellere Freigaben.",
  },
];

export default function UseCases() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center tracking-tight">
            Für jeden Anwendungsfall.
          </h2>
        </FadeIn>
        <div className="mt-16 space-y-8">
          {cases.map((c, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
                    <c.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">{c.title}</h3>
                  <p className="mt-3 text-slate-text/70 leading-relaxed max-w-md">{c.desc}</p>
                </div>
                <div className="flex-1 w-full h-48 bg-gray-bg rounded-2xl border border-gray-border flex items-center justify-center">
                  <div className="text-sm text-slate-text/30 font-medium">Illustration</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
