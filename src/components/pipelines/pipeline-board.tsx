"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Deal, PipelineStage } from "@/types";
import { DealCard } from "./deal-card";
import { Button } from "@/components/ui/button";
import { Check, Plus, X, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/currency";

interface PipelineBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  onDealMoved: (dealId: string, newStageId: string) => void;
  onStatusChanged?: (dealId: string, newStatus: "won" | "lost" | "open") => void;
  onAddDeal: (stageId: string) => void;
  onEditDeal: (deal: Deal) => void;
}

export function PipelineBoard({
  stages,
  deals,
  onDealMoved,
  onStatusChanged,
  onAddDeal,
  onEditDeal,
}: PipelineBoardProps) {
  const { defaultCurrency } = useAuth();
  const { t } = useTranslation();
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const dealsByStage = useMemo(() => {
    const map = new Map<string, Deal[]>();
    stages.forEach((s) => map.set(s.id, []));
    deals.forEach((d) => {
      const list = map.get(d.stage_id);
      if (list) list.push(d);
    });
    return map;
  }, [stages, deals]);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.position - b.position),
    [stages],
  );

  const activeDeal = activeDealId
    ? deals.find((d) => d.id === activeDealId) ?? null
    : null;

  const [activeStageId, setActiveStageId] = useState<string>("");

  function handleDragStart(event: DragStartEvent) {
    setActiveDealId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDealId(null);
    const { active, over } = event;
    if (!over) return;
    const dealId = String(active.id);
    const targetId = String(over.id);

    if (targetId === "dropzone-won") {
      onStatusChanged?.(dealId, "won");
      return;
    }
    if (targetId === "dropzone-lost") {
      onStatusChanged?.(dealId, "lost");
      return;
    }
    if (targetId === "dropzone-open") {
      onStatusChanged?.(dealId, "open");
      return;
    }

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === targetId) return;
    if (!sortedStages.some((s) => s.id === targetId)) return;

    onDealMoved(dealId, targetId);
  }

  function handleDragCancel() {
    setActiveDealId(null);
  }

  const scrollToStage = (stageId: string) => {
    setActiveStageId(stageId);
    const el = document.getElementById(`stage-col-${stageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Mobile Stage Selector Pills (< md) */}
      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden">
        {sortedStages.map((st) => {
          const count = dealsByStage.get(st.id)?.length ?? 0;
          const isActive = st.id === activeStageId;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => scrollToStage(st.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: st.color }}
              />
              <span>{st.name}</span>
              <span className="rounded-full bg-background/30 px-1.5 py-0.2 text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* snap-x + snap-mandatory on mobile so swipes land the next
          stage cleanly at the viewport edge instead of mid-column.
          Disabled on lg+ where snapping would interfere with the
          natural layout. The board can still overflow horizontally on
          lg+ once a pipeline has many stages (columns keep a 260px
          min-width), so a thin scrollbar stays visible on desktop. */}
      <div className="pipeline-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 lg:snap-none">
        {sortedStages.map((stage) => {
          const stageDeals = dealsByStage.get(stage.id) ?? [];
          const totalValue = stageDeals.reduce(
            (s, d) => s + Number(d.value || 0),
            0,
          );
          return (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              totalValue={totalValue}
              currency={defaultCurrency}
              onAddDeal={onAddDeal}
              onEditDeal={onEditDeal}
            />
          );
        })}
      </div>

      {activeDealId && <ResolutionDropzones />}

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {activeDeal ? (
          <div className="opacity-90">
            <DealCard
              deal={activeDeal}
              stage={
                sortedStages.find((s) => s.id === activeDeal.stage_id) ?? null
              }
              onEdit={() => {}}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>

      <style jsx>{`
        .pipeline-scroll {
          scroll-behavior: smooth;
        }
        /* On touch devices the peek/snap layout already signals there's
           more to swipe, so the scrollbar is hidden for a clean look.
           On desktop (mouse) the board can overflow with many stages
           and there is no peek hint, so keep a thin, themed scrollbar
           visible to make the overflow discoverable and usable. */
        @media (hover: none), (pointer: coarse) {
          .pipeline-scroll::-webkit-scrollbar {
            height: 0;
            display: none;
          }
          .pipeline-scroll {
            scrollbar-width: none;
          }
        }
        @media (hover: hover) and (pointer: fine) {
          .pipeline-scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--border) transparent;
          }
          .pipeline-scroll::-webkit-scrollbar {
            height: 8px;
          }
          .pipeline-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .pipeline-scroll::-webkit-scrollbar-thumb {
            background-color: var(--border);
            border-radius: 9999px;
          }
          .pipeline-scroll::-webkit-scrollbar-thumb:hover {
            background-color: var(--muted-foreground);
          }
        }
      `}</style>
    </DndContext>
  );
}

function StageColumn({
  stage,
  deals,
  totalValue,
  currency,
  onAddDeal,
  onEditDeal,
}: {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
  currency: string;
  onAddDeal: (stageId: string) => void;
  onEditDeal: (deal: Deal) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    // On mobile each column is `w-[85vw]` (with a reasonable min/max)
    // so the next column's edge peeks in — a "there's more here" hint.
    // snap-start lands each column cleanly when swiping. On lg+ we
    // restore the flex-1 share-the-row behavior. The droppable ref is
    // on the inner messages region below — intentionally NOT here, so
    // a drag over the column header doesn't highlight the whole column.
    <div
      id={`stage-col-${stage.id}`}
      className="flex w-[85vw] min-w-[260px] max-w-[320px] shrink-0 snap-start flex-col rounded-xl border border-border bg-card/60 p-4 lg:w-auto lg:max-w-none lg:flex-1 lg:basis-[260px] lg:shrink lg:snap-none"
    >
      {/* 3px colored top border — sits above the column's padding */}
      <div
        className="-mx-4 -mt-4 h-[3px] rounded-t-xl"
        style={{ backgroundColor: stage.color }}
      />
      <div className="flex items-center justify-between pt-3">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {stage.name}
        </h3>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {deals.length}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(totalValue, currency)}
      </p>

      <div
        ref={setNodeRef}
        className={`mt-3 flex flex-1 flex-col gap-2 rounded-lg transition-all ${
          isOver
            ? "bg-primary/5 outline outline-2 outline-dashed outline-primary outline-offset-2"
            : ""
        }`}
      >
        {deals.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border py-10 text-xs text-muted-foreground">
            {t("pipelines.dropDealHere")}
          </div>
        ) : (
          deals.map((deal) => (
            <DraggableDealCard
              key={deal.id}
              deal={deal}
              stage={stage}
              onEdit={onEditDeal}
            />
          ))
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddDeal(stage.id)}
        className="mt-3 w-full justify-start border border-dashed border-border bg-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
      >
        <Plus className="mr-1 h-3 w-3" />
        {t("pipelines.addDeal")}
      </Button>
    </div>
  );
}

function DraggableDealCard({
  deal,
  stage,
  onEdit,
}: {
  deal: Deal;
  stage: PipelineStage;
  onEdit: (deal: Deal) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1, touchAction: "none" }}
    >
      <DealCard deal={deal} stage={stage} onEdit={onEdit} />
    </div>
  );
}

function ResolutionDropzones() {
  const { t } = useTranslation();
  const { setNodeRef: setWonRef, isOver: isOverWon } = useDroppable({
    id: "dropzone-won",
  });
  const { setNodeRef: setLostRef, isOver: isOverLost } = useDroppable({
    id: "dropzone-lost",
  });
  const { setNodeRef: setOpenRef, isOver: isOverOpen } = useDroppable({
    id: "dropzone-open",
  });

  return (
    <div className="sticky bottom-2 z-20 mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4">
      <div
        ref={setWonRef}
        className={`flex h-12 flex-1 max-w-[180px] min-w-[100px] items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
          isOverWon
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 scale-105 shadow-lg"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        }`}
      >
        <Check className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">{t("pipelines.statusWon")}</span>
      </div>
      <div
        ref={setLostRef}
        className={`flex h-12 flex-1 max-w-[180px] min-w-[100px] items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
          isOverLost
            ? "border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300 scale-105 shadow-lg"
            : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}
      >
        <X className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">{t("pipelines.statusLost")}</span>
      </div>
      <div
        ref={setOpenRef}
        className={`flex h-12 flex-1 max-w-[180px] min-w-[100px] items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
          isOverOpen
            ? "border-blue-500 bg-blue-500/20 text-blue-600 dark:text-blue-300 scale-105 shadow-lg"
            : "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
        }`}
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">{t("pipelines.reopenDeal")}</span>
      </div>
    </div>
  );
}
