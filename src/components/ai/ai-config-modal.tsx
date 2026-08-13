"use client";

import { useEffect, useState } from "react";
import { Sparkles, Key, Globe, Cpu, Sliders, CheckCircle2, AlertTriangle, Shield, RefreshCw, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { hasMinRole } from "@/lib/auth/roles";

const DEFAULT_OPENAI_URL = "https://api.openai.com/v1";

const PROVIDER_PRESETS: { label: string; url: string; defaultModel: string }[] = [
  { label: "OpenAI (Padrão)", url: DEFAULT_OPENAI_URL, defaultModel: "gpt-4o-mini" },
  { label: "OpenRouter", url: "https://openrouter.ai/api/v1", defaultModel: "anthropic/claude-3.5-sonnet" },
  { label: "Groq", url: "https://api.groq.com/openai/v1", defaultModel: "llama-3.3-70b-versatile" },
  { label: "DeepSeek", url: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  { label: "Personalizado / Local Proxy", url: "", defaultModel: "custom" },
];

const MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Rápido e Econômico)" },
  { value: "gpt-4o", label: "GPT-4o (Avançado)" },
  { value: "deepseek-chat", label: "DeepSeek Chat V3" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (via OpenRouter)" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (via Groq)" },
];

export interface AIConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AIConfigModal({ open, onOpenChange, onSuccess }: AIConfigModalProps) {
  const { accountRole, isSuperAdmin } = useAuth();
  const canManageAI = Boolean(isSuperAdmin || (accountRole && hasMinRole(accountRole, "admin")));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiUrl, setApiUrl] = useState(DEFAULT_OPENAI_URL);
  const [customProviderConfirmed, setCustomProviderConfirmed] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(500);

  const isCustomProvider = apiUrl.trim() !== DEFAULT_OPENAI_URL;

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/ai-assistant/config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setHasKey(data.config.has_key || false);
          setMaskedKey(data.config.openai_api_key_masked || "");
          setApiUrl(data.config.openai_api_url || DEFAULT_OPENAI_URL);
          setModel(data.config.openai_model || "gpt-4o-mini");
          setTemperature(Number(data.config.temperature ?? 0.3));
          setMaxTokens(Number(data.config.max_tokens ?? 500));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configurações de IA:", err);
    }
  };

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    fetch("/api/ai-assistant/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        setCustomProviderConfirmed(false);
        if (data?.config) {
          setHasKey(data.config.has_key || false);
          setMaskedKey(data.config.openai_api_key_masked || "");
          setApiUrl(data.config.openai_api_url || DEFAULT_OPENAI_URL);
          setModel(data.config.openai_model || "gpt-4o-mini");
          setTemperature(Number(data.config.temperature ?? 0.3));
          setMaxTokens(Number(data.config.max_tokens ?? 500));
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar configurações de IA:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSelectPreset = (url: string) => {
    if (!url) return;
    setApiUrl(url);
    setCustomProviderConfirmed(false);
    const preset = PROVIDER_PRESETS.find((p) => p.url === url);
    if (preset && preset.defaultModel !== "custom") {
      setModel(preset.defaultModel);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput && !hasKey) {
      toast.error("Insira uma chave de API para testar a conexão.");
      return;
    }

    setTesting(true);
    try {
      // Salvar primeiro se houver nova chave digitada
      if (apiKeyInput.trim()) {
        await handleSave(true);
      }

      // Testar via endpoint de validação
      const res = await fetch("/api/admin/consumption/ai-insights", { method: "POST" });
      if (res.ok) {
        toast.success("Conexão com o provedor de IA validada com sucesso!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Falha ao validar conexão com o provedor de IA.");
      }
    } catch {
      toast.error("Erro ao testar conexão de IA.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!canManageAI) {
      toast.error("Apenas Administradores ou Super Admins podem salvar a configuração de IA.");
      return;
    }

    if (isCustomProvider && !customProviderConfirmed) {
      toast.error("É necessário confirmar a responsabilidade pelo provedor de IA customizado.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        openai_api_url: apiUrl.trim(),
        openai_model: model,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
      };

      if (apiKeyInput.trim()) {
        payload.openai_api_key = apiKeyInput.trim();
      }

      const res = await fetch("/api/ai-assistant/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (!silent) {
          toast.success("Configurações de Inteligência Artificial salvas com sucesso!");
          onSuccess?.();
          onOpenChange(false);
        }
        setApiKeyInput("");
        await fetchConfig();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar configurações de IA.");
      }
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Configuração de Inteligência Artificial</DialogTitle>
              <DialogDescription className="text-xs">
                Chave de API (BYOK), provedor de LLM e parâmetros de inferência do Flow Hub
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!canManageAI ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Shield className="h-4 w-4" />
              <span>Acesso Restrito</span>
            </div>
            <p className="text-xs">
              Apenas usuários com papel de <strong>Proprietário (Owner)</strong>, <strong>Administrador</strong> ou <strong>Super Admin</strong> possuem permissão para alterar as chaves de API e modelos de Inteligência Artificial.
            </p>
          </div>
        ) : loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
            Carregando configurações de IA...
          </div>
        ) : (
          <div className="space-y-4 py-2 text-sm">
            {/* Presets de Provedor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Provedor de IA / Preset
              </Label>
              <Select value={apiUrl} onValueChange={(val: string | null) => val && handleSelectPreset(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_PRESETS.map((preset) => (
                    <SelectItem key={preset.url || "custom"} value={preset.url || "custom"} className="text-xs">
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Base URL Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Base URL (Endpoint API)</Label>
              <Input
                value={apiUrl}
                onChange={(e) => {
                  setApiUrl(e.target.value);
                  setCustomProviderConfirmed(false);
                }}
                placeholder="https://api.openai.com/v1"
                className="text-xs font-mono"
              />
            </div>

            {/* Aviso de Provedor Customizado / Externo */}
            {isCustomProvider && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>Provedor de IA Externo / Customizado</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Você está usando um provedor de IA diferente da OpenAI oficial. A Flow Hub não tem relação contratual nem visibilidade sobre esse fornecedor — a responsabilidade pela contratação, segurança e uso dos dados enviados a ele é sua.
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                  <Checkbox
                    id="modal-confirm-custom-provider"
                    checked={customProviderConfirmed}
                    onCheckedChange={(checked) => setCustomProviderConfirmed(Boolean(checked))}
                  />
                  <Label htmlFor="modal-confirm-custom-provider" className="text-xs font-medium cursor-pointer text-foreground">
                    Estou ciente e assumo a responsabilidade por este provedor externo
                  </Label>
                </div>
              </div>
            )}

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  Chave de API (BYOK - Bring Your Own Key)
                </Label>
                {hasKey && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Chave Configurada ({maskedKey})
                  </Badge>
                )}
              </div>
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={hasKey ? "Digite uma nova chave para substituir a atual..." : "sk-..."}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                A chave é criptografada e armazenada de forma segura.
              </p>
            </div>

            {/* Modelo de IA */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Modelo de IA Padrão
              </Label>
              <Select value={model} onValueChange={(val: string | null) => val && setModel(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                  {!MODEL_OPTIONS.some((m) => m.value === model) && (
                    <SelectItem value={model} className="text-xs">
                      Personalizado: {model}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Parâmetros: Temperatura e Max Tokens */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    Temperatura ({temperature})
                  </Label>
                  <Popover>
                    <PopoverTrigger className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded">
                      <Info className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-72 p-3 space-y-2 text-xs">
                      <PopoverHeader>
                        <PopoverTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                          <Sliders className="h-3.5 w-3.5" /> O que é a Temperatura?
                        </PopoverTitle>
                      </PopoverHeader>
                      <PopoverDescription className="text-xs leading-relaxed text-muted-foreground">
                        Define a <strong>criatividade e aleatoriedade</strong> das respostas:
                      </PopoverDescription>
                      <div className="space-y-1 text-[11px]">
                        <div className="p-1.5 rounded bg-muted/60">
                          <span className="font-semibold text-foreground">0.1 a 0.3 (SAC): </span>
                          <span>Respostas precisas e sem inventar dados fora da Base de Conhecimento.</span>
                        </div>
                        <div className="p-1.5 rounded bg-muted/60">
                          <span className="font-semibold text-foreground">0.7 a 1.0+: </span>
                          <span>Respostas variadas e mais criativas.</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1.5"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.3)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold">Tokens Máximos ({maxTokens})</Label>
                  <Popover>
                    <PopoverTrigger className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded">
                      <Info className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-72 p-3 space-y-2 text-xs">
                      <PopoverHeader>
                        <PopoverTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                          <Cpu className="h-3.5 w-3.5" /> O que são Tokens Máximos?
                        </PopoverTitle>
                      </PopoverHeader>
                      <PopoverDescription className="text-xs leading-relaxed text-muted-foreground">
                        Limita o <strong>comprimento máximo da mensagem</strong> enviada pela IA (1 token ≈ 4 caracteres):
                      </PopoverDescription>
                      <div className="space-y-1 text-[11px]">
                        <div className="p-1.5 rounded bg-muted/60">
                          <span className="font-semibold text-foreground">500 Tokens (~350 palavras): </span>
                          <span>Respostas ágeis no WhatsApp sem mensagens longas.</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  type="number"
                  step="100"
                  min="100"
                  max="4000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 500)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing || loading || !canManageAI}
            className="w-full sm:w-auto text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testando..." : "Testar Conexão"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>

            {canManageAI && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={saving || loading || (isCustomProvider && !customProviderConfirmed)}
                className="text-xs bg-primary"
              >
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AIConfigButton({ className, label = "Configurar IA" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
        {label}
      </Button>

      <AIConfigModal open={open} onOpenChange={setOpen} />
    </>
  );
}
