"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FAQ_CATEGORIES, FaqCategory, FaqItem } from "./faq-data";
import {
  buildFaqTermsIndex,
  getDidYouMeanSuggestions,
  normalizeText,
} from "./trigram-search";
import { TourTriggerButton } from "@/components/onboarding/tour-trigger-button";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sparkles,
  Zap,
  LayoutDashboard,
  MessageSquare,
  LayoutGrid,
  Users,
  GitBranch,
  Radio,
  Workflow,
  Shield,
  UsersRound,
  CreditCard,
  X,
  Compass,
  Sparkle,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  LayoutDashboard,
  MessageSquare,
  LayoutGrid,
  Users,
  GitBranch,
  Radio,
  Workflow,
  Sparkles,
  Shield,
  UsersRound,
  CreditCard,
};

export function FaqContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Constrói o índice remissivo de termos para busca trigram (pg_trgm)
  const termsIndex = useMemo(() => buildFaqTermsIndex(FAQ_CATEGORIES), []);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sugestões "Você quis dizer?" calculadas via similaridade de trigramas
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    return getDidYouMeanSuggestions(searchQuery, termsIndex, 0.28, 4);
  }, [searchQuery, termsIndex]);

  // Filtra categorias e itens do FAQ
  const filteredCategories = useMemo(() => {
    const normQuery = normalizeText(searchQuery);

    return FAQ_CATEGORIES.map((category) => {
      // Se um filtro de categoria específico estiver ativo
      if (selectedCategory !== "all" && category.id !== selectedCategory) {
        return { ...category, items: [] };
      }

      if (!normQuery) {
        return category;
      }

      const matchingItems = category.items.filter((item) => {
        const inQuestion = normalizeText(item.question).includes(normQuery);
        const inAnswer = normalizeText(item.answer).includes(normQuery);
        const inSteps = item.steps?.some((step) => normalizeText(step).includes(normQuery));
        const inTags = item.tags?.some((tag) => normalizeText(tag).includes(normQuery));
        return inQuestion || inAnswer || inSteps || inTags;
      });

      return {
        ...category,
        items: matchingItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery, selectedCategory]);

  const totalQuestions = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div id="tour-faq-header" className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="size-3.5" />
            Central de Conhecimento
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Como podemos ajudar você hoje?
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Encontre respostas rápidas, guias passo a passo e tutoriais atualizados com inteligência de busca por termos.
          </p>

          {/* Search Bar */}
          <div id="tour-faq-search" className="relative max-w-2xl pt-2 space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 size-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busque por termos (ex: WhatsApp, Pipelines, Transmissões, Contatos)..."
                className="w-full rounded-xl border border-border/80 bg-background/95 py-3.5 pl-12 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Sugestões "Você quis dizer?" (pg_trgm Trigram Matching) */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
                <span className="font-semibold flex items-center gap-1">
                  <Sparkle className="size-3.5" />
                  Você quis dizer?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSearchQuery(sug)}
                      className="rounded-md border border-amber-500/30 bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-12 -right-12 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </div>

      {/* Category Navigation Pills */}
      <div id="tour-faq-categories" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categorias de Conteúdo
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalQuestions} {totalQuestions === 1 ? "pergunta encontrada" : "perguntas encontradas"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Compass className="size-3.5" />
            Todas as Categorias
          </button>

          {FAQ_CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || HelpCircle;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <IconComponent className="size-3.5" />
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div id="tour-faq-accordion">
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <HelpCircle className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Nenhum resultado exato encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Não encontramos perguntas com o termo exato &quot;{searchQuery}&quot;.
          </p>

          {/* Se houver sugestões do índice remissivo */}
          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Experimente buscar por:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setSearchQuery(sug)}
                    className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Limpar busca e filtros
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const IconComponent = ICON_MAP[category.iconName] || HelpCircle;

            return (
              <div key={category.id} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="grid gap-3">
                  {category.items.map((item) => {
                    const isExpanded = !!expandedItems[item.id] || searchQuery.length > 0;

                    return (
                      <div
                        key={item.id}
                        className={`overflow-hidden rounded-xl border transition-all ${
                          isExpanded
                            ? "border-primary/30 bg-card shadow-xs"
                            : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium text-foreground transition-colors"
                        >
                          <span className="text-sm font-semibold sm:text-base">{item.question}</span>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-primary" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border/40 bg-muted/20 p-4 sm:p-5 space-y-4 text-sm text-foreground/90">
                            <p className="leading-relaxed">{item.answer}</p>

                            {item.steps && item.steps.length > 0 && (
                              <ol className="space-y-2 rounded-xl bg-background/80 p-4 border border-border/50">
                                {item.steps.map((step, idx) => (
                                  <li key={idx} className="flex gap-3 text-xs sm:text-sm">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-normal">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            )}

                            {item.routeLink && (
                              <div className="pt-2">
                                <Link
                                  href={item.routeLink.href}
                                  className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                                >
                                  {item.routeLink.label}
                                  <ExternalLink className="size-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Footer Support Banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-semibold text-foreground">Deseja um acompanhamento visual das telas?</h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            O Tour Guiado é <strong>contextual e independente por tela</strong>. Para entender melhor uma funcionalidade específica (ex: Caixa de Entrada, Pipelines, Transmissões), navegue até a tela correspondente e clique no botão de Tour Guiado no topo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TourTriggerButton />
        </div>
      </div>
    </div>
  );
}
