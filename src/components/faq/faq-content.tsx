"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Building2,
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
  FileText,
  UserCheck,
  Tag,
} from "lucide-react";

// Mapeamento extensível de ícones das categorias
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
  FileText,
  UserCheck,
  Building2,
};

export function FaqContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atalhos universais de teclado: '/' ou 'Cmd+K' / 'Ctrl+K' para buscar, 'Esc' para limpar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
        } else if (selectedCategory !== "all") {
          setSelectedCategory("all");
        }
        return;
      }

      if (!isInputFocused) {
        if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, selectedCategory]);

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
    return getDidYouMeanSuggestions(searchQuery, termsIndex, 0.25, 4);
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
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 p-3 sm:p-6 lg:p-8">
      {/* Header Banner — Estado da Arte Volume II & Responsividade Web/Mobile */}
      <div
        id="tour-faq-header"
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 sm:p-8 lg:p-10 shadow-xs transition-all"
      >
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="size-3.5" />
            Central de Conhecimento & Suporte
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
            Como podemos ajudar você hoje?
          </h1>
          <p className="max-w-2xl text-xs sm:text-base text-muted-foreground leading-relaxed">
            Pesquise por funcionalidades, tire dúvidas operacionais e siga passo a passos detalhados do FlowHub.
          </p>

          {/* Campo de Busca com Ergonomia Web/Mobile e Atalhos de Teclado */}
          <div id="tour-faq-search" className="relative max-w-2xl pt-1 sm:pt-2 space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 sm:left-4 size-4 sm:size-5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busque por termos (ex: Transmissão, Documentos, WhatsApp)..."
                aria-label="Buscar na central de ajuda"
                className="w-full rounded-xl border border-border/80 bg-background/95 py-3 sm:py-3.5 pl-10 sm:pl-12 pr-14 sm:pr-24 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 shadow-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              />
              <div className="absolute right-2.5 sm:right-3 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpar busca"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center gap-1">
                    <kbd className="inline-flex items-center rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                      /
                    </kbd>
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                      <span>⌘</span>K
                    </kbd>
                  </div>
                )}
              </div>
            </div>

            {/* Sugestões "Você quis dizer?" (pg_trgm Trigram Matching) */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 sm:px-3 sm:py-2 text-xs text-amber-600 dark:text-amber-300">
                <span className="font-semibold flex items-center gap-1 shrink-0">
                  <Sparkle className="size-3.5" />
                  Você quis dizer?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSearchQuery(sug)}
                      className="rounded-md border border-amber-500/30 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300 touch-manipulation"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Elemento gráfico decorativo */}
        <div className="absolute -bottom-12 -right-12 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </div>

      {/* Navegação por Pílulas de Categoria — Carrossel Responsivo no Mobile e Wrapping no Desktop */}
      <div id="tour-faq-categories" className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categorias de Conteúdo
          </h2>
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
            {totalQuestions} {totalQuestions === 1 ? "pergunta" : "perguntas"}
          </span>
        </div>

        {/* Carrossel Deslizável no Mobile com Snap e Disposição Adaptativa no Desktop */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 sm:pb-0 scrollbar-none snap-x sm:flex-wrap sm:overflow-visible -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`flex shrink-0 snap-start items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all min-h-[38px] touch-manipulation ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Compass className="size-3.5 shrink-0" />
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
                className={`flex shrink-0 snap-start items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all min-h-[38px] touch-manipulation ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <IconComponent className="size-3.5 shrink-0" />
                <span>{cat.title}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Acordeões com Ergonomia Web e Mobile */}
      <div id="tour-faq-accordion">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center">
            <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3 sm:mb-4">
              <HelpCircle className="size-5 sm:size-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Nenhum resultado exato encontrado</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md">
              Não encontramos perguntas com o termo exato &quot;{searchQuery}&quot;.
            </p>

            {/* Sugestões do índice remissivo */}
            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Experimente buscar por:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSearchQuery(sug)}
                      className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground touch-manipulation"
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
              className="mt-5 sm:mt-6 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 touch-manipulation min-h-[40px]"
            >
              Limpar busca e filtros (Esc)
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredCategories.map((category) => {
              const IconComponent = ICON_MAP[category.iconName] || HelpCircle;

              return (
                <div key={category.id} className="space-y-3 sm:space-y-4">
                  {/* Cabeçalho da Categoria */}
                  <div className="flex items-center gap-2.5 sm:gap-3 border-b border-border/60 pb-2.5 sm:pb-3">
                    <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconComponent className="size-4 sm:size-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">{category.title}</h2>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{category.description}</p>
                    </div>
                  </div>

                  {/* Itens do FAQ com toque ergonômico e acessibilidade */}
                  <div className="grid gap-2.5 sm:gap-3">
                    {category.items.map((item) => {
                      const isExpanded = !!expandedItems[item.id] || searchQuery.length > 0;
                      const panelId = `faq-answer-${item.id}`;

                      return (
                        <div
                          key={item.id}
                          className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
                            isExpanded
                              ? "border-primary/40 bg-card shadow-xs"
                              : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                          }`}
                        >
                          {/* Barra vertical indicadora de expansão */}
                          {isExpanded && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                          )}

                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            aria-expanded={isExpanded}
                            aria-controls={panelId}
                            className="flex w-full items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 text-left font-medium text-foreground transition-colors pl-4 sm:pl-5 min-h-[48px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <span className="text-xs sm:text-base font-semibold leading-snug">{item.question}</span>
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform">
                              {isExpanded ? (
                                <ChevronDown className="size-3.5 sm:size-4 text-primary" />
                              ) : (
                                <ChevronRight className="size-3.5 sm:size-4" />
                              )}
                            </span>
                          </button>

                          {isExpanded && (
                            <div
                              id={panelId}
                              className="border-t border-border/40 bg-muted/20 p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-xs sm:text-sm text-foreground/90 pl-4 sm:pl-5"
                            >
                              <p className="leading-relaxed max-w-3xl text-foreground/90">{item.answer}</p>

                              {item.steps && item.steps.length > 0 && (
                                <ol className="space-y-2 rounded-xl bg-background/80 p-3 sm:p-4 border border-border/50 max-w-3xl">
                                  {item.steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-2.5 sm:gap-3 text-xs sm:text-sm">
                                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                                        {idx + 1}
                                      </span>
                                      <span className="leading-normal min-w-0">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}

                              {/* Tags da Pergunta */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 max-w-3xl">
                                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mr-1">
                                    <Tag className="size-3" />
                                    Tags:
                                  </span>
                                  {item.tags.map((tag) => (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => setSearchQuery(tag)}
                                      className="rounded-md border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary touch-manipulation"
                                    >
                                      #{tag}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {item.routeLink && (
                                <div className="pt-1 sm:pt-2">
                                  <Link
                                    href={item.routeLink.href}
                                    className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-primary/10 px-4 py-2.5 sm:py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground min-h-[40px] touch-manipulation"
                                  >
                                    <span>{item.routeLink.label}</span>
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

      {/* Banner de Rodapé com Orientação do Tour Guiado — Ergonomia Web/Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-base font-semibold text-foreground">Deseja um acompanhamento passo a passo na tela?</h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            O <strong>Tour Guiado</strong> é contextual e específico para cada funcionalidade. Para visualizar o tour de uma área (ex: Caixa de Entrada, Pipelines, Transmissões Documentais), acesse a tela desejada e clique no botão de tour no cabeçalho superior.
          </p>
        </div>
        <div className="flex items-center justify-center shrink-0 w-full sm:w-auto">
          <TourTriggerButton />
        </div>
      </div>
    </div>
  );
}
