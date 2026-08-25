"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layer01Opening } from "./layers/layer-01-opening";
import { Layer02Flow } from "./layers/layer-02-flow";
import { Layer03Editorial } from "./layers/layer-03-editorial";
import { Layer04Hub } from "./layers/layer-04-hub";
import { Layer05Access } from "./layers/layer-05-access";

export function ImmersiveHome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Helper function to update intent pill active styling cleanly
      const setActivePill = (activeIndex: number) => {
        for (let i = 0; i < 4; i++) {
          const pill = document.getElementById(`intent-pill-${i}`);
          if (pill) {
            if (i === activeIndex) {
              pill.className = "intent-pill flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-300 border bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105 opacity-100 ring-1 ring-primary/40 font-semibold";
            } else {
              pill.className = "intent-pill flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-300 border bg-card-2/60 text-muted-foreground border-border/60 opacity-40 scale-100 font-normal";
            }
          }
        }
      };

      // =========================================================================
      // MASTER PINNED STAGE TIMELINE WITH MAGNETIC LABELS SNAPPING
      // =========================================================================
      const tlMaster = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          pin: canvasRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          snap: {
            snapTo: "labels", // Magnetic snapping to every resting state
            duration: { min: 0.3, max: 0.65 },
            delay: 0.04,
            ease: "power2.out",
          },
        },
      });

      if (prefersReducedMotion) {
        tlMaster
          .addLabel("opening")
          .to(".opening-hero-silent", { opacity: 0, duration: 1 })
          .to(".opening-intent-container", { opacity: 1, duration: 1 })
          .addLabel("intent")
          .to(".layer-01", { opacity: 0, duration: 1 })
          .to(".layer-02", { opacity: 1, duration: 1 })
          .addLabel("flow")
          .to(".layer-02", { opacity: 0, duration: 1 })
          .to(".layer-03", { opacity: 1, duration: 1 })
          .addLabel("editorial")
          .to(".layer-03", { opacity: 0, duration: 1 })
          .to(".layer-04", { opacity: 1, duration: 1 })
          .addLabel("hub")
          .to(".layer-04", { opacity: 0, duration: 1 })
          .to(".layer-05", { opacity: 1, duration: 1 })
          .addLabel("access");
        return;
      }

      // =========================================================================
      // 1. MOMENTO 01: SILENT OPENING -> INTENT MUTATION
      // =========================================================================
      tlMaster.addLabel("opening");

      tlMaster
        // Fade out silent hero
        .to(".opening-hero-silent", { opacity: 0, scale: 0.94, y: -25, duration: 1.0 })
        // Fade in intent container
        .to(".opening-intent-container", { opacity: 1, scale: 1, y: 0, duration: 1.0 }, "-=0.5")
        .call(() => setActivePill(0))
        .addLabel("intent-atender")
        .to({}, { duration: 1.8 }) // Generous resting period on "atender"

        // Word 0 (atender) -> Word 1 (vender)
        .to(".intent-word-0", { opacity: 0, y: -15, duration: 0.8, ease: "power2.inOut" })
        .to(".intent-word-1", { opacity: 1, y: 0, duration: 0.8, ease: "power2.inOut", onStart: () => setActivePill(1), onReverseComplete: () => setActivePill(0) }, "<")
        .addLabel("intent-vender")
        .to({}, { duration: 1.2 }) // Rest period on "vender"

        // Word 1 (vender) -> Word 2 (acompanhar)
        .to(".intent-word-1", { opacity: 0, y: -15, duration: 0.8, ease: "power2.inOut" })
        .to(".intent-word-2", { opacity: 1, y: 0, duration: 0.8, ease: "power2.inOut", onStart: () => setActivePill(2), onReverseComplete: () => setActivePill(1) }, "<")
        .addLabel("intent-acompanhar")
        .to({}, { duration: 1.2 }) // Rest period on "acompanhar"

        // Word 2 (acompanhar) -> Word 3 (automatizar)
        .to(".intent-word-2", { opacity: 0, y: -15, duration: 0.8, ease: "power2.inOut" })
        .to(".intent-word-3", { opacity: 1, y: 0, duration: 0.8, ease: "power2.inOut", onStart: () => setActivePill(3), onReverseComplete: () => setActivePill(2) }, "<")
        .addLabel("intent-automatizar")
        .to({}, { duration: 1.2 }) // Rest period on "automatizar"

        // =======================================================================
        // 2. MOMENTO 02: FLOW DEMONSTRATION
        // =======================================================================
        // Transition Layer 01 -> Layer 02
        .to(".layer-01", { opacity: 0, scale: 1.04, y: -25, duration: 1.2 })
        .to(".layer-02", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("flow-step-0")
        .to({}, { duration: 1.2 }) // Rest on Scene 0

        // Flow Scene 0 -> Scene 1
        .to(".flow-step-0", { opacity: 0.4, borderColor: "transparent", backgroundColor: "transparent", duration: 0.8 })
        .to(".flow-step-1", { opacity: 1, borderColor: "var(--primary)", backgroundColor: "var(--card-2)", duration: 0.8 }, "<")
        .to(".flow-scene-0", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 }, "<")
        .to(".flow-scene-1", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.3")
        .addLabel("flow-step-1")
        .to({}, { duration: 1.2 }) // Rest on Scene 1

        // Flow Scene 1 -> Scene 2
        .to(".flow-step-1", { opacity: 0.4, borderColor: "transparent", backgroundColor: "transparent", duration: 0.8 })
        .to(".flow-step-2", { opacity: 1, borderColor: "var(--primary)", backgroundColor: "var(--card-2)", duration: 0.8 }, "<")
        .to(".flow-scene-1", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 }, "<")
        .to(".flow-scene-2", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.3")
        .addLabel("flow-step-2")
        .to({}, { duration: 1.2 }) // Rest on Scene 2

        // Flow Scene 2 -> Scene 3
        .to(".flow-step-2", { opacity: 0.4, borderColor: "transparent", backgroundColor: "transparent", duration: 0.8 })
        .to(".flow-step-3", { opacity: 1, borderColor: "var(--primary)", backgroundColor: "var(--card-2)", duration: 0.8 }, "<")
        .to(".flow-scene-2", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 }, "<")
        .to(".flow-scene-3", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.3")
        .addLabel("flow-step-3")
        .to({}, { duration: 1.2 }) // Rest on Scene 3

        // Flow Scene 3 -> Scene 4
        .to(".flow-step-3", { opacity: 0.4, borderColor: "transparent", backgroundColor: "transparent", duration: 0.8 })
        .to(".flow-step-4", { opacity: 1, borderColor: "var(--primary)", backgroundColor: "var(--card-2)", duration: 0.8 }, "<")
        .to(".flow-scene-3", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 }, "<")
        .to(".flow-scene-4", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.3")
        .addLabel("flow-step-4")
        .to({}, { duration: 1.4 }) // Rest on Scene 4

        // =======================================================================
        // 3. MOMENTO 03: EDITORIAL SCENES
        // =======================================================================
        // Transition Layer 02 -> Layer 03
        .to(".layer-02", { opacity: 0, scale: 0.94, y: -20, duration: 1.2 })
        .to(".layer-03", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("editorial-contexto")
        .to({}, { duration: 1.4 }) // Rest on Scene 1 (Contexto)

        // Scene 1 (Contexto) -> Scene 2 (Colaboração)
        .to(".editorial-scene-1", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 })
        .to(".editorial-scene-2", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.2")
        .addLabel("editorial-colaboracao")
        .to({}, { duration: 1.4 }) // Rest on Scene 2 (Colaboração)

        // Scene 2 (Colaboração) -> Scene 3 (Processo)
        .to(".editorial-scene-2", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 })
        .to(".editorial-scene-3", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.2")
        .addLabel("editorial-processo")
        .to({}, { duration: 1.4 }) // Rest on Scene 3 (Processo)

        // Scene 3 (Processo) -> Scene 4 (Controle)
        .to(".editorial-scene-3", { opacity: 0, y: -20, scale: 0.96, pointerEvents: "none", duration: 0.8 })
        .to(".editorial-scene-4", { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.8 }, "-=0.2")
        .addLabel("editorial-controle")
        .to({}, { duration: 1.5 }) // Rest on Scene 4 (Controle)

        // =======================================================================
        // 4. MOMENTO 04: HUB CONVERGENCE & SIMPLIFICATION
        // =======================================================================
        // Transition Layer 03 -> Layer 04 (Reveals Satellites in Open Orbit around Pure Sphere)
        .to(".layer-03", { opacity: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-04", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("hub-orbit")
        .to({}, { duration: 1.4 }) // Rest on Open Orbit (Empty celestial sphere)

        // Magnetic Convergence: Satellites smoothly gravitate inward & dissolve completely
        .to(".hub-sat-1", { x: 140, y: 100, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" })
        .to(".hub-sat-2", { x: -140, y: 100, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" }, "<")
        .to(".hub-sat-3", { x: 160, y: 0, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" }, "<")
        .to(".hub-sat-4", { x: -160, y: 0, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" }, "<")
        .to(".hub-sat-5", { x: 130, y: -100, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" }, "<")
        .to(".hub-sat-6", { x: -130, y: -100, scale: 0.35, opacity: 0, duration: 1.8, ease: "power2.inOut" }, "<")
        .to(".hub-orbit-ring-outer", { scale: 0.6, opacity: 0.2, duration: 1.8 }, "<")
        .to(".hub-orbit-ring-inner", { scale: 0.5, opacity: 0.3, duration: 1.8 }, "<")
        
        // Sphere smoothly expands to double size (scale: 1.95) and dedicated glow illuminates
        .to(".hub-nucleus", { 
          scale: 1.95, 
          duration: 1.8, 
          ease: "power2.out" 
        }, "-=1.2")
        .to(".hub-nucleus-glow", { 
          opacity: 0.8, 
          scale: 2.2, 
          duration: 1.8, 
          ease: "power2.out" 
        }, "<")
        .to(".hub-nucleus-logo", { 
          opacity: 1, 
          scale: 1.15, 
          duration: 1.4, 
          ease: "power2.out" 
        }, "-=1.2")
        .addLabel("hub-converged")
        .to({}, { duration: 1.8 }) // Generous rest on Massive Charged Sphere with revealed pure Logo

        // Hub Convergence Dissolves -> Simplification Appears
        .to(".hub-convergence-container", { opacity: 0, scale: 0.92, duration: 1.2 })
        .to(".hub-simplification-container", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.6")
        .addLabel("hub-simplification")
        .to({}, { duration: 1.5 }) // Rest on Simplification

        // =======================================================================
        // 5. MOMENTO 05: SYSTEM ACCESS MONOLITH
        // =======================================================================
        .to(".layer-04", { opacity: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-05", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .fromTo(
          ".access-portal-card",
          { scale: 0.92, y: 30, opacity: 0.4 },
          { scale: 1, y: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
          "-=0.8"
        )
        .addLabel("access-portal")
        .to({}, { duration: 1.5 }); // Rest on Access portal
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="master-experience-wrapper relative w-full bg-background min-h-[900vh]"
    >
      {/* Unified Master Stage Canvas (Pinned by ScrollTrigger) */}
      <div 
        ref={canvasRef}
        className="master-stage-canvas sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden flex items-center justify-center pointer-events-none"
      >
        <Layer01Opening />
        <Layer02Flow />
        <Layer03Editorial />
        <Layer04Hub />
        <Layer05Access />
      </div>
    </div>
  );
}
