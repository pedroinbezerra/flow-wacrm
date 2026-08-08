'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck, Folder, MessageSquare, Play, Lock } from 'lucide-react';
import { DocumentSourceType, ExtractionRules, DeliveryChannel } from '@/lib/document-delivery/types';

interface StepReviewActivateProps {
  processName: string;
  sourceType: DocumentSourceType;
  folderName: string;
  filePattern: string;
  rules: ExtractionRules;
  confidenceThreshold: number;
  channels: DeliveryChannel[];
  templateName: string;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onActivate: (activateNow: boolean) => void;
}

export function StepReviewActivate({
  processName,
  sourceType,
  folderName,
  filePattern,
  rules,
  confidenceThreshold,
  channels,
  templateName,
  isSaving,
  onNameChange,
  onActivate,
}: StepReviewActivateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          Passo 6: Revisão e Ativação do Processo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confira o resumo do seu novo processo de entrega de documentos. Por segurança, novos processos entram desligados por padrão (FH-54.03).
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="processName" className="font-semibold">
            Nome do Processo
          </Label>
          <Input
            id="processName"
            value={processName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Entrega Automática de Holerites Mensais"
            className="text-base font-medium"
          />
        </div>

        <Card className="p-5 border space-y-4 bg-muted/20">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">
            Resumo da Configuração
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Folder className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Origem & Pasta:</span>
                <span className="text-muted-foreground capitalize">{sourceType.replace('_', ' ')}</span> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{folderName || 'Pasta Raiz'}</code>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Identificação & Limite:</span>
                <span className="text-muted-foreground">
                  {rules.cpf_cnpj_in_filename !== false ? 'CPF/CNPJ no Arquivo' : 'Regras Personalizadas'}
                  {rules.enable_ai ? ' + IA' : ''} ({Math.round(confidenceThreshold * 100)}% mín.)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Canais de Envio:</span>
                <span className="text-muted-foreground uppercase">{channels.join(' & ')}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground">Template Meta:</span>
                <span className="text-muted-foreground font-mono text-xs">{templateName || 'document_delivery_default'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Activation Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            disabled={isSaving || !processName.trim()}
            onClick={() => onActivate(true)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 px-6 py-5"
          >
            <Play className="h-4 w-4 fill-current" />
            {isSaving ? 'Salvando...' : 'Salvar e Ativar Agora'}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSaving || !processName.trim()}
            onClick={() => onActivate(false)}
            className="w-full sm:w-auto gap-2 px-6 py-5"
          >
            {isSaving ? 'Salvando...' : 'Salvar Rascunho (Desligado)'}
          </Button>
        </div>
      </div>
    </div>
  );
}
