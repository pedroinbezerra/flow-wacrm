'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Check, MessageSquare, Mail, Layers } from 'lucide-react';
import { DeliveryChannel } from '@/lib/document-delivery/types';

interface StepChannelSelectProps {
  selectedChannels: DeliveryChannel[];
  onSelect: (channels: DeliveryChannel[]) => void;
}

export function StepChannelSelect({ selectedChannels, onSelect }: StepChannelSelectProps) {
  const toggleChannel = (channel: DeliveryChannel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length === 1) return; // Must keep at least one
      onSelect(selectedChannels.filter((c) => c !== channel));
    } else {
      onSelect([...selectedChannels, channel]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Passo 4: Selecione o canal de envio
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha os meios oficiais pelos quais os documentos serão entregues aos seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <Card
          onClick={() => toggleChannel('whatsapp')}
          className={`p-5 cursor-pointer border-2 relative transition-all duration-200 hover:shadow-md ${
            selectedChannels.includes('whatsapp')
              ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
              : 'border-border'
          }`}
        >
          {selectedChannels.includes('whatsapp') && (
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col items-center text-center py-2 space-y-3">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base">WhatsApp</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Disparo seguro via Templates Aprovados na Meta API Cloud.
              </p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => toggleChannel('email')}
          className={`p-5 cursor-pointer border-2 relative transition-all duration-200 hover:shadow-md ${
            selectedChannels.includes('email')
              ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
              : 'border-border'
          }`}
        >
          {selectedChannels.includes('email') && (
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <Check className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col items-center text-center py-2 space-y-3">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base">E-mail</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Envio com anexo temporário via servidor SMTP ou SendGrid.
              </p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => onSelect(['whatsapp', 'email'])}
          className={`p-5 cursor-pointer border-2 relative transition-all duration-200 hover:shadow-md ${
            selectedChannels.includes('whatsapp') && selectedChannels.includes('email')
              ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10'
              : 'border-border'
          }`}
        >
          {selectedChannels.includes('whatsapp') && selectedChannels.includes('email') && (
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-violet-500 text-white flex items-center justify-center">
              <Check className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col items-center text-center py-2 space-y-3">
            <div className="p-3 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Ambos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Entrega simultânea via WhatsApp e E-mail para máxima cobertura.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
