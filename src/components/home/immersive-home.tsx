"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layer01Opening } from "./layers/layer-01-opening";
import { Layer02Flow } from "./layers/layer-02-flow";
import { Layer03Editorial } from "./layers/layer-03-editorial";
import { Layer04Hub } from "./layers/layer-04-hub";
import { Layer05Access } from "./layers/layer-05-access";

// Tempos de repouso de cada momento, em unidades da timeline. Extraídos para
// constantes porque a coreografia é uma sequência regular: descrevê-la como
// dado deixa o ritmo legível e evita blocos repetidos que divergem em silêncio.
const INTENT_WORDS = ["atender", "vender", "acompanhar", "automatizar"];
const INTENT_RESTS = [1.8, 1.2, 1.2, 1.2];
const FLOW_RESTS = [1.2, 1.2, 1.2, 1.2, 1.4];
const EDITORIAL_LABELS = ["contexto", "colaboracao", "processo", "controle"];
const EDITORIAL_RESTS = [1.4, 1.4, 1.4, 1.5];

const SATELLITE_TARGETS = [
  { x: 140, y: 100 },
  { x: -140, y: 100 },
  { x: 160, y: 0 },
  { x: -160, y: 0 },
  { x: 130, y: -100 },
  { x: -130, y: -100 },
];

