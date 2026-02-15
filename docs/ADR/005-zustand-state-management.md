# ADR-005: Zustand für State Management

**Status:** Accepted

## Kontext

Die Anwendung hat zwei getrennte State-Bereiche: den Admin-Bereich (CRUD für Gebäude/Hersteller) und den Demo-Konfigurator (Baufelder, Platzierungen, Filter). Der Admin-State muss in localStorage persistiert werden.

## Entscheidung

Wir verwenden **Zustand** für den Admin-Store. Der Demo-State bleibt als lokaler React-State in `DemoApp.tsx`.

**Gründe:**

1. **Minimaler Boilerplate:** Zustand braucht keinen Provider, keine Reducer, keine Actions — ein `create()`-Call genügt.
2. **localStorage-Integration:** Einfaches Read/Write Pattern ohne Middleware. `hydrate()` wird manuell in `useEffect` aufgerufen.
3. **Kleine Bundle-Size:** Zustand ist ~1 KB gzipped. Redux Toolkit wäre ~10x größer.
4. **TypeScript-First:** Zustand hat exzellente TypeScript-Unterstützung ohne zusätzliche Typen-Definitionen.
5. **Kein Over-Engineering:** Für den Demo-State reicht React `useState` + Prop-Drilling. Zustand wird nur dort eingesetzt wo es einen echten Mehrwert hat (Admin-Persistenz).

## Konsequenzen

- ✅ Minimaler Code, schnell verständlich
- ✅ Kein Context-Provider-Wrapping nötig
- ✅ Store kann außerhalb von React gelesen werden (`useStore.getState()`)
- ⚠️ Hydrate-Pattern nötig wegen SSR/SSG (Store startet leer, `hydrate()` in `useEffect`)
- ⚠️ Demo-State ist nicht in Zustand — bei wachsender Komplexität ggf. migrieren
