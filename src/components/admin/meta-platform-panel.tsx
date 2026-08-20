"use client";

/**
 * Painel de saúde da plataforma Meta — leitor é o mantenedor do FlowHub.
 *
 * Aqui o termo técnico **é** a informação (AGENTS.md §10): quem lê precisa
 * de `BLOCKED`, do código do erro e do nome do endpoint para agir. A regra
 * contra jargão vale para texto de usuário, não para uma tela de
 * diagnóstico de quem opera o sistema.
 *
 * Nenhum bloco apresenta ausência de dado como saúde (`FH-10.04`); falha
 * parcial tem estado próprio (`FH-41.05`); e toda medição declara quando
 * foi feita (`FH-36.06`).
 */

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Gauge,
  HelpCircle,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Health = "operacional" | "degradado" | "fora" | "desconhecido";
type Urgency = "ok" | "atencao" | "critico" | "expirado" | "desconhecido";

interface Service { name: string; rawStatus: string; health: Health; since: string | null }
interface Product { id: string; name: string; services: Service[]; worst: Health; incidentFeedUrl: string | null }
interface FeedItem { title: string; description: string; link: string | null; publishedAt: string | null }
interface Reading { callCountPct: number | null; totalCputimePct: number | null; totalTimePct: number | null; observedAt: string; source: string }
interface EntityError { code: number | null; description: string; possibleSolution: string | null }
interface Entity { entityType: string; id: string; canSendMessage: string; errors: EntityError[] }
interface Account {
  accountId: string; accountName: string | null; label: string | null; wabaId: string | null;
  phoneNumberId: string | null; registeredAt: string | null;
  lastRegistrationError: string | null; localStatus: string | null;
  canSendMessage: string; entities: Entity[]; error: string | null;
}
interface Payload {
  generatedAt: string;
  version: {
    current: string; releasedOn: string | null; expiresOn: string | null;
    daysLeft: number | null; urgency: Urgency; versionsBehind: number;
    latestKnown: string; calendarStale: boolean; calendarCheckedAt: string;
  };
  status: { products: Product[]; fetchedAt: string; error: string | null };
  changelog: { items: FeedItem[]; error: string | null };
  usage: { app: Reading | null; business: Record<string, Reading> } | null;
  accounts: Account[];
  accountsError: string | null;
}

