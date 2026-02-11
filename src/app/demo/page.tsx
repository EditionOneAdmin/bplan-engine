import type { Metadata } from "next";
import DemoApp from "./DemoApp";

export const metadata: Metadata = {
  title: "Interaktive Demo — B-Plan Engine",
  description: "Bebauungsplan-Cockpit: Konzepterstellung in Echtzeit",
};

export default function DemoPage() {
  return <DemoApp />;
}
