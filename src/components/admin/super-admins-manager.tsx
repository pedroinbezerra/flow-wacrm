"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, UserPlus, ShieldAlert, Trash2, RefreshCw, Mail, CheckCircle2, User, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export interface SuperAdminItem {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogItem {
  id: string;
  action: "granted" | "revoked";
  performed_by_user_id: string;
  performed_by_email: string;
  target_user_id: string;
  target_email: string;
  created_at: string;
}

export function SuperAdminsManager() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [superAdmins, setSuperAdmins] = useState<SuperAdminItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  // Promote modal state
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [promoting, setPromoting] = useState(false);

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState<SuperAdminItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchSuperAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/super-admins");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao listar Super Admins.");
      setSuperAdmins(data.superAdmins || []);
      setAuditLogs(data.auditLogs || []);
    } catch (err: any) {
      toast.error(err.message || "Não foi possível carregar os operadores da plataforma.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setPromoting(true);
    try {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao conceder privilégio.");

      toast.success(data.message || "Operador promovido com sucesso!");
      setEmailInput("");
      setPromoteModalOpen(false);
      await fetchSuperAdmins();
    } catch (err: any) {
      toast.error(err.message || "Falha ao promover usuário.");
    } finally {
      setPromoting(false);
    }
  };

  const handleRevokeSuperAdmin = async () => {
    if (!revokeTarget) return;

    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/super-admins/${revokeTarget.user_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao revogar acesso.");

      toast.success(data.message || "Acesso revogado com sucesso.");
      setRevokeTarget(null);
      await fetchSuperAdmins();
    } catch (err: any) {
      toast.error(err.message || "Falha ao revogar acesso.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Operadores da Plataforma (Super Admins)
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os administradores gerais do Flow Hub com acesso irrestrito às métricas globais e planos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSuperAdmins} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setPromoteModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Promover Novo Operador
          </Button>
        </div>
      </div>

      {/* Super Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Operadores Ativos ({superAdmins.length})
          </CardTitle>
          <CardDescription>
            Lista de contas de usuário com privilégios gerais de administração do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Carregando lista de operadores...
            </div>
          ) : superAdmins.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum Super Admin encontrado no sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Operador</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {superAdmins.map((item) => {
                    const isSelf = item.user_id === profile?.id;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase">
                              {item.full_name?.charAt(0) || item.email?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{item.full_name || "Usuário sem nome"}</p>
                              {isSelf && (
                                <Badge variant="outline" className="text-[10px] text-primary border-primary">
                                  Você
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.email || "Sem e-mail"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Super Admin Ativo
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSelf}
                            title={isSelf ? "Por segurança, você não pode revogar seu próprio acesso" : "Revogar acesso de Super Admin"}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => !isSelf && setRevokeTarget(item)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {isSelf ? "Protegido (Você)" : "Revogar Acesso"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Auditoria & Governança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Histórico de Auditoria & Governança
          </CardTitle>
          <CardDescription>
            Trilha de auditoria completa registrando quem concedeu ou revogou privilégios de Super Admin na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum registro de auditoria gravado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Executado por</th>
                    <th className="px-4 py-3">Usuário Afetado</th>
                    <th className="px-4 py-3 text-right">Data / Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        {log.action === "granted" ? (
                          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                            Acesso Concedido
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Acesso Revogado
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {log.performed_by_email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.target_email}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Promover Usuário por E-mail */}
      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Promover Operador a Super Admin
            </DialogTitle>
            <DialogDescription>
              Informe o e-mail de um usuário já cadastrado no sistema para conceder acesso irrestrito ao painel administrativo da plataforma.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePromoteUser} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">E-mail do Usuário *</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="operador@empresa.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPromoteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={promoting}>
                {promoting ? "Promovendo..." : "Conceder Acesso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Revogação */}
      <Dialog open={Boolean(revokeTarget)} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Revogar Acesso de Super Admin
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover os privilégios de Super Admin de{" "}
              <strong className="text-foreground">{revokeTarget?.email || revokeTarget?.full_name}</strong>? Este usuário perderá a visão global do sistema e voltará ao escopo padrão.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRevokeSuperAdmin} disabled={revoking}>
              {revoking ? "Revogando..." : "Sim, Revogar Acesso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
