'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentDeliveryPendency } from '@/lib/document-delivery/types';
import { FileText, AlertCircle, Check, X, UserCheck } from 'lucide-react';

interface PendencyCardProps {
  pendency: DocumentDeliveryPendency;
  onResolve: (id: string, action: 'approve' | 'reject', contactId?: string) => Promise<void>;
}

export function PendencyCard({ pendency, onResolve }: PendencyCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onResolve(pendency.id, 'approve', pendency.suggested_contact_id || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onResolve(pendency.id, 'reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-5 border-l-4 border-l-amber-500 space-y-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground leading-tight">{pendency.file_name}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              {pendency.failure_reason}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs shrink-0">
          Confiança: {Math.round(pendency.confidence_score * 100)}%
        </Badge>
      </div>

      {pendency.suggested_recipient_name && (
        <div className="p-3 rounded-lg bg-muted/40 border text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-semibold block text-foreground">Destinatário Sugerido:</span>
              <span className="text-muted-foreground">{pendency.suggested_recipient_name} ({pendency.suggested_recipient_phone || 'Sem telefone'})</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={handleReject}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
        >
          <X className="h-4 w-4" />
          Rejeitar
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isSubmitting}
          onClick={handleApprove}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? 'Processando...' : 'Aprovar e Enviar'}
        </Button>
      </div>
    </Card>
  );
}