export function ImmersiveHome() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Navegadores móveis redimensionam a viewport quando a barra de endereço
    // aparece ou some. Sem isto o ScrollTrigger recalcula no meio do gesto e o
    // palco salta — o defeito que se lê como travamento no celular.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tl = gsap.timeline({
        // `ease: "none"` em tudo. Dentro de uma timeline presa ao scroll,
        // qualquer easing desacopla a velocidade da imagem da velocidade do
        // dedo: quem rola em ritmo constante vê o elemento acelerar e frear
        // sozinho, e cada emenda entre tweens vira uma quebra de velocidade.
        // Encadeado, isso é pulso — a origem principal da falta de fluidez.
        // A suavidade de entrada e saída vem dos overlaps, não das curvas.
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          // `scrub` é o atraso com que o palco alcança a posição de rolagem.
          // Ele se soma ao tempo do snap: por mais rápido que o ímã puxe a
          // página, a cena só chega `scrub` segundos depois. Era o que fazia o
          // próximo elemento parecer demorar a entrar, mesmo com o snap curto.
          scrub: 0.4,
          invalidateOnRefresh: true,
          // Sem `pin`: o palco é sustentado por `position: sticky`, resolvido
          // pelo compositor, sem a troca fixed/absolute que produz um salto de
          // um quadro nas bordas do trecho preso.
          //
          // O snap magnético é requisito, não enfeite. Cada rótulo é um estado
          // de repouso legível; sem ele a rolagem pode parar no meio de uma
          // dissolvência e a página fica em meio-estado — dois verbos impressos
          // um sobre o outro, duas camadas visíveis ao mesmo tempo. É o que
          // garante `FH-24.05` e `FH-14.07`: o conteúdo tem de ser legível em
          // qualquer ponto onde o usuário pare.
          //
          // Ele voltou a se comportar porque o conflito que o fazia tremer era
          // externo: `scroll-behavior: smooth` no `html` re-animava cada escrita
          // de posição feita aqui. Desligado para esta página em globals.css.
          //
          // Três botões governam a sensação do ímã, do mais perceptível ao
          // menos: `scrub` acima (o quanto a cena atrasa em relação à rolagem),
          // `duration` (quanto tempo o puxão leva) e `delay` (quanto o ímã
          // espera depois que o dedo para). `power3.out` sai forte e assenta
          // macio — é o que dá a leitura de atração, e não de deslize.
          snap: {
            snapTo: "labels",
            duration: { min: 0.15, max: 0.35 },
            delay: 0.02,
            ease: "power3.out",
          },
        },
      });

      if (prefersReducedMotion) {
        tl.addLabel("opening")
          .to(".opening-hero-silent", { autoAlpha: 0 })
          .to(".opening-intent-container", { autoAlpha: 1 })
          .addLabel("intent")
          .to(".layer-01", { autoAlpha: 0 })
          .to(".layer-02", { autoAlpha: 1 })
          .addLabel("flow")
          .to(".layer-02", { autoAlpha: 0 })
          .to(".layer-03", { autoAlpha: 1 })
          .addLabel("editorial")
          .to(".layer-03", { autoAlpha: 0 })
          .to(".layer-04", { autoAlpha: 1 })
          .addLabel("hub")
          .to(".layer-04", { autoAlpha: 0 })
          .to(".layer-05", { autoAlpha: 1 })
          .addLabel("access");
        return;
      }

      // =====================================================================
      // MOMENTO 01 — ABERTURA SILENCIOSA -> MUTAÇÃO DE INTENÇÃO
      // =====================================================================
      tl.addLabel("opening")
        .to(".opening-hero-silent", { autoAlpha: 0, scale: 0.94, y: -25, duration: 1.0 })
        .to(".opening-intent-container", { autoAlpha: 1, scale: 1, y: 0, duration: 1.0 }, "-=0.5")
        .addLabel(`intent-${INTENT_WORDS[0]}`)
        .to({}, { duration: INTENT_RESTS[0] });

      // Cada troca de verbo acende a pílula correspondente. A pílula tem duas
      // faces empilhadas que se cruzam em opacidade: antes o estado ativo era
      // reescrito via `className` dentro de um `.call()`, o que disparava
      // recálculo de estilo e uma transição CSS de 300ms correndo por fora do
      // scrub — dois relógios animando o mesmo elemento.
      for (let i = 0; i < INTENT_WORDS.length - 1; i++) {
        const next = i + 1;
        tl.to(`.intent-word-${i}`, { autoAlpha: 0, y: -15, duration: 0.8 })
          .to(`.intent-word-${next}`, { autoAlpha: 1, y: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-on-${i}`, { opacity: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-off-${i}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-${i}`, { opacity: 0.4, scale: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-on-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-off-${next}`, { opacity: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-${next}`, { opacity: 1, scale: 1.05, duration: 0.8 }, "<")
          .addLabel(`intent-${INTENT_WORDS[next]}`)
          .to({}, { duration: INTENT_RESTS[next] });
      }

      // =====================================================================
      // MOMENTO 02 — DEMONSTRAÇÃO DO FLUXO
      // =====================================================================
      tl.to(".layer-01", { autoAlpha: 0, scale: 1.04, y: -25, duration: 1.2 })
        .to(".layer-02", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("flow-step-0")
        .to({}, { duration: FLOW_RESTS[0] });

      // O realce da etapa ativa mora numa sublayer própria e só a opacidade é
      // animada. Antes eram `borderColor` e `backgroundColor` mudando a cada
      // quadro: propriedades que forçam repintura da lista inteira durante todo
      // o gesto, exatamente onde a taxa de quadros precisava sobrar.
      for (let i = 0; i < FLOW_RESTS.length - 1; i++) {
        const next = i + 1;
        tl.to(`.flow-step-bg-${i}`, { opacity: 0, duration: 0.8 })
          .to(`.flow-step-${i}`, { opacity: 0.4, duration: 0.8 }, "<")
          .to(`.flow-step-bg-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.flow-step-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.flow-scene-${i}`, { autoAlpha: 0, y: -20, scale: 0.96, duration: 0.8 }, "<")
          .to(`.flow-scene-${next}`, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.3")
          .addLabel(`flow-step-${next}`)
          .to({}, { duration: FLOW_RESTS[next] });
      }

      // =====================================================================
      // MOMENTO 03 — CENAS EDITORIAIS
      // =====================================================================
      tl.to(".layer-02", { autoAlpha: 0, scale: 0.94, y: -20, duration: 1.2 })
        .to(".layer-03", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel(`editorial-${EDITORIAL_LABELS[0]}`)
        .to({}, { duration: EDITORIAL_RESTS[0] });

      for (let i = 1; i < EDITORIAL_LABELS.length; i++) {
        tl.to(`.editorial-scene-${i}`, { autoAlpha: 0, y: -20, scale: 0.96, duration: 0.8 })
          .to(`.editorial-scene-${i + 1}`, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.2")
          .addLabel(`editorial-${EDITORIAL_LABELS[i]}`)
          .to({}, { duration: EDITORIAL_RESTS[i] });
      }

      // =====================================================================
      // MOMENTO 04 — CONVERGÊNCIA DO HUB E SÍNTESE
      // =====================================================================
      tl.to(".layer-03", { autoAlpha: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-04", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("hub-orbit")
        .to({}, { duration: 1.4 });

      // Convergência magnética: os satélites gravitam para dentro e dissolvem.
      SATELLITE_TARGETS.forEach((target, idx) => {
        tl.to(
          `.hub-sat-${idx + 1}`,
          { ...target, scale: 0.35, autoAlpha: 0, duration: 1.8 },
          idx === 0 ? ">" : "<"
        );
      });

      tl.to(".hub-orbit-ring-outer", { scale: 0.6, opacity: 0.2, duration: 1.8 }, "<")
        .to(".hub-orbit-ring-inner", { scale: 0.5, opacity: 0.3, duration: 1.8 }, "<")
        .to(".hub-nucleus", { scale: 1.95, duration: 1.8 }, "-=1.2")
        .to(".hub-nucleus-glow", { autoAlpha: 0.8, scale: 2.2, duration: 1.8 }, "<")
        // O aro acende junto do halo: a luz do núcleo é o efeito visível de ter
        // recebido as seis órbitas, e não um estado que ele já tinha.
        .to(".hub-nucleus-rim", { opacity: 1, duration: 1.8 }, "<")
        .to(".hub-nucleus-logo", { autoAlpha: 1, scale: 1.15, duration: 1.4 }, "-=1.2")
        .addLabel("hub-converged")
        .to({}, { duration: 1.8 })

        .to(".hub-convergence-container", { autoAlpha: 0, scale: 0.92, duration: 1.2 })
        .to(".hub-simplification-container", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.6")
        .addLabel("hub-simplification")
        .to({}, { duration: 1.5 });

      // =====================================================================
      // MOMENTO 05 — MONÓLITO DE ACESSO
      // =====================================================================
      tl.to(".layer-04", { autoAlpha: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-05", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .fromTo(
          ".access-portal-card",
          { scale: 0.92, y: 30, opacity: 0.4 },
          { scale: 1, y: 0, opacity: 1, duration: 1.2 },
          "-=0.8"
        )
        .addLabel("access-portal")
        .to({}, { duration: 1.5 });
    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.config({ ignoreMobileResize: false });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="master-experience-wrapper relative w-full bg-background min-h-[900svh]"
    >
      {/*
        Palco único, sustentado por `sticky`. A altura usa `svh` em vez de `dvh`
        porque a unidade dinâmica muda de valor enquanto a barra do navegador
        móvel se move: o palco redimensionaria durante o próprio gesto.
      */}
      <div className="master-stage-canvas sticky top-0 left-0 w-full h-[100svh] overflow-hidden flex items-center justify-center pointer-events-none">
        <Layer01Opening />
        <Layer02Flow />
        <Layer03Editorial />
        <Layer04Hub />
        <Layer05Access />
      </div>
    </div>
  );
}
