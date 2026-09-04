"use client";

// ============================================================
// Seletor de workspace — o rodapé da navegação lateral.
//
// Ele existe porque a identidade participa de vários workspaces, não
// para "adicionar um menu". Por isso o comportamento muda com o número
// de participações, em vez de mostrar sempre o mesmo controle:
//
//   1 workspace   -> faixa estática, exatamente como sempre foi. Não há
//                    escolha a fazer, então não há controle a operar.
//   2+ workspaces -> a mesma faixa vira botão, e a lista mostra o papel
//                    em cada ambiente. Onde estou e o que posso fazer
//                    aqui são a mesma pergunta.
//   0 workspaces  -> estado explícito. Acontece quando a última
//                    participação é encerrada com o app aberto; a
//                    interface diz o que houve em vez de mostrar uma
//                    tela vazia sem explicação.
//
// A troca é uma chamada ao servidor, que valida a participação antes de
// gravar. Enquanto ela não volta, o item fica em espera — nada na tela
// muda de tenant por otimismo.
// ============================================================

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Crown,
  Loader2,
  Shield,
  User,
  UserCog,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { sortWorkspaces } from "@/lib/auth/workspaces";
import { cn } from "@/lib/utils";
import type { AccountRole } from "@/lib/auth/roles";

// Metadados de papel da navegação lateral. Vieram da faixa de conta que este
// componente substitui, com as mesmas cores em claro e escuro: o chip continua
// dizendo o que sempre disse, agora em cada linha da lista de workspaces.
const ROLE_CHIP: Record<
  AccountRole,
  { icon: typeof Crown; className: string }
> = {
  owner: {
    icon: Crown,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  admin: {
    icon: Shield,
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  agent: {
    icon: UserCog,
    className: "border-border bg-muted/60 text-muted-foreground",
  },
  viewer: {
    icon: User,
    className: "border-border bg-transparent text-muted-foreground",
  },
};

interface WorkspaceSwitcherProps {
  /** Sidebar recolhida: só o ícone cabe. */
  isCollapsed?: boolean;
  /** Fecha a sidebar no mobile depois de uma escolha. */
  onNavigate?: () => void;
}

function RoleChip({ role }: { role: AccountRole }) {
  const { t } = useTranslation();
  const meta = ROLE_CHIP[role];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5",
        "text-[10px] font-medium uppercase tracking-wider",
        meta.className,
      )}
    >
      <Icon className="size-3" />
      {t(`roles.${role}`)}
    </span>
  );
}

export function WorkspaceSwitcher({
  isCollapsed = false,
  onNavigate,
}: WorkspaceSwitcherProps) {
  const { t } = useTranslation();
  const {
    account,
    accountId,
    accountRole,
    profile,
    profileLoading,
    workspaces,
    workspacesLoading,
    hasMultipleWorkspaces,
    hasNoWorkspace,
    switchWorkspace,
  } = useAuth();

  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  if (hasNoWorkspace) {
    return (
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
        <UsersRound className="size-3.5 shrink-0 text-amber-500" />
        {!isCollapsed && <span>{t("navigation.workspace.none")}</span>}
      </div>
    );
  }

  if (profileLoading || !account?.name) return null;

  const currentName = account.name;

  // Sem escolha a fazer: a faixa continua sendo só informação. E quando o
  // único workspace é o pessoal — aquele cujo nome é o próprio nome da pessoa
  // — ela não diz nada que o menu de usuário logo abaixo já não diga, então
  // não aparece. Regra herdada da faixa de conta anterior.
  if (!hasMultipleWorkspaces) {
    if (isCollapsed || currentName === profile?.full_name) return null;
    return (
      <div className="mb-2 flex items-center gap-2 px-3 text-xs text-muted-foreground">
        <UsersRound className="size-3.5 shrink-0" />
        <span className="truncate" title={currentName}>
          {currentName}
        </span>
        {accountRole ? (
          <span className="ml-auto">
            <RoleChip role={accountRole} />
          </span>
        ) : null}
      </div>
    );
  }

  const handleSwitch = async (targetId: string) => {
    if (targetId === accountId || switchingTo) return;
    setSwitchingTo(targetId);
    try {
      await switchWorkspace(targetId);
      // Em caso de sucesso a página é recarregada pelo próprio
      // switchWorkspace; não há estado a restaurar aqui.
    } catch (err) {
      setSwitchingTo(null);
      toast.error(
        err instanceof Error ? err.message : t("navigation.workspace.switchError"),
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={isCollapsed ? currentName : undefined}
        className={cn(
          "mb-2 flex w-full items-center gap-2 rounded-lg text-left text-xs text-muted-foreground",
          "transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none data-popup-open:bg-muted/60",
          isCollapsed ? "justify-center p-2" : "px-3 py-2",
        )}
      >
        <UsersRound className="size-3.5 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="truncate font-medium text-foreground">
              {currentName}
            </span>
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-60" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={6}
        className="min-w-64 bg-popover text-popover-foreground ring-border"
      >
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t("navigation.workspace.label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        {workspacesLoading && workspaces.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {t("common.loading")}
          </div>
        ) : (
          sortWorkspaces(workspaces).map((workspace) => {
            const isCurrent = workspace.id === accountId;
            const isSwitching = switchingTo === workspace.id;
            return (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => {
                  onNavigate?.();
                  handleSwitch(workspace.id);
                }}
                disabled={!!switchingTo}
                className="cursor-pointer gap-2 text-popover-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {isSwitching ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin" />
                ) : (
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      isCurrent ? "opacity-100 text-primary" : "opacity-0",
                    )}
                  />
                )}
                <span className="truncate" title={workspace.name}>
                  {workspace.name}
                </span>
                <span className="ml-auto">
                  <RoleChip role={workspace.role} />
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
