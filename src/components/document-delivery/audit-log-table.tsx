'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DocumentDeliveryAuditLog } from '@/lib/document-delivery/types';
import { Sparkles, FileText, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface AuditLogTableProps {
  logs: DocumentDeliveryAuditLog[];
  isLoading?: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Carregando trilha de auditoria...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Nenhum registro de auditoria encontrado. Os disparos e leituras aparecerão aqui em tempo real.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[160px]">Data / Hora</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Estratégia</TableHead>
            <TableHead>Destinatário Identificado</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Confiança</TableHead>
            <TableHead className="text-right">Status do Envio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const formattedDate = new Date(log.created_at).toLocaleString('pt-BR');

            return (
              <TableRow key={log.id} className="hover:bg-muted/30">
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {formattedDate}
                </TableCell>
                <TableCell className="font-medium text-xs flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate max-w-[200px]" title={log.file_name}>
                    {log.file_name}
                  </span>
                </TableCell>
                <TableCell>
                  {log.ai_used ? (
                    <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 text-[10px] gap-1">
                      <Sparkles className="h-3 w-3" />
                      IA ({log.ai_model || 'gpt-4o-mini'})
                    </Badge>
                  ) : log.extraction_strategy === 'ocr' ? (
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px]">
                      OCR Tradicional
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                      Determinística
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {log.identified_recipient_name ? (
                    <div>
                      <span className="font-semibold block text-foreground">{log.identified_recipient_name}</span>
                      <span className="text-muted-foreground text-[10px]">{log.identified_recipient_phone || ''}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Não identificado</span>
                  )}
                </TableCell>
                <TableCell className="text-xs uppercase font-mono font-medium text-muted-foreground">
                  {log.delivery_channel}
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  <span className={log.confidence_score >= 0.85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {Math.round(log.confidence_score * 100)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {log.delivery_status === 'sent' && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enviado
                    </Badge>
                  )}
                  {log.delivery_status === 'pending_review' && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1">
                      <Clock className="h-3 w-3" />
                      Retido p/ Revisão
                    </Badge>
                  )}
                  {log.delivery_status === 'rejected' && (
                    <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 gap-1">
                      <XCircle className="h-3 w-3" />
                      Rejeitado
                    </Badge>
                  )}
                  {log.delivery_status === 'failed' && (
                    <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Falha
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
