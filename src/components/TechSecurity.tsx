"use client";

import FadeIn from "./FadeIn";
import { Lock, GitBranch, Users, Plug, FileDown, ClipboardList } from "lucide-react";

const features = [
  { icon: Lock, title: "DSGVO-konform", desc: "Daten bleiben in Deutschland. Hosting auf deutschen Servern." },
  { icon: GitBranch, title: "Versionierung", desc: "Jede Änderung nachvollziehbar. Parameter, Dokumente und Ergebnisse historisiert." },
  { icon: Users, title: "Rollen & Rechte", desc: "Granulare Zugriffskontrolle. Wer darf was sehen, bearbeiten, freigeben." },
  { icon: Plug, title: "API-first", desc: "Nahtlose Integration in bestehende Systeme. RESTful API für alle Module." },
  { icon: FileDown, title: "Strukturierte Exporte", desc: "PDF, IFC, BCF — in den Formaten, die Ihr Team bereits nutzt." },
  { icon: ClipboardList, title: "Audit-Trail", desc: "Compliance lückenlos nachweisbar. Jede Entscheidung mit Zeitstempel und Quelle." },
];

export default function TechSecurity() {
  return (
    <section className="py-20 md:py-32 px-6 bg-gray-bg">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
            Enterprise-ready. Von Tag eins.
          </h2>
        </FadeIn>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="bg-white rounded-2xl border border-gray-border p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-bold text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-text/60 leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
