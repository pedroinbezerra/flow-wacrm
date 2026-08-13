"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Shield, UserMinus } from "lucide-react";
import type { ParticipantPresenceState, ConversationParticipant, Profile } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";


interface ParticipantBarProps {
  conversationId: string;
  activePresences: ParticipantPresenceState[];
  currentUserId?: string;
  onRefreshParticipants?: () => void;
}

export function ParticipantBar({
  conversationId,
  activePresences,
  currentUserId,
  onRefreshParticipants,
}: ParticipantBarProps) {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [allAccountProfiles, setAllAccountProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/participants`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.participants)
            ? data.participants
            : [];
        setParticipants(list);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  };

  const fetchAccountMembers = async () => {
    try {
      const res = await fetch("/api/account/members");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.members)
          ? data.members
          : Array.isArray(data)
            ? data
            : [];
        if (list.length > 0) {
          setAllAccountProfiles(list);
          return;
        }
      }
    } catch {}

    try {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*");
      if (data) setAllAccountProfiles(data as Profile[]);
    } catch {}
  };

  useEffect(() => {
    if (conversationId) {
      fetchParticipants();
      fetchAccountMembers();
    }
  }, [conversationId]);

  const handleAddParticipant = async (targetUserId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: targetUserId, role: "participant" }),
      });
      if (res.ok) {
        toast.success(t("inbox.collaboration.participantAdded"));
        fetchParticipants();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_timeline", { detail: { conversationId } })
          );
        }
        onRefreshParticipants?.();
      }
    } catch (err) {
      toast.error(t("inbox.collaboration.participantAddError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (targetUserId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/participants?target_user_id=${targetUserId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(t("inbox.collaboration.participantRemoved"));
        fetchParticipants();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_timeline", { detail: { conversationId } })
          );
        }
        onRefreshParticipants?.();
      }
    } catch (err) {
      toast.error(t("inbox.collaboration.participantRemoveError"));
    } finally {
      setLoading(false);
    }
  };

  /* Atividade em curso é sinal, não conteúdo (FH-50.08). O rótulo vem do
   * dicionário (FH-60.01) e a cor, de token semântico (FH-29.01) — a paleta
   * bruta anterior não acompanhava modo nem acento. Sem animação contínua:
   * nada se move enquanto o operador lê a conversa (FH-39.10). */
  const getActivityBadge = (presence?: ParticipantPresenceState) => {
    if (!presence) return null;
    switch (presence.activity) {
      case "typing":
        return (
          <Badge variant="secondary" className="text-[10px]">
            {t("inbox.collaboration.typing")}
          </Badge>
        );
      case "preparing_response":
        return (
          <Badge variant="secondary" className="text-[10px]">
            {t("inbox.collaboration.preparingReply")}
          </Badge>
        );
      case "writing_note":
        return (
          <Badge variant="secondary" className="text-[10px]">
            {t("inbox.notes.writing")}
          </Badge>
        );
      default:
        return (
          <span
            className="h-2 w-2 rounded-full bg-primary"
            title={t("inbox.collaboration.viewing")}
          />
        );
    }
  };

  const safeProfiles = Array.isArray(allAccountProfiles) ? allAccountProfiles : [];
  const safeParticipants = Array.isArray(participants) ? participants : [];

  const nonParticipants = safeProfiles.filter(
    (p) => !safeParticipants.some((part) => part.user_id === p.user_id)
  );

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 border-b border-border/60 text-xs">
      <div className="flex items-center gap-1 text-muted-foreground font-medium shrink-0">
        <Users className="h-3.5 w-3.5" />
        <span>{t("inbox.collaboration.participants")}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
        {safeParticipants.length === 0 ? (
          <span className="text-muted-foreground italic text-[11px]">
            {t("inbox.collaboration.noParticipants")}
          </span>
        ) : (
          safeParticipants.map((p) => {
            const prof = p.profile || safeProfiles.find((sp) => sp.user_id === p.user_id);
            const name = prof?.full_name || t("inbox.collaboration.teammate");
            const isOwner = p.role === "owner";
            const presence = activePresences.find((ap) => ap.user_id === p.user_id);

            return (
              <div
                key={p.id || p.user_id}
                className="flex items-center gap-1 bg-background border border-border px-2 py-0.5 rounded-full text-[11px] shadow-2xs"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={prof?.avatar_url} />
                  <AvatarFallback className="text-[9px]">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground truncate max-w-[100px]">{name}</span>

                {isOwner && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/40 text-primary">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    {t("inbox.collaboration.owner")}
                  </Badge>
                )}
                {getActivityBadge(presence)}
                {!isOwner && p.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveParticipant(p.user_id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                    title={t("inbox.collaboration.removeParticipant")}
                  >
                    <UserMinus className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 shrink-0">
              <UserPlus className="h-3.5 w-3.5" />
              {t("inbox.collaboration.add")}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          {nonParticipants.length === 0 ? (
            <DropdownMenuItem disabled className="text-xs">
              {t("inbox.collaboration.allParticipating")}
            </DropdownMenuItem>
          ) : (
            nonParticipants.map((prof) => (
              <DropdownMenuItem
                key={prof.user_id}
                onClick={() => handleAddParticipant(prof.user_id)}
                disabled={loading}
                className="text-xs flex items-center justify-between"
              >
                <span className="truncate">{prof.full_name}</span>
                <UserPlus className="h-3 w-3 text-muted-foreground ml-1 shrink-0" />
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
