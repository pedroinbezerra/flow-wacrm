'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ExtractionRules } from '@/lib/document-delivery/types';
import { ShieldCheck, FileSearch, Sparkles, AlertTriangle } from 'lucide-react';

interface StepIdentificationRulesProps {
  rules: ExtractionRules;
  confidenceThreshold: number;
  onChange: (fields: { rules?: ExtractionRules; confidenceThreshold?: number }) => void;
}

export function StepIdentificationRules({
  rules,
  confidenceThreshold,
  onChange,
}: StepIdentificationRulesProps) {
  const updateRule = (key: keyof ExtractionRules, value: any) => {
    onChange({
      rules: {
        ...rules,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          Passo 3: Como devemos identificar o destinatário?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A identificação ocorre da regra mais barata para a mais sofisticada. Se houver qualquer dúvida, o envio é retido para revisão manual.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="font-semibold">Como funciona a identificação com a sua Base do CRM:</p>
          <p className="mt-0.5 leading-relaxed">
            O FlowHub busca o CPF/CNPJ lido diretamente no campo nativo <b>CPF / CNPJ</b> do cadastro de Contatos. Caso o documento seja lido mas o cliente não possua o CPF/CNPJ preenchido, o envio irá para a <b>Fila de Revisão Manual</b> para você vincular com 1 clique.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Tier 1: Regras Determinísticas */}
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium text-base text-foreground cursor-pointer" htmlFor="cpf_cnpj_in_filename">
                CPF ou CNPJ no nome do arquivo (Recomendado)
              </Label>
              <p className="text-xs text-muted-foreground">
                Ex: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">Holerite_12345678901.pdf</code> ou <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">NF_98.765.432/0001-99.pdf</code>
              </p>
            </div>
            <Switch
              id="cpf_cnpj_in_filename"
              checked={rules.cpf_cnpj_in_filename !== false}
              onCheckedChange={(val) => updateRule('cpf_cnpj_in_filename', val)}
            />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium text-base text-foreground cursor-pointer" htmlFor="folder_name_matching">
                CPF/CNPJ no nome da pasta do cliente
              </Label>
              <p className="text-xs text-muted-foreground">
                Identifica o cliente se a pasta possuir seu documento no título.
              </p>
            </div>
            <Switch
              id="folder_name_matching"
              checked={!!rules.folder_name_matching}
              onCheckedChange={(val) => updateRule('folder_name_matching', val)}
            />
          </div>
        </Card>

        {/* Tier 2: OCR */}
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium text-base text-foreground cursor-pointer flex items-center gap-1.5" htmlFor="enable_ocr">
                <FileSearch className="h-4 w-4 text-indigo-500" />
                Leitura por OCR (Conteúdo do PDF / Imagem)
              </Label>
              <p className="text-xs text-muted-foreground">
                Extrai textos contidos no documento caso o nome do arquivo não possua CPF/CNPJ.
              </p>
            </div>
            <Switch
              id="enable_ocr"
              checked={rules.enable_ocr !== false}
              onCheckedChange={(val) => updateRule('enable_ocr', val)}
            />
          </div>
        </Card>

        {/* Tier 3: IA Opcional */}
        <Card className="p-4 border-l-4 border-l-violet-500 bg-violet-500/5 dark:bg-violet-500/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium text-base text-foreground cursor-pointer flex items-center gap-1.5" htmlFor="enable_ai">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Inteligência Artificial (Opcional - Apoio Secundário)
              </Label>
              <p className="text-xs text-muted-foreground">
                A IA é acionada <b>apenas</b> quando as regras determinísticas e o OCR falharem. Envia apenas o texto necessário.
              </p>
            </div>
            <Switch
              id="enable_ai"
              checked={!!rules.enable_ai}
              onCheckedChange={(val) => updateRule('enable_ai', val)}
            />
          </div>
        </Card>

        {/* Confidence Threshold */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="confidenceThreshold" className="font-medium">
              Limite Mínimo de Confiança para Envio Automático
            </Label>
            <span className="text-sm font-semibold text-primary">{Math.round(confidenceThreshold * 100)}%</span>
          </div>
          <Input
            id="confidenceThreshold"
            type="range"
            min="0.5"
            max="0.99"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => onChange({ confidenceThreshold: parseFloat(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            Qualquer identificação com confiança abaixo de {Math.round(confidenceThreshold * 100)}% gerará uma pendência para revisão manual.
          </p>
        </div>
      </div>
    </div>
  );
}
