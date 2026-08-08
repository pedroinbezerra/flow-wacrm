'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileCheck2, Info } from 'lucide-react';

interface StepTemplateSelectProps {
  templateName?: string | null;
  templateId?: string | null;
  onChange: (fields: { templateName?: string | null; templateId?: string | null }) => void;
}

const MOCK_TEMPLATES = [
  {
    id: 'tpl_doc_001',
    name: 'document_delivery_default',
    displayName: 'envio_documento_cliente (Aprovado pela Meta)',
    headerType: 'DOCUMENT',
    bodyText: 'Olá {{1}}, seu documento ({{2}}) já está disponível. Segue anexo em PDF.',
  },
  {
    id: 'tpl_doc_002',
    name: 'fatura_mensal_pdf',
    displayName: 'envio_fatura_mensal (Aprovado pela Meta)',
    headerType: 'DOCUMENT',
    bodyText: 'Prezado(a) {{1}}, enviamos em anexo a sua fatura deste mês. Qualquer dúvida, responda a esta mensagem.',
  },
  {
    id: 'tpl_doc_003',
    name: 'holerite_demais_documentos',
    displayName: 'envio_holerite_seguro (Aprovado pela Meta)',
    headerType: 'DOCUMENT',
    bodyText: 'Olá {{1}}, o seu comprovante de rendimentos foi gerado com sucesso. Confira o arquivo em anexo.',
  },
];

export function StepTemplateSelect({
  templateName,
  templateId,
  onChange,
}: StepTemplateSelectProps) {
  const currentTpl = MOCK_TEMPLATES.find((t) => t.name === templateName) || MOCK_TEMPLATES[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <FileCheck2 className="h-6 w-6 text-emerald-500" />
          Passo 5: Selecione o Template Aprovado na Meta
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          O envio de documentos no WhatsApp exige a utilização de templates aprovados com suporte a anexo de mídia.
        </p>
      </div>

      <div className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="templateSelect">Template Aprovado</Label>
          <Select
            value={templateName || currentTpl.name}
            onValueChange={(val) => {
              const selected = MOCK_TEMPLATES.find((t) => t.name === val);
              onChange({
                templateName: val,
                templateId: selected?.id || '',
              });
            }}
          >
            <SelectTrigger id="templateSelect" className="w-full">
              <SelectValue placeholder="Selecione um template aprovado" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_TEMPLATES.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.name}>
                  {tpl.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Preview Card */}
        <Card className="p-5 border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pré-visualização da Mensagem Meta
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Cabeçalho: DOCUMENT PDF
            </span>
          </div>

          <div className="p-3 bg-card border rounded-lg space-y-2 text-sm">
            <div className="p-2 rounded bg-muted/60 border border-dashed text-xs text-muted-foreground flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              <span>[ Anexo do Documento em PDF do Cliente ]</span>
            </div>
            <p className="text-foreground leading-relaxed">
              {currentTpl.bodyText}
            </p>
          </div>
        </Card>

        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Mapeamento Dinâmico de Variáveis:</p>
            <p className="mt-0.5">
              O FlowHub preenche automaticamente a variável <code className="bg-emerald-500/20 px-1 py-0.5 rounded">{"{{1}}"}</code> com o Nome do Cliente e anexa o PDF baixado temporariamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
