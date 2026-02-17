"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LizenzenRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/uplan-engine/partner");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-text/50">Weiterleitung…</p>
    </div>
  );
}
