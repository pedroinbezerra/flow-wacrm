import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { HomeHero } from "@/components/home/home-hero";
import { HomeFlowSection } from "@/components/home/home-flow-section";
import { HomeHubSection } from "@/components/home/home-hub-section";
import { HomeTrustControl } from "@/components/home/home-trust-control";
import { HomeCtaSection } from "@/components/home/home-cta-section";

export const metadata = {
  title: "FlowHub — Fazer o extraordinário parecer natural",
  description: "O FlowHub conecta sua equipe, conversas, assistentes de IA, pipelines e automações em um único ambiente onde tudo simplesmente flui.",
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary-soft selection:text-primary">
      {/* Sticky Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
            <FlowLogo height={44} />
          </Link>
          <PublicHeaderNav />
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        <HomeHero />
        <HomeFlowSection />
        <HomeHubSection />
        <HomeTrustControl />
        <HomeCtaSection />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
