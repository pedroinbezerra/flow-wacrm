'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  FolderSync,
  Cloud,
  HardDrive,
  Database,
  Server,
  Link2,
  CheckCircle2,
  Lock,
  Loader2,
  Trash2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DocumentSourceType } from '@/lib/document-delivery/types';

interface StepSourceSelectProps {
  selectedSource: DocumentSourceType;
  isConnected: boolean;
  connectedAccount?: string | null;
  errorParam?: string | null;
  onSelect: (source: DocumentSourceType) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const SOURCES: {
  id: DocumentSourceType;
  title: string;
  desc: string;
  icon: any;
  comingSoon?: boolean;
}[] = [
  {
    id: 'google_drive',
    title: 'Google Drive',
    desc: 'Sincronização em tempo real de pastas privadas ou compartilhadas via Google Drive API v3.',
    icon: Cloud,
    comingSoon: false,
  },
  {
    id: 'onedrive',
    title: 'Microsoft OneDrive / SharePoint',
    desc: 'Conexão nativa para diretórios corporativos do Microsoft 365.',
    icon: HardDrive,
    comingSoon: true,
  },
  {
    id: 'dropbox',
    title: 'Dropbox',
    desc: 'Importação de documentos a partir de pastas do Dropbox Business.',
    icon: FolderSync,
    comingSoon: true,
  },
  {
    id: 's3',
    title: 'Amazon S3',
    desc: 'Buckets seguros da AWS com sincronização orientada a eventos.',
    icon: Database,
    comingSoon: true,
  },
  {
    id: 'webhook',
    title: 'Webhook / API Rest Ingest',
    desc: 'Envio direto por requisições de sistemas ERP/CRM legados.',
    icon: Server,
    comingSoon: true,
  },
];

export function StepSourceSelect({
  selectedSource,
  isConnected,
  connectedAccount,
  errorParam,
  onSelect,
  onConnect,
  onDisconnect,
}: StepSourceSelectProps) {
  const [loadingStatus, setLoadingStatus] = useState(false);

  const checkStatus = useCallback(async () => {
    if (selectedSource !== 'google_drive') return;
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/integrations/google-drive/status');
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          onConnect();
        } else {
          onDisconnect();
        }
      }
    } catch (err) {
      console.error('Failed to check Google Drive status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [selectedSource, onConnect, onDisconnect]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const selectedProvider = SOURCES.find((s) => s.id === selectedSource);

  const handleStartOAuthRedirect = () => {
    if (selectedSource === 'google_drive') {
      window.location.href = '/api/integrations/google-drive/auth';
    } else {
      onConnect();
    }
  };

  const handleDisconnectClick = async () => {
    if (selectedSource === 'google_drive') {
      try {
        await fetch('/api/integrations/google-drive', { method: 'DELETE' });
      } catch (err) {
        console.error('Error disconnecting Google Drive:', err);
      }
    }
    onDisconnect();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between">
          <span>Passo 1: Selecione e Conecte o Repositório de Origem</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          O Google Drive está ativo para integração real. Selecione e autorize o acesso à sua conta.
        </p>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOURCES.map((source) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.id && !source.comingSoon;
          const isComingSoon = source.comingSoon;

          return (
            <Card
              key={source.id}
              onClick={() => {
                if (!isComingSoon) {
                  onSelect(source.id);
                }
              }}
              className={`p-5 transition-all duration-200 border-2 relative ${
                isComingSoon
                  ? 'opacity-65 cursor-not-allowed bg-muted/20 border-border'
                  : 'cursor-pointer hover:shadow-md ' +
                    (isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-muted-foreground/30')
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {isComingSoon && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="size-2.5" />
                  Em Breve
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isComingSoon
                      ? 'bg-muted/80 text-muted-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="pr-6">
                  <h3 className="font-medium text-base text-foreground flex items-center gap-2">
                    {source.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{source.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Error Alert when GOOGLE_CLIENT_ID is missing */}
      {errorParam === 'missing_google_client_id' && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100 text-xs space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>Configuração de Variáveis de Ambiente Necessária (GOOGLE_CLIENT_ID)</span>
          </div>
          <p className="leading-relaxed">
            Para habilitar o login e consentimento OAuth 2.0 real com a API do Google Drive, adicione as credenciais do seu projeto no arquivo <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">.env.local</code>:
          </p>
          <pre className="bg-zinc-950 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-zinc-800">
{`GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret`}
          </pre>
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Passo a passo no Google Cloud Console:</p>
            <ol className="list-decimal list-inside space-y-0.5 pl-1">
              <li>Acesse <code className="text-foreground">console.cloud.google.com</code> e ative a <strong>Google Drive API</strong>.</li>
              <li>Vá em <em>APIs e Serviços → Credenciais → Criar Credenciais → ID do cliente OAuth</em>.</li>
              <li>Adicione o URI de Redirecionamento Autorizado: <code className="text-foreground font-mono">http://localhost:3000/api/integrations/google-drive/callback</code>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Real OAuth & Credentials Connection Status Banner for Google Drive */}
      {selectedSource === 'google_drive' && (
        <div
          className={`p-5 rounded-xl border transition-all ${
            isConnected
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {loadingStatus ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0 mt-0.5" />
              ) : isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}

              <div>
                <h4 className="font-semibold text-sm">
                  {isConnected
                    ? `Conta Conectada: Google Drive`
                    : `Autenticação Necessária: Google Drive`}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isConnected
                    ? `Autorizado para o usuário: ${connectedAccount || 'Conta do Google Drive'}. As pastas estão liberadas para navegação no Passo 2.`
                    : `Você será redirecionado para a tela oficial de login e consentimento OAuth 2.0 do Google Drive para autorizar o acesso.`}
                </p>
              </div>
            </div>

            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectClick}
                className="border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs shrink-0 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Desconectar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartOAuthRedirect}
                disabled={loadingStatus}
                className="bg-primary text-primary-foreground text-xs gap-2 font-medium shrink-0 shadow-sm"
              >
                <Link2 className="h-3.5 w-3.5" />
                Conectar Conta do Google Drive (OAuth 2.0)
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
