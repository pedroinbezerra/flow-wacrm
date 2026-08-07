"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Building2, User } from "lucide-react";
import type { Profile } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

interface HelpRequestModalProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHelpRequested?: () => void;
}

/* Valor persistido separado do rótulo exibido: o texto vem do dicionário
 * (FH-60.01) e o valor gravado não muda com o idioma (FH-60.07). */
const SECTORS = [
  { value: "finance", labelKey: "inbox.help.sectors.finance" },
  { value: "support", labelKey: "inbox.help.sectors.support" },
  { value: "sales", labelKey: "inbox.help.sectors.sales" },
  { value: "operations", labelKey: "inbox.help.sectors.operations" },
  { value: "leadership", labelKey: "inbox.help.sectors.leadership" },
];

export function HelpRequestModal({
  conversationId,
  open,
  onOpenChange,
  onHelpRequested,
}: HelpRequestModalProps) {
  const { t } = useTranslation();
  const [targetType, setTargetType] = useState<"sector" | "user">("sector");
  const [selectedSector, setSelectedSector] = useState<string>(SECTORS[0].value);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [note, setNote] = useState("");
  const [members, setMembers] = useState<Profile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      async function loadMembers() {
        try {
          const res = await fetch("/api/account/members");
          if (res.ok) {
            const data = await res.json();
            setMembers(data || []);
          }
        } catch {
          // ignore
        }
      }
      loadMembers();
    }
  }, [open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/help-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_sector: targetType === "sector" ? selectedSector : undefined,
          target_user_id: targetType === "user" ? selectedUserId : undefined,
          note,
        }),
      });

      if (res.ok) {
        toast.success(t("inbox.help.sent"));
        onOpenChange(false);
        setNote("");
        onHelpRequested?.();
      } else {
        toast.error(t("inbox.help.sendError"));
      }
    } catch (err) {
      toast.error(t("inbox.help.connectionError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <HelpCircle className="h-5 w-5" />
            <DialogTitle>{t("inbox.help.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Notifique integrantes de um setor ou um colaborador específico para colaborar nesta conversa sem criar um novo atendimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={targetType === "sector" ? "default" : "outline"}
              size="sm"
              onClick={() => setTargetType("sector")}
              className="flex-1 gap-1.5 text-xs"
            >
              <Building2 className="h-3.5 w-3.5" />
              Por Setor
            </Button>
            <Button
              type="button"
              variant={targetType === "user" ? "default" : "outline"}
              size="sm"
              onClick={() => setTargetType("user")}
              className="flex-1 gap-1.5 text-xs"
            >
              <User className="h-3.5 w-3.5" />
              Por Colaborador
            </Button>
          </div>

          {targetType === "sector" ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("inbox.help.sector")}</Label>
              <Select value={selectedSector} onValueChange={(val) => val && setSelectedSector(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={t("inbox.help.sectorPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sec) => (
                    <SelectItem key={sec.value} value={sec.value} className="text-xs">
                      {t(sec.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("inbox.help.teammate")}</Label>
              <Select value={selectedUserId} onValueChange={(val) => val && setSelectedUserId(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={t("inbox.help.teammatePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id} className="text-xs">
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}


          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t("inbox.help.context")}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: @Dani consegue verificar o estorno deste pagamento?"
              className="text-xs min-h-[70px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || (targetType === "user" && !selectedUserId)}
            className="gap-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Enviar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
