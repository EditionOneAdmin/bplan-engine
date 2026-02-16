"use client";

import FadeIn from "./FadeIn";

function VariantenMockup() {
  const variants = [
    { name: "Variante A", label: "Maximal", geschosse: 5, we: 24, grz: "0.4", gfz: "1.8", stell: 28, color: "border-blue-200 bg-blue-50/30" },
    { name: "Variante B", label: "Standard", geschosse: 4, we: 18, grz: "0.35", gfz: "1.4", stell: 22, color: "border-teal-200 bg-teal-50/30" },
    { name: "Variante C", label: "Risikoarm", geschosse: 3, we: 12, grz: "0.3", gfz: "1.0", stell: 16, color: "border-emerald-200 bg-emerald-50/30" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="ml-2 text-xs text-slate-text/40 font-medium">Variantenvergleich</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {variants.map((v) => (
          <div key={v.name} className={`rounded-xl border ${v.color} p-4`}>
            <div className="text-xs font-bold text-primary">{v.name}</div>
            <div className="text-[10px] text-slate-text/50 mb-3">{v.label}</div>
            <div className="space-y-1.5 text-xs text-slate-text/70">
              <div className="flex justify-between"><span>Geschosse</span><span className="font-semibold text-primary">{v.geschosse}</span></div>
              <div className="flex justify-between"><span>WE</span><span className="font-semibold text-primary">{v.we}</span></div>
              <div className="flex justify-between"><span>GRZ</span><span className="font-semibold text-primary">{v.grz}</span></div>
              <div className="flex justify-between"><span>GFZ</span><span className="font-semibold text-primary">{v.gfz}</span></div>
              <div className="flex justify-between"><span>Stellplätze</span><span className="font-semibold text-primary">{v.stell}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceMockup() {
  const rules = [
    { rule: "§ 19 BauNVO — GRZ max. 0.4", status: "green", text: "Eingehalten (0.35)" },
    { rule: "§ 20 BauNVO — GFZ max. 1.6", status: "green", text: "Eingehalten (1.4)" },
    { rule: "§ 6 LBO — Abstandsflächen", status: "yellow", text: "Grenzwert: 3.0m, Ist: 3.1m" },
    { rule: "§ 47 LBO — Stellplätze", status: "red", text: "22 benötigt, 18 nachgewiesen" },
    { rule: "B-Plan §4 — Dachform", status: "green", text: "Flachdach zulässig" },
  ];

  const colors: Record<string, string> = {
    green: "bg-emerald-400",
    yellow: "bg-amber-400",
    red: "bg-red-400",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="ml-2 text-xs text-slate-text/40 font-medium">Compliance Report</span>
      </div>
      <div className="space-y-2.5">
        {rules.map((r) => (
          <div key={r.rule} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <div className={`w-2.5 h-2.5 rounded-full ${colors[r.status]} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-primary truncate">{r.rule}</div>
              <div className="text-[10px] text-slate-text/50">{r.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitPackMockup() {
  const items = [
    { name: "📁 Bauantrag_Unterlagen/", sub: null },
    { name: "  📄 Lageplan_1-500.pdf", sub: "Aktualisiert" },
    { name: "  📄 Grundrisse_EG-OG.pdf", sub: "Vollständig" },
    { name: "  📄 Schnitte_A-A_B-B.pdf", sub: "Vollständig" },
    { name: "  📄 Ansichten_Nord-Süd.pdf", sub: "Vollständig" },
    { name: "📁 Nachweise/", sub: null },
    { name: "  📄 Stellplatznachweis.pdf", sub: "⚠️ Prüfen" },
    { name: "  📄 Abstandsflaechen.pdf", sub: "Vollständig" },
    { name: "📋 Checkliste_Kommune_Berlin.pdf", sub: "18/20 erfüllt" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="ml-2 text-xs text-slate-text/40 font-medium">SubmitPack</span>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <span className="text-xs font-mono text-slate-text/80">{item.name}</span>
            {item.sub && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                item.sub.includes("⚠️") ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {item.sub}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-32 px-6" id="produkt">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
            Was Sie erhalten.
          </h2>
          <p className="mt-4 text-lg text-slate-text/70 text-center max-w-2xl mx-auto">
            Drei Deliverables pro Projekt — sofort nutzbar, vollständig dokumentiert.
          </p>
        </FadeIn>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <FadeIn delay={0}>
            <div>
              <VariantenMockup />
              <h3 className="mt-4 text-lg font-bold text-primary">Variantenvergleich</h3>
              <p className="mt-1 text-sm text-slate-text/60">Maximal, Standard und Risikoarm — mit allen Kennzahlen auf einen Blick.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div>
              <ComplianceMockup />
              <h3 className="mt-4 text-lg font-bold text-primary">Compliance Report</h3>
              <p className="mt-1 text-sm text-slate-text/60">Ampel-System mit Quellen, Bewertung und Empfehlung. Nachvollziehbar. Auditierbar.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div>
              <SubmitPackMockup />
              <h3 className="mt-4 text-lg font-bold text-primary">SubmitPack</h3>
              <p className="mt-1 text-sm text-slate-text/60">Strukturierte Ordner, Checkliste je Kommune-Profil. Übersichtlich. Handlungsorientiert.</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
