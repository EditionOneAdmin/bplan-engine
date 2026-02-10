"use client";

import { ScanLine, FileCode, Layers, PackageCheck } from "lucide-react";
import FadeIn from "./FadeIn";

const steps = [
  {
    icon: ScanLine,
    title: "SiteScan",
    desc: "Grundstück & Kontext erfassen — Geometrie, Grenzen, Umfeld automatisch analysiert.",
  },
  {
    icon: FileCode,
    title: "RuleCompiler",
    desc: "B-Plan, Satzungen & LBO in prüfbare Constraints übersetzen.",
  },
  {
    icon: Layers,
    title: "PlanGen",
    desc: "Parametrische Varianten generieren — maximal, standard, risikoarm.",
  },
  {
    icon: PackageCheck,
    title: "SubmitPack",
    desc: "Dokumentenpaket, Checklisten & Vollständigkeitsprüfung zusammenstellen.",
  },
];

export default function HowItWorks() {
  return (
    <section id="pipeline" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center tracking-tight">
            Vier Schritte zur Genehmigungsreife.
          </h2>
        </FadeIn>
        <div className="mt-16 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30" />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6 relative z-10">
                    <step.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="text-xs font-semibold text-accent mb-1">Schritt {i + 1}</div>
                  <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-text/70 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
