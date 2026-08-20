"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ShieldCheck,
  UserCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function LgpdRequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState("acesso");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessId(null);

    if (!name.trim() || !email.trim() || !description.trim()) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dpo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          request_type: requestType,
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao enviar sua solicitação.");
      }

      setSuccessId(data.id);
      setName("");
      setEmail("");
      setDescription("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar formulário.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowLogo height={44} />
          </Link>
          <PublicHeaderNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Header / Banner */}
        <div className="space-y-4 text-center md:text-left border-b border-border/50 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="size-4" />
            Conformidade LGPD (Lei nº 13.709/2018 — Art. 18)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Solicitação de Direitos do Titular de Dados
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Canal oficial para exercício de direitos garantidos pela Lei Geral de Proteção de Dados Pessoais perante o Encarregado de Dados (DPO) da Flow Hub.
          </p>
        </div>

        {/* Informações sobre Papéis e Instruções */}
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <h2 className="font-semibold text-foreground text-base">Seus Direitos Garantidos (Art. 18)</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Como titular, você possui o direito de solicitar confirmação de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, portabilidade, anonimização ou eliminação de dados desnecessários, além da revogação do consentimento.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HelpCircle className="size-5" />
            </div>
            <h2 className="font-semibold text-foreground text-base">Quem deve receber sua solicitação?</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Se você conversou via WhatsApp com uma empresa que utiliza o Flow Hub, essa empresa é a <strong>Controladora</strong> dos seus dados. Recomendamos contatá-la diretamente. De qualquer forma, este canal recebe e orienta o encaminhamento adequado com total transparência.
            </p>
          </div>
        </div>

        {/* Formulário de Envio */}
        <div className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Formulário de Solicitação ao DPO
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Preencha os campos abaixo com atenção. Sua solicitação será registrada e notificada diretamente ao nosso Encarregado de Proteção de Dados.
            </p>
          </div>

          {successId ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 space-y-3 text-center md:text-left">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-7 shrink-0" />
                <div>
                  <h3 className="font-semibold text-base text-foreground">Solicitação Registrada com Sucesso!</h3>
                  <p className="text-xs text-muted-foreground">
                    Código de identificação: <code className="font-mono text-primary font-bold">{successId}</code>
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-emerald-500/20">
                Nosso Encarregado de Dados (DPO) foi notificado e responderá no e-mail informado no prazo legal previsto pela LGPD. Caso precise complementar informações, entre em contato diretamente pelo e-mail{" "}
                <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline font-medium">
                  flowsystems@flowofc.com.br
                </a>.
              </p>
              <button
                onClick={() => setSuccessId(null)}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Nova Solicitação
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium text-xs text-foreground">
                    Seu Nome Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block font-medium text-xs text-foreground">
                    E-mail para Contato e Resposta *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="requestType" className="block font-medium text-xs text-foreground">
                  Tipo de Solicitação *
                </label>
                <select
                  id="requestType"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="acesso">1. Confirmação de tratamento e Acesso aos Dados</option>
                  <option value="correcao">2. Correção de Dados incompletos, inexatos ou desatualizados</option>
                  <option value="eliminacao">3. Eliminação / Esquecimento de Dados Pessoais</option>
                  <option value="portabilidade">4. Portabilidade dos Dados (Exportação)</option>
                  <option value="oposicao">5. Revogação de Consentimento ou Oposição ao Tratamento</option>
                  <option value="outro">6. Outras Dúvidas ou Solicitações ao DPO</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium text-xs text-foreground">
                  Descrição Detalhada do Pedido *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Descreva com clareza o seu pedido, incluindo detalhes que ajudem a localizar o registro (ex: número de telefone do WhatsApp ou empresa com quem conversou)."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Campos com * são de preenchimento obrigatório.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Enviar Solicitação ao DPO
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Informações de Contato Direto do DPO */}
        <section className="p-5 rounded-2xl border border-border bg-muted/20 text-xs text-muted-foreground space-y-2">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            Contato Direto do Encarregado pelo Tratamento de Dados Pessoais (DPO)
          </h3>
          <p>
            FLOW SYSTEMS LTDA — CNPJ 62.479.299/0001-66<br />
            Encarregado (DPO):{" "}
            <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline font-medium">
              flowsystems@flowofc.com.br
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
