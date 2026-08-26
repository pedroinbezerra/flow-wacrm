"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Layer01Opening } from "./layers/layer-01-opening";
import { Layer02Flow } from "./layers/layer-02-flow";
import { Layer03Editorial } from "./layers/layer-03-editorial";
import { Layer04Hub } from "./layers/layer-04-hub";
import { Layer05Access } from "./layers/layer-05-access";
import { STAGE_STEPS, publishStageIndex, registerStageNavigator } from "./experience-stage";

/**
 * Duração de um passo, em segundos. É o único tempo que existe na experiência:
 * toda transição custa isto, da troca de um verbo à troca de uma camada inteira,
 * porque o que varia é a distância percorrida na timeline, não o relógio.
 */
const STEP_DURATION = 0.55;
const STEP_EASE = "power2.inOut";

const INTENT_WORDS = ["atender", "vender", "acompanhar", "automatizar"];
const FLOW_SCENES = 5;
const EDITORIAL_LABELS = ["contexto", "colaboracao", "processo", "controle"];

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
    gsap.registerPlugin(Observer);

    // A experiência começa no primeiro passo, sempre. Instantâneo de propósito:
    // uma rolagem suave aqui animaria a página antes de o palco existir.
    window.scrollTo({ top: 0, behavior: "instant" });

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // =====================================================================
      // A COREOGRAFIA
      //
      // A timeline é construída pausada e nunca é ligada à posição da rolagem.
      // Ela não tem mais períodos de repouso entre os estados: repouso, agora,
      // é simplesmente o usuário não fazer nada. Cada rótulo fica exatamente no
      // fim de uma transição, e o passo seguinte começa no quadro seguinte —
      // não há tempo morto para atravessar entre um elemento e o próximo.
      //
      // Os tweens seguem com `ease: "none"`; quem carrega a curva é o tween que
      // move a agulha da timeline, em `goToStep`. Assim a aceleração é a mesma
      // para toda transição, independente do quanto ela percorre aqui dentro.
      // =====================================================================
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } });

      // --- MOMENTO 01 — abertura silenciosa -> mutação de intenção ---------
      tl.addLabel("opening")
        .to(".opening-hero-silent", { opacity: 0, scale: 0.94, y: -25, duration: 1.0 })
        .to(".opening-intent-container", { opacity: 1, scale: 1, y: 0, duration: 1.0 }, "-=0.5")
        .addLabel(`intent-${INTENT_WORDS[0]}`);

      // Cada troca de verbo acende a pílula correspondente. As duas faces da
      // pílula ficam empilhadas na mesma célula e se cruzam em opacidade.
      for (let i = 0; i < INTENT_WORDS.length - 1; i++) {
        const next = i + 1;
        tl.to(`.intent-word-${i}`, { opacity: 0, y: -15, duration: 0.8 })
          .to(`.intent-word-${next}`, { opacity: 1, y: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-on-${i}`, { opacity: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-off-${i}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-${i}`, { opacity: 0.4, scale: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-on-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.intent-pill-off-${next}`, { opacity: 0, duration: 0.8 }, "<")
          .to(`.intent-pill-${next}`, { opacity: 1, scale: 1.05, duration: 0.8 }, "<")
          .addLabel(`intent-${INTENT_WORDS[next]}`);
      }

      // --- MOMENTO 02 — demonstração do fluxo ------------------------------
      tl.to(".layer-01", { autoAlpha: 0, scale: 1.04, y: -25, duration: 1.2 })
        .to(".layer-02", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("flow-step-0");

      // O realce da etapa ativa mora numa sublayer própria: só opacidade é
      // animada, nunca cor de fundo ou de borda.
      for (let i = 0; i < FLOW_SCENES - 1; i++) {
        const next = i + 1;
        tl.to(`.flow-step-bg-${i}`, { opacity: 0, duration: 0.8 })
          .to(`.flow-step-${i}`, { opacity: 0.4, duration: 0.8 }, "<")
          .to(`.flow-step-bg-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.flow-step-${next}`, { opacity: 1, duration: 0.8 }, "<")
          .to(`.flow-scene-${i}`, { opacity: 0, y: -20, scale: 0.96, duration: 0.8 }, "<")
          .to(`.flow-scene-${next}`, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.3")
          .addLabel(`flow-step-${next}`);
      }

      // --- MOMENTO 03 — cenas editoriais -----------------------------------
      tl.to(".layer-02", { autoAlpha: 0, scale: 0.94, y: -20, duration: 1.2 })
        .to(".layer-03", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel(`editorial-${EDITORIAL_LABELS[0]}`);

      for (let i = 1; i < EDITORIAL_LABELS.length; i++) {
        tl.to(`.editorial-scene-${i}`, { opacity: 0, y: -20, scale: 0.96, duration: 0.8 })
          .to(`.editorial-scene-${i + 1}`, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.2")
          .addLabel(`editorial-${EDITORIAL_LABELS[i]}`);
      }

      // --- MOMENTO 04 — convergência do hub e síntese ----------------------
      tl.to(".layer-03", { autoAlpha: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-04", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .addLabel("hub-orbit");

      SATELLITE_TARGETS.forEach((target, idx) => {
        tl.to(
          `.hub-sat-${idx + 1}`,
          { ...target, scale: 0.35, opacity: 0, duration: 1.8 },
          idx === 0 ? ">" : "<"
        );
      });

      tl.to(".hub-orbit-ring-outer", { scale: 0.6, opacity: 0.2, duration: 1.8 }, "<")
        .to(".hub-orbit-ring-inner", { scale: 0.5, opacity: 0.3, duration: 1.8 }, "<")
        .to(".hub-nucleus", { scale: 1.95, duration: 1.8 }, "-=1.2")
        .to(".hub-nucleus-glow", { opacity: 0.8, scale: 2.2, duration: 1.8 }, "<")
        // O aro acende junto do halo: a luz do núcleo é o efeito visível de ter
        // recebido as seis órbitas, e não um estado que ele já tinha.
        .to(".hub-nucleus-rim", { opacity: 1, duration: 1.8 }, "<")
        .to(".hub-nucleus-logo", { opacity: 1, scale: 1.15, duration: 1.4 }, "-=1.2")
        .addLabel("hub-converged")

        .to(".hub-convergence-container", { opacity: 0, scale: 0.92, duration: 1.2 })
        .to(".hub-simplification-container", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.6")
        .addLabel("hub-simplification");

      // --- MOMENTO 05 — monólito de acesso ---------------------------------
      tl.to(".layer-04", { autoAlpha: 0, scale: 0.94, duration: 1.2 })
        .to(".layer-05", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.8")
        .fromTo(
          ".access-portal-card",
          { scale: 0.92, y: 30, opacity: 0.4 },
          { scale: 1, y: 0, opacity: 1, duration: 1.2 },
          "-=0.8"
        )
        .addLabel("access-portal");

      // =====================================================================
      // A NAVEGAÇÃO POR PASSOS
      // =====================================================================
      const lastIndex = STAGE_STEPS.length - 1;
      let index = 0;
      let animating = false;

      const goToStep = (target: number) => {
        const clamped = Math.max(0, Math.min(lastIndex, target));
        if (clamped === index || animating) return;

        animating = true;
        index = clamped;
        publishStageIndex(index);

        gsap.to(tl, {
          time: tl.labels[STAGE_STEPS[index]],
          duration: prefersReducedMotion ? 0 : STEP_DURATION,
          ease: STEP_EASE,
          overwrite: true,
          onComplete: () => {
            animating = false;
          },
        });
      };

      const releaseNavigator = registerStageNavigator(goToStep);

      const advance = (delta: number) => {
        if (animating) return;
        const next = index + delta;

        // Passado o último estado, o palco devolve a rolagem ao documento para
        // que o rodapé continue alcançável. Ao voltar ao topo, ele retoma.
        if (next > lastIndex) {
          observer.disable();
          return;
        }
        if (next < 0) return;

        goToStep(next);
      };

      // Um gesto = um passo, qualquer que seja o tamanho do gesto.
      //
      // Travar por tempo não resolve isto, e é onde a implementação anterior
      // falhava. Um toque rápido de dois dedos no trackpad não emite um evento:
      // emite uma rajada que segue chegando por um a dois segundos depois de os
      // dedos saírem, porque o sistema operacional continua entregando a
      // inércia. Uma trava com prazo fixo expira no meio dessa cauda, o próximo
      // evento da mesma rajada passa a ser lido como um gesto novo, e a
      // experiência anda dois ou três estados de uma vez. A roda do mouse girada
      // com força se comporta igual.
      //
      // A trava correta é a do fim do gesto: cada evento que chega adia o
      // encerramento. `onStop` só dispara depois de `onStopDelay` de silêncio de
      // verdade — então a rajada inteira, com inércia e tudo, é contada como o
      // único gesto que de fato foi.
      let gestureConsumed = false;

      const advanceByGesture = (delta: number) => {
        if (gestureConsumed) return;
        gestureConsumed = true;
        advance(delta);
      };

      const observer = Observer.create({
        target: window,
        // Sem `pointer`: arrastar com o mouse não é um gesto de rolagem aqui, e
        // capturá-lo colocaria o palco no caminho de cliques em links e botões.
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 10,
        preventDefault: true,
        onUp: () => advanceByGesture(1),
        onDown: () => advanceByGesture(-1),
        onStop: () => {
          gestureConsumed = false;
        },
        onStopDelay: 0.15,
      });

      // O teclado atravessa a experiência pelos mesmos passos. Não é um extra:
      // é o que garante que nada aqui dependa de um gesto de rolagem para ser
      // alcançável (`FH-14.07`).
      const onKeyDown = (event: KeyboardEvent) => {
        if (!observer.isEnabled) return;

        const el = event.target as HTMLElement | null;
        if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        switch (event.key) {
          // O teclado chama `advance` direto, sem a trava de gesto: ela só é
          // reaberta por `onStop`, que nunca dispara para uma tecla. Repetição
          // de tecla segurada já fica limitada por `animating`, um passo por
          // transição.
          case "ArrowDown":
          case "PageDown":
          case " ":
            event.preventDefault();
            advance(1);
            break;
          case "ArrowUp":
          case "PageUp":
            event.preventDefault();
            advance(-1);
            break;
          case "Home":
            event.preventDefault();
            goToStep(0);
            break;
          case "End":
            event.preventDefault();
            goToStep(lastIndex);
            break;
        }
      };

      // Enquanto o palco está ativo ele segura a rolagem, então a página fica
      // no topo. Sair do topo só acontece depois da liberação acima; voltar ao
      // topo devolve o comando ao palco.
      const onScroll = () => {
        const atTop = window.scrollY <= 1;
        if (atTop && !observer.isEnabled) {
          // O palco se desliga no último passo sem que o gesto termine, então
          // `onStop` não chega a reabrir a trava. Reabrir aqui evita que o
          // primeiro gesto de volta seja engolido.
          gestureConsumed = false;
          observer.enable();
        } else if (!atTop && observer.isEnabled) {
          observer.disable();
        }
      };

      onScroll();
      publishStageIndex(0);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("keydown", onKeyDown);

      return () => {
        releaseNavigator();
        observer.kill();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("keydown", onKeyDown);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="master-experience-wrapper relative w-full h-[100svh] overflow-hidden bg-background"
    >
      <div className="master-stage-canvas absolute inset-0 flex items-center justify-center pointer-events-none">
        <Layer01Opening />
        <Layer02Flow />
        <Layer03Editorial />
        <Layer04Hub />
        <Layer05Access />
      </div>
    </div>
  );
}
