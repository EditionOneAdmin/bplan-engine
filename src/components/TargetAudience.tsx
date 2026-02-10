"use client";

import FadeIn from "./FadeIn";
import { Building2, Ruler, Pencil, Wrench, ShieldCheck } from "lucide-react";

const roles = [
  { icon: Building2, title: "Projektentwicklung", desc: "Machbarkeit & Risiko auf Knopfdruck bewerten. Schnellere Ankaufsentscheidungen." },
  { icon: Ruler, title: "Projektleitung Planung", desc: "Vollständigkeit sicherstellen. Keine Nachforderungen mehr übersehen." },
  { icon: Pencil, title: "Entwurfsverfasser", desc: "Varianten prüfen & freigeben. Compliance transparent nachvollziehen." },
  { icon: Wrench, title: "BIM / CAD", desc: "Gebäudestandards verwalten und projektübergreifend wiederverwenden." },
  { icon: ShieldCheck, title: "Compliance / Revision", desc: "Lückenloser Audit-Trail. Jede Entscheidung dokumentiert und nachweisbar." },
];

export default function TargetAudience() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
            Gebaut für Ihr Team.
          </h2>
          <p className="mt-4 text-lg text-slate-text/70 text-center max-w-2xl mx-auto">
            Jede Rolle profitiert — von der ersten Machbarkeitsprüfung bis zur finalen Einreichung.
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
          {roles.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <div className="bg-white rounded-2xl border border-gray-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mx-auto">
                  <r.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-primary">{r.title}</h3>
                <p className="mt-2 text-xs text-slate-text/60 leading-relaxed">{r.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