const HEALTH_STYLE: Record<Health, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  operacional: { label: "Operacional", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", Icon: CheckCircle2 },
  degradado: { label: "Degradado", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", Icon: AlertTriangle },
  fora: { label: "Fora do ar", cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: XCircle },
  desconhecido: { label: "Sem resposta", cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};

const SEND_STYLE: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: "Envia normalmente", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  LIMITED: { label: "Envio limitado", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  BLOCKED: { label: "Bloqueado", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  UNKNOWN: { label: "Sem resposta", cls: "bg-muted text-muted-foreground border-border" },
};

const URGENCY_STYLE: Record<Urgency, string> = {
  ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  atencao: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  critico: "bg-destructive/10 text-destructive border-destructive/30",
  expirado: "bg-destructive/10 text-destructive border-destructive/30",
  desconhecido: "bg-muted text-muted-foreground border-border",
};

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function day(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Barra de consumo. Sem valor medido, não desenha barra — desenha o vazio. */
function UsageBar({ label, pct }: { label: string; pct: number | null }) {
  if (pct === null) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="text-muted-foreground">não informado</span></div>
        <div className="h-2 rounded-full bg-muted" />
      </div>
    );
  }
  const tone = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

export function MetaPlatformPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/meta-platform", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json as Payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar o painel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading && !data) {
    return (
      <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
        Consultando a Meta…
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Não foi possível montar o painel</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent><Button variant="outline" size="sm" onClick={() => void load()}>Tentar de novo</Button></CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { version, status, changelog, usage, accounts } = data;
  const blocked = accounts.filter((a) => a.canSendMessage === "BLOCKED" || a.canSendMessage === "LIMITED");

  // O topo responde a pergunta da tela em uma linha, para não exigir rolagem
  // só para descobrir que está tudo bem. Substitui o título repetido que o
  // cabeçalho do shell já imprime: ocupa o mesmo espaço com informação em
  // vez de rótulo.
  const RANK: Health[] = ["operacional", "desconhecido", "degradado", "fora"];
  const metaWorst = status.products.reduce<Health>(
    (acc, p) => (RANK.indexOf(p.worst) > RANK.indexOf(acc) ? p.worst : acc),
    "operacional",
  );

  const metaPart = status.error
    ? "Estado da Meta não pôde ser lido"
    : status.products.length === 0
      ? "Nenhum serviço da Meta retornado"
      : metaWorst === "operacional"
        ? "Meta operacional"
        : metaWorst === "fora"
          ? "Meta com serviço fora do ar"
          : metaWorst === "degradado"
            ? "Meta com serviço degradado"
            : "Meta com estado não reconhecido";

  const contasPart = data.accountsError
    ? "conexões não lidas"
    : accounts.length === 0
      ? "nenhuma conexão"
      : blocked.length === 0
        ? `${accounts.length} conexão(ões) sem restrição`
        : `${blocked.length} de ${accounts.length} com restrição`;

  const versaoPart =
    version.urgency === "expirado"
      ? `${version.current} expirada`
      : version.urgency === "critico"
        ? `${version.current} expira em ${version.daysLeft} dias`
        : null;

  const verdict = [metaPart, contasPart, versaoPart].filter(Boolean).join(" · ");
  const calmo =
    !status.error &&
    !data.accountsError &&
    metaWorst === "operacional" &&
    blocked.length === 0 &&
    versaoPart === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Sem <h1> aqui: o cabeçalho do shell já titula a página, e dois
            títulos de mesmo nível com o mesmo texto quebram a leitura por
            estrutura (H4, H7). O lugar não fica vazio — recebe o veredito,
            que é o que alguém abre esta tela para saber. */}
        <div className="min-w-0">
          <p
            className={cn(
              "text-base font-semibold leading-tight",
              calmo ? "text-foreground" : "text-amber-600 dark:text-amber-400",
            )}
          >
            {verdict}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Leitura ao vivo. Nada nesta tela altera estado na Meta.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Anunciado: ao recarregar, todo o conteúdo troca sem nenhum
              movimento de foco — sem isto, quem não vê a tela não sabe
              que algo aconteceu (H1, H7). */}
          <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
            {loading ? "Consultando a Meta…" : `Consultado em ${when(data.generatedAt)}`}
          </span>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Atualizar
          </Button>
        </div>
      </div>

      {/* ---------- Prazo de versão ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> Versão da Graph API
            <Badge variant="outline" className={cn("ml-1 text-xs", URGENCY_STYLE[version.urgency])}>
              {version.urgency === "expirado" ? "Expirada"
                : version.urgency === "critico" ? "Prazo curto"
                : version.urgency === "atencao" ? "Planejar troca"
                : version.urgency === "ok" ? "Dentro do prazo"
                : "Fora do calendário conhecido"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Este é o único quadro que <strong>não</strong> vem de consulta ao vivo: a Meta não
            publica prazo de expiração por API. A tabela é mantida à mão e foi conferida em{" "}
            {day(version.calendarCheckedAt)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Em uso</p><p className="text-lg font-semibold tabular-nums">{version.current}</p></div>
          <div><p className="text-xs text-muted-foreground">Expira em</p><p className="text-lg font-semibold tabular-nums">{day(version.expiresOn)}</p></div>
          <div>
            <p className="text-xs text-muted-foreground">Dias restantes</p>
            <p className="text-lg font-semibold tabular-nums">{version.daysLeft ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mais recente</p>
            <p className="text-lg font-semibold tabular-nums">{version.latestKnown}</p>
            {version.versionsBehind > 0 && (
              <p className="text-xs text-muted-foreground">{version.versionsBehind} versão(ões) atrás</p>
            )}
          </div>
          {version.calendarStale && (
            <p className="sm:col-span-4 text-xs text-amber-600 dark:text-amber-400">
              A tabela de prazos passou do período de reconferência. Os números acima podem estar velhos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ---------- Contas em risco ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Capacidade de envio por conta</CardTitle>
          <CardDescription>
            {/* Falha de leitura NUNCA vira "nenhuma conexão": uma é ignorância,
                a outra é fato, e confundi-las é o defeito que esta tela existe
                para não cometer (FH-10.04). */}
            {data.accountsError
              ? "Não foi possível ler as conexões — o que aparece abaixo pode estar incompleto."
              : accounts.length === 0
              ? "Nenhuma conexão de WhatsApp cadastrada."
              : blocked.length === 0
                ? `${accounts.length} conexão(ões), nenhuma com restrição declarada pela Meta.`
                : `${blocked.length} de ${accounts.length} conexão(ões) com restrição — verifique antes de virar chamado.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.accountsError && <p className="text-sm text-destructive">{data.accountsError}</p>}
          {accounts.map((a) => {
            const style = SEND_STYLE[a.canSendMessage] ?? SEND_STYLE.UNKNOWN;
            const problems = a.entities.filter((e) => e.errors.length > 0);
            return (
              <div key={`${a.accountId}-${a.phoneNumberId ?? a.wabaId}`} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.label || a.phoneNumberId || a.accountId}</p>
                    {a.accountName && <p className="text-xs text-muted-foreground truncate">{a.accountName}</p>}
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {a.phoneNumberId ? `número ${a.phoneNumberId}` : ""}{a.wabaId ? ` · WABA ${a.wabaId}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs shrink-0", style.cls)}>{style.label}</Badge>
                </div>
                {a.error && <p className="mt-2 text-xs text-muted-foreground">{a.error}</p>}
                {/* O que o FlowHub guarda, ao lado do que a Meta responde: divergência
                    entre os dois é o sinal mais útil desta tela. */}
                {!a.registeredAt && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Sem registro concluído no nosso lado.
                    {a.lastRegistrationError ? ` Última tentativa: ${a.lastRegistrationError}` : ""}
                  </p>
                )}
                {problems.map((e) =>
                  e.errors.map((err, i) => (
                    <div key={`${e.id}-${i}`} className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
                      <p className="font-medium">{e.entityType}{err.code ? ` · erro ${err.code}` : ""}</p>
                      <p className="text-muted-foreground">{err.description}</p>
                      {err.possibleSolution && <p className="mt-1"><span className="text-muted-foreground">Solução sugerida pela Meta:</span> {err.possibleSolution}</p>}
                    </div>
                  )),
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------- Incidentes ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Serviços da Meta</CardTitle>
          <CardDescription>
            {status.error ? "Não foi possível consultar a página de status." : `Página oficial de status, lida em ${when(status.fetchedAt)}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.error && <p className="text-sm text-destructive">{status.error}</p>}
          {status.products.map((p) => {
            const s = HEALTH_STYLE[p.worst];
            return (
              <div key={p.id}>
                <div className="flex items-center gap-2 mb-2">
                  <s.Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge variant="outline" className={cn("text-xs", s.cls)}>{s.label}</Badge>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {p.services.map((svc) => {
                    const ss = HEALTH_STYLE[svc.health];
                    return (
                      <div key={svc.name} className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-2.5 py-1.5">
                        <span className="text-xs truncate">{svc.name}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded border shrink-0", ss.cls)}>
                          {/* Quando não sabemos traduzir o estado, a frase
                              original da Meta é a única informação que
                              existe — e ela não pode ficar só no title=,
                              alcançável por mouse (H7). */}
                          {svc.health === "desconhecido" && svc.rawStatus
                            ? svc.rawStatus
                            : ss.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------- Consumo de quota ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Gauge className="h-4 w-4" /> Consumo de quota</CardTitle>
          <CardDescription>
            {usage?.app
              ? `Última leitura em ${when(usage.app.observedAt)}, a partir de ${usage.app.source}. É o valor do último retorno da Meta, não uma média.`
              : "Ainda não observamos nenhum cabeçalho de quota. Os valores aparecem depois da primeira chamada à Meta."}
          </CardDescription>
        </CardHeader>
        {usage?.app && (
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <UsageBar label="Chamadas" pct={usage.app.callCountPct} />
            <UsageBar label="Tempo de CPU" pct={usage.app.totalCputimePct} />
            <UsageBar label="Tempo total" pct={usage.app.totalTimePct} />
          </CardContent>
        )}
      </Card>

      {/* ---------- Changelog ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Newspaper className="h-4 w-4" /> Anúncios da Meta</CardTitle>
          <CardDescription>
            {changelog.error ? "Não foi possível ler o changelog." : "Changelog da Business Messaging — onde as depreciações são anunciadas primeiro."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {changelog.error && <p className="text-sm text-destructive">{changelog.error}</p>}
          {changelog.items.map((item, i) => (
            <a
              key={`${item.title}-${i}`}
              href={item.link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-border/50 p-2.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{item.publishedAt ? when(item.publishedAt) : ""}</span>
              </div>
              {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
