import React from "react";
import { ImmersiveHome } from "@/components/home/immersive-home";
import { FloatingExperienceNav } from "@/components/home/floating-experience-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "FlowHub — Fazer o extraordinário parecer natural",
  description: "Uma experiência contínua e integrada onde atendimento, equipe, inteligência, funis e processos convergem sem atrito no WhatsApp.",
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary-soft selection:text-primary relative">
      {/* Floating Persistent Navigation */}
      <FloatingExperienceNav />

      {/* Continuous Scroll-Driven Experience */}
      <main className="flex-1 w-full">
        <ImmersiveHome />
      </main>

      {/* Institutional Legal Footer */}
      <PublicFooter />
    </div>
  );
}
