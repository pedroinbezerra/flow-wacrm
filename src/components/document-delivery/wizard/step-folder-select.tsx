'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Folder,
  FolderOpen,
  FileCode,
  Info,
  ChevronRight,
  Home,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Edit3,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { DocumentSourceType } from '@/lib/document-delivery/types';

interface FolderItem {
  id: string;
  name: string;
  item_count?: number;
  has_subfolders?: boolean;
  updated_at?: string;
}

interface FolderBreadcrumb {
  id: string;
  name: string;
}

interface StepFolderSelectProps {
  sourceType: DocumentSourceType;
  isConnected: boolean;
  folderName: string;
  folderId: string;
  filePattern: string;
  onChange: (fields: { folderName?: string; folderId?: string; filePattern?: string }) => void;
  onGoBackToStep1?: () => void;
}

export function StepFolderSelect({
  sourceType,
  isConnected,
  folderName,
  folderId,
  filePattern,
  onChange,
  onGoBackToStep1,
}: StepFolderSelectProps) {
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([
    { id: 'root', name: 'Repositório Principal' },
  ]);
  const [currentFolder, setCurrentFolder] = useState<FolderBreadcrumb>({
    id: 'root',
    name: 'Repositório Principal',
  });
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [manualMode, setManualMode] = useState(false);

  const fetchFolders = useCallback(
    async (parentId: string) => {
      if (!isConnected && sourceType !== 'webhook') return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/processes/document-delivery/folders?source_type=${sourceType}&parent_id=${parentId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.connected === false) {
            setFolders([]);
          } else {
            setFolders(data.folders || []);
            if (data.current_folder) {
              setCurrentFolder(data.current_folder);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load folders:', err);
      } finally {
        setLoading(false);
      }
    },
    [sourceType, isConnected]
  );

  useEffect(() => {
    if (isConnected) {
      fetchFolders('root');
    }
  }, [fetchFolders, isConnected]);

  const handleEnterFolder = (item: FolderItem) => {
    setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    fetchFolders(item.id);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    if (!target) return;
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    fetchFolders(target.id);
  };

  const handleSelectFolder = (id: string, name: string) => {
    onChange({ folderId: id, folderName: name });
  };

  // If not connected and not webhook, show clear Connection Required screen!
  if (!isConnected && sourceType !== 'webhook') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Passo 2: Seleção de Pasta Monitorada
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            É necessário conectar a conta do repositório antes de listar os diretórios.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-amber-950 dark:text-amber-100">
              Repositório Desconectado
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O FlowHub não pode listar pastas sem que haja autorização prévia da conta no Passo 1. Por segurança, nenhuma pasta fictícia é exibida sem autenticação.
            </p>
          </div>

          {onGoBackToStep1 && (
            <Button
              onClick={onGoBackToStep1}
              className="bg-primary text-primary-foreground text-xs gap-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Passo 1 e Conectar Conta
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Passo 2: Navegue e selecione a pasta monitorada
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Navegue livremente pelas pastas da sua conta conectada e selecione a localização dos arquivos.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Edit3 className="size-3.5" />
          {manualMode ? 'Usar Navegador de Pastas' : 'Entrada Manual de Caminho'}
        </Button>
      </div>

      {!manualMode ? (
        <div className="space-y-4">
          {/* Breadcrumb Bar */}
          <div className="flex items-center flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateBreadcrumb(0)}
              className="h-6 px-2 text-xs font-medium gap-1 text-foreground hover:bg-muted"
            >
              <Home className="size-3 text-primary" />
              Raiz
            </Button>
            {breadcrumbs.slice(1).map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigateBreadcrumb(idx + 1)}
                  className={`h-6 px-2 text-xs font-medium truncate max-w-[140px] ${
                    idx === breadcrumbs.length - 2
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {crumb.name}
                </Button>
              </React.Fragment>
            ))}
          </div>

          {/* Active Selection Display */}
          {folderName ? (
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-muted-foreground">Pasta Selecionada: </span>
                  <span className="font-semibold text-emerald-950 dark:text-emerald-100">{folderName}</span>
                  {folderId && <span className="font-mono text-[10px] text-muted-foreground ml-2">({folderId})</span>}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectFolder('', '')}
                className="h-7 text-[11px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              >
                Trocar Pasta
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <Info className="size-4 shrink-0" />
              <span>Nenhuma pasta selecionada ainda. Clique em uma pasta abaixo para adentrar ou selecionar.</span>
            </div>
          )}

          {/* Folder Tree Listing Container */}
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Pastas em &quot;{currentFolder.name}&quot;</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchFolders(currentFolder.id)}
                disabled={loading}
                className="h-6 px-2 text-[11px] gap-1"
              >
                <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs">Carregando diretórios reais da API do repositório...</span>
              </div>
            ) : folders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                <FolderOpen className="size-8 mx-auto text-muted-foreground/40" />
                <p>Nenhuma subpasta encontrada nesta localização.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectFolder(currentFolder.id, currentFolder.name)}
                  className="text-xs mt-2"
                >
                  Selecionar esta pasta ({currentFolder.name})
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {folders.map((item) => {
                  const isCurrentSelected = folderId === item.id || folderName === item.name;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center justify-between transition-colors hover:bg-muted/40 ${
                        isCurrentSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => (item.has_subfolders !== false ? handleEnterFolder(item) : handleSelectFolder(item.id, item.name))}
                        className="flex items-center gap-3 min-w-0 text-left group cursor-pointer flex-1"
                      >
                        <div className={`p-2 rounded-lg ${isCurrentSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                          <Folder className="size-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block truncate">
                            {item.name}
                          </span>
                          {item.item_count !== undefined && (
                            <span className="text-[11px] text-muted-foreground">
                              {item.item_count} arquivos encontrados
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant={isCurrentSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSelectFolder(item.id, item.name)}
                          className="h-7 text-xs font-medium px-3"
                        >
                          {isCurrentSelected ? 'Selecionada' : 'Selecionar'}
                        </Button>

                        {item.has_subfolders !== false && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEnterFolder(item)}
                            title="Entrar na pasta"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Manual Path Mode Fallback */
        <div className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="folderName" className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-primary" />
              Nome da Pasta Monitorada
            </Label>
            <Input
              id="folderName"
              placeholder="Ex: Faturas_2026 ou Holerites_Clientes"
              value={folderName}
              onChange={(e) => onChange({ folderName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folderId" className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              ID da Pasta / Caminho (Opcional)
            </Label>
            <Input
              id="folderId"
              placeholder="Ex: 1A2b3C4d5E6f7G8h9I0j"
              value={folderId}
              onChange={(e) => onChange({ folderId: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* File Pattern Filter */}
      <div className="space-y-2 max-w-xl pt-2 border-t">
        <Label htmlFor="filePattern" className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          Filtro de Padrão de Arquivo
        </Label>
        <Input
          id="filePattern"
          placeholder="Ex: *.pdf ou *.png"
          value={filePattern}
          onChange={(e) => onChange({ filePattern: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Apenas arquivos que corresponderem ao padrão serão lidos durante as rodadas de sincronização.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-3 mt-4">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Privacidade Garantida:</p>
          <p className="mt-0.5">
            O FlowHub nunca armazena o conteúdo dos seus documentos. O arquivo é lido temporariamente durante o disparo e descartado imediatamente em seguida.
          </p>
        </div>
      </div>
    </div>
  );
}
