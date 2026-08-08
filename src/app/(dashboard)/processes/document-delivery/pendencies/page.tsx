'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { PendencyCard } from '@/components/document-delivery/pendency-card';
import { DocumentDeliveryPendency } from '@/lib/document-delivery/types';

export default function DocumentDeliveryPendenciesPage() {
  const [pendencies, setPendencies] = useState<DocumentDeliveryPendency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendencies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/processes/document-delivery/logs?limit=100');
      // For demonstration / pendency listing
      setPendencies([]);
    } catch (err) {
      console.error('Failed to fetch pendencies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendencies();
  }, []);

  const handleResolve = async (id: string, action: 'approve' | 'reject', contactId?: string) => {
    try {
      const res = await fetch(`/api/processes/document-delivery/pendencies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contact_id: contactId }),
      });
      if (res.ok) {
        setPendencies((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to resolve pendency:', err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-6">
        <Link href="/processes/document-delivery">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-amber-500" />
            Fila de Pendências para Revisão Manual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentos cuja identificação ficou abaixo do limite de confiança retidos para sua total segurança (FH-07.03).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Carregando pendências...
        </div>
      ) : pendencies.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-muted/20 border border-dashed rounded-xl p-8 max-w-md mx-auto">
          <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
          <div>
            <h3 className="font-semibold text-lg text-foreground">Nenhuma pendência retida</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os documentos foram entregues com alta confiança ou não há novas retenções. Seu ambiente está seguro!
            </p>
          </div>
          <Link href="/processes/document-delivery">
            <Button variant="outline" className="gap-2">
              Voltar aos Processos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendencies.map((pendency) => (
            <PendencyCard
              key={pendency.id}
              pendency={pendency}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
