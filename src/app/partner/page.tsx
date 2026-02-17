"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Upload,
  Search,
  ShoppingBag,
  BarChart3,
  Target,
  Zap,
  ShieldCheck,
  Layers,
  Wallet,
  Check,
  ArrowRight,
  Mail,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────── */

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <FadeIn className="mb-16 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-text/70">
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}

/* ─── NAV ──────────────────────────────────────────────── */

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ucOpen, setUcOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const useCaseLinks = [
    { href: "/uplan-engine/anwendungsfaelle/portfolio-rollout", label: "Portfolio-Rollout", sub: "50 Standorte parallel bewerten" },
    { href: "/uplan-engine/anwendungsfaelle/ankaufspruefung", label: "Ankaufsprüfung in 48h", sub: "Machbarkeit vor LOI prüfen" },
    { href: "/uplan-engine/anwendungsfaelle/serielle-planung", label: "Serielle Planung", sub: "Standards wiederverwenden" },
  ];

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50 border-b border-gray-border/60 bg-white/80 backdrop-blur-lg"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/uplan-engine/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <div className="relative" onMouseEnter={() => setUcOpen(true)} onMouseLeave={() => setUcOpen(false)}>
            <button className="flex items-center gap-1 transition hover:text-primary">
              Use Cases
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${ucOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {ucOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2"
                >
                  <div className="w-72 rounded-xl border border-gray-border bg-white p-2 shadow-xl">
                    {useCaseLinks.map((uc) => (
                      <a key={uc.href} href={uc.href} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-gray-bg group">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-primary">{uc.label}</div>
                          <div className="text-xs text-slate-text/50">{uc.sub}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/partner" className="font-semibold text-primary">Partner</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="mailto:hello@uplan-engine.de"
            className="hidden rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light sm:inline-flex"
          >
            Jetzt einreichen
          </a>
          <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-bg transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-border/40 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4 bg-white">
              <a href="/uplan-engine/" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Startseite</a>
              <a href="/uplan-engine/produkt" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Produkt</a>
              <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-text/40">Use Cases</div>
              {useCaseLinks.map((uc) => (
                <a key={uc.href} href={uc.href} className="rounded-lg px-3 py-2.5 pl-6 text-sm text-slate-text/80 hover:bg-gray-bg hover:text-primary transition" onClick={() => setMobileOpen(false)}>
                  {uc.label}
                </a>
              ))}
              <a href="/uplan-engine/technologie" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Technologie</a>
              <a href="/uplan-engine/partner" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Partner werden</a>
              <a href="mailto:hello@uplan-engine.de" className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-light transition" onClick={() => setMobileOpen(false)}>Jetzt einreichen</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── 1. HERO ──────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <p className="mb-4 text-sm font-semibold tracking-widest text-accent uppercase">
            Für Hersteller · Architekten · Planer
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Werden Sie Teil der Plattform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-text/70 md:text-xl">
            Ob modulare Gebäude oder genehmigte Baupläne — bringen Sie Ihre Produkte und Entwürfe auf U-Plan Engine und erreichen Sie tausende Projektentwickler.
          </p>
        </motion.div>
        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="mailto:hello@uplan-engine.de"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
          >
            <Mail className="h-5 w-5" /> Jetzt einreichen
          </a>
          <a
            href="#vorteile"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-border px-8 py-4 text-base font-semibold text-primary transition hover:border-primary/30 hover:bg-gray-bg"
          >
            Mehr erfahren <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
    </section>
  );
}

/* ─── 2. TWO-COLUMN TEASER ─────────────────────────────── */

const herstellerBullets = [
  "Ihr Gebäudekatalog vor tausenden Projektentwicklern",
  "Direkte Aufträge — vom Konzept zum Deal in Tagen",
  "Digitale Zwillinge Ihrer Module mit BIM-Daten",
  "Automatischer Match-Score zur B-Plan-Kompatibilität",
];

const planerBullets = [
  "Genehmigte Pläne als wiederverwendbare Vorlagen lizenzieren",
  "Passives Einkommen bei jeder Nutzung Ihres Entwurfs",
  "Serielle Wiederverwendung an dutzenden Standorten",
  "Volle Kontrolle über Konditionen & Exklusivität",
];

function AudienceTeaser() {
  return (
    <section className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <FadeIn>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm h-full flex flex-col">
              <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                Für Hersteller
              </span>
              <h3 className="text-xl font-bold text-primary">Modulhersteller & Systembauer</h3>
              <p className="mt-2 text-sm text-slate-text/70">
                GROPYUS, Nokera, ALHO und weitere — integrieren Sie Ihre seriellen Module und werden Sie zur ersten Wahl bei der Konzepterstellung.
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {herstellerBullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-text/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@uplan-engine.de?subject=Partnerschaft%20Hersteller"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
              >
                <Mail className="h-4 w-4" /> Katalog einreichen
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm h-full flex flex-col">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                Für Planer & Architekten
              </span>
              <h3 className="text-xl font-bold text-primary">Architekturbüros & Ingenieure</h3>
              <p className="mt-2 text-sm text-slate-text/70">
                Ihre genehmigten Entwürfe verdienen mehr als eine Schublade. Lizenzieren Sie Ihre Pläne und verdienen Sie bei jeder Nutzung.
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {planerBullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-text/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@uplan-engine.de?subject=Pläne%20lizenzieren"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                <Mail className="h-4 w-4" /> Pläne einreichen
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. SO FUNKTIONIERT'S ─────────────────────────────── */

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Katalog / Pläne hochladen",
    desc: "Laden Sie Ihre Gebäudemodule oder genehmigten Bauplanungen hoch. Wir digitalisieren und integrieren.",
  },
  {
    num: "02",
    icon: Search,
    title: "Entwickler entdecken Sie",
    desc: "Projektentwickler sehen Ihre Module und Pläne in der Konzeptstudie — mit Match-Score zur B-Plan-Kompatibilität.",
  },
  {
    num: "03",
    icon: ShoppingBag,
    title: "Aufträge & Lizenzgebühren",
    desc: "Wird Ihr Modul gewählt oder Ihr Plan genutzt, erhalten Sie den Auftrag bzw. die Lizenzgebühr. Vom Konzept zum Deal in Tagen.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="So funktioniert's" />
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <s.icon className="h-8 w-8 text-accent" />
                </div>
                <span className="mt-2 text-xs font-bold text-accent/60">{s.num}</span>
                <h3 className="mt-3 text-lg font-bold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. VORTEILE-GRID ─────────────────────────────────── */

const benefits = [
  { icon: BarChart3, title: "Sichtbarkeit", desc: "Ihr Katalog oder Ihre Pläne vor tausenden Projektentwicklern in ganz Deutschland." },
  { icon: Target, title: "Qualifizierte Leads", desc: "Nur Anfragen von Projekten, die zu Ihren Modulen oder Entwürfen passen." },
  { icon: Zap, title: "Schnellere Deals", desc: "Vom Konzept zum Auftrag in Tagen statt Monaten." },
  { icon: ShieldCheck, title: "Weniger Risiko", desc: "Bereits genehmigte Konzepte haben es beim nächsten Mal deutlich leichter." },
  { icon: Layers, title: "Serielle Wiederverwendung", desc: "Ein Entwurf kann an 50 Standorten stehen — mit standortspezifischen Anpassungen." },
  { icon: Wallet, title: "Fair vergütet", desc: "Transparentes Modell: Sie verdienen bei jeder Nutzung. Volle Kontrolle über Ihre Konditionen." },
];

function Benefits() {
  return (
    <section id="vorteile" className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Ihre Vorteile" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="rounded-2xl border border-gray-border bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <b.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-bold text-primary">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{b.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. WAS SIE EINREICHEN ────────────────────────────── */

const herstellerChecklist = [
  "Gebäude-Grundrisse (DWG/PDF)",
  "Technische Daten (Geschosse, Flächen, Energie)",
  "Historische Kosten / Richtpreise (€/m²)",
  "Rendering oder Foto (optional)",
  "BIM-Datei (optional)",
];

const planerChecklist = [
  "Genehmigte Bauanträge",
  "Ausführungspläne",
  "Grundrisse aller Geschosse",
  "Schnitte & Ansichten",
  "Statik & Tragwerk",
  "Brandschutzkonzept",
  "Energienachweis (EnEV/GEG)",
  "Optional: 3D/BIM-Modell",
];

function SubmitChecklist() {
  const [activeTab, setActiveTab] = useState<"hersteller" | "planer">("hersteller");

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Was Sie einreichen" />

        {/* Tabs */}
        <FadeIn className="mb-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-gray-border bg-gray-bg p-1">
            <button
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${activeTab === "hersteller" ? "bg-white text-primary shadow-sm" : "text-slate-text/60 hover:text-primary"}`}
              onClick={() => setActiveTab("hersteller")}
            >
              Für Hersteller
            </button>
            <button
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${activeTab === "planer" ? "bg-white text-primary shadow-sm" : "text-slate-text/60 hover:text-primary"}`}
              onClick={() => setActiveTab("planer")}
            >
              Für Planer & Architekten
            </button>
          </div>
        </FadeIn>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          <FadeIn>
            <ul className="space-y-4">
              {(activeTab === "hersteller" ? herstellerChecklist : planerChecklist).map((item, i) => (
                <motion.li
                  key={`${activeTab}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-base text-primary">{item}</span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-slate-text/70">
              {activeTab === "hersteller"
                ? "Wir digitalisieren, integrieren und pflegen — Sie lehnen sich zurück."
                : "Wir prüfen, digitalisieren und stellen Ihre Pläne qualitätsgesichert bereit."}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeTab === "hersteller" ? "/uplan-engine/images/pages/optimized/partner-factory.jpg" : "/uplan-engine/images/pages/optimized/lizenzen-replicate.jpg"}
              alt={activeTab === "hersteller" ? "Modulare Fertigung" : "Bauplanung lizenzieren"}
              className="w-full rounded-2xl shadow-lg"
              loading="lazy"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. LIZENZMODELLE (Für Planer) ────────────────────── */

const tiers = [
  {
    name: "Konzeptstudie",
    badge: null,
    desc: "Ihr Entwurf als Planungsgrundlage",
    features: ["Lizenzgebühr pro Nutzung"],
    price: "Individuell",
  },
  {
    name: "Mit Ausführungsplanung",
    badge: "⭐ Empfohlen",
    desc: "Komplette Planungsunterlagen für Nachbau",
    features: ["Höhere Lizenzgebühr + Planungshonorar"],
    price: "Individuell",
  },
  {
    name: "Exklusivlizenz",
    badge: null,
    desc: "Alleinige Nutzungsrechte pro Region",
    features: ["Individuelle Vergütung"],
    price: "Auf Anfrage",
  },
];

function Pricing() {
  return (
    <section className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Lizenzmodelle"
          subtitle="Drei Modelle für Planer & Architekten — ein Ziel: faire Vergütung für Ihre Arbeit."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((t, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition hover:shadow-md ${t.badge ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-gray-border bg-white"}`}>
                {t.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
                    {t.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-primary">{t.name}</h3>
                <p className="mt-2 text-sm text-slate-text/60">{t.desc}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {t.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-slate-text/70">
                      <Check className="h-4 w-4 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-border">
                  <span className="text-2xl font-extrabold text-primary">{t.price}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.4} className="mt-8 text-center">
          <p className="text-sm text-slate-text/50">
            Konditionen werden individuell im Partnervertrag festgelegt.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 7. CTA ───────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uplan-engine/images/pages/optimized/lizenzen-skyline.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Jetzt einreichen
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Ob Gebäudekatalog oder genehmigte Pläne — wir melden uns innerhalb von 48 Stunden.
          </p>
          <div className="mt-10">
            <a
              href="mailto:hello@uplan-engine.de"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
            >
              <Mail className="h-5 w-5" /> hello@uplan-engine.de
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-border bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </div>
        <p className="text-sm text-slate-text/50">Vom Flurstück zur Machbarkeitsentscheidung — in Minuten.</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-text/50">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/partner" className="transition hover:text-primary">Partner</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="mailto:hello@uplan-engine.de" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">© 2026 U-Plan Engine · Impressum · Datenschutz</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function PartnerPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AudienceTeaser />
        <HowItWorks />
        <Benefits />
        <SubmitChecklist />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
