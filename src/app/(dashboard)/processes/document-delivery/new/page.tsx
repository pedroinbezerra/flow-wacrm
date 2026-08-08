'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { StepSourceSelect } from '@/components/document-delivery/wizard/step-source-select';
import { StepFolderSelect } from '@/components/document-delivery/wizard/step-folder-select';
import { StepIdentificationRules } from '@/components/document-delivery/wizard/step-identification-rules';
import { StepChannelSelect } from '@/components/document-delivery/wizard/step-channel-select';
import { StepTemplateSelect } from '@/components/document-delivery/wizard/step-template-select';
import { StepReviewActivate } from '@/components/document-delivery/wizard/step-review-activate';
import { DocumentSourceType, ExtractionRules, DeliveryChannel } from '@/lib/document-delivery/types';

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [processName, setProcessName] = useState('');
  const [sourceType, setSourceType] = useState<DocumentSourceType>('google_drive');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  useEffect(() => {
    const connectedParam = searchParams.get('connected');
    if (connectedParam === 'google_drive') {
      setIsConnected(true);
      setSourceType('google_drive');
      setCurrentStep(2); // Automatically advance to folder selection step after OAuth success!
    }
  }, [searchParams]);

  const [folderName, setFolderName] = useState('');
  const [folderId, setFolderId] = useState('');
  const [filePattern, setFilePattern] = useState('*.pdf');
  const [rules, setRules] = useState<ExtractionRules>({
    cpf_cnpj_in_filename: true,
    enable_ocr: true,
    enable_ai: false,
  });
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [channels, setChannels] = useState<DeliveryChannel[]>(['whatsapp']);
  const [templateName, setTemplateName] = useState('document_delivery_default');
  const [templateId, setTemplateId] = useState('tpl_doc_001');

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveAndActivate = async (activateNow: boolean) => {
    setIsSaving(true);
    try {
      const payload = {
        name: processName || `Processo ${sourceType.replace('_', ' ')}`,
        status: activateNow ? 'active' : 'draft',
        source_type: sourceType,
        folder_name: folderName,
        folder_id: folderId,
        file_pattern: filePattern,
        extraction_rules: rules,
        confidence_threshold: confidenceThreshold,
        delivery_channels: channels,
        whatsapp_template_name: templateName,
        whatsapp_template_id: templateId,
      };

      const res = await fetch('/api/processes/document-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/processes/document-delivery');
      } else {
        alert('Erro ao salvar o processo.');
      }
    } catch (err) {
      console.error('Failed to create process:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/processes/document-delivery">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Assistente de Entrega Automática de Documentos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Etapa {currentStep} de 6 — Configuração rápida orientada ao resultado
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / 6) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[380px] bg-card p-6 border rounded-xl shadow-sm">
        {currentStep === 1 && (
          <StepSourceSelect
            selectedSource={sourceType}
            isConnected={isConnected}
            connectedAccount={connectedAccount}
            errorParam={searchParams.get('error')}
            onSelect={(src) => {
              setSourceType(src);
              setIsConnected(false);
              setConnectedAccount(null);
            }}
            onConnect={() => {
              setIsConnected(true);
              setConnectedAccount('empresa@suadominio.com');
            }}
            onDisconnect={() => {
              setIsConnected(false);
              setConnectedAccount(null);
              setFolderName('');
              setFolderId('');
            }}
          />
        )}

        {currentStep === 2 && (
          <StepFolderSelect
            sourceType={sourceType}
            isConnected={isConnected}
            folderName={folderName}
            folderId={folderId}
            filePattern={filePattern}
            onGoBackToStep1={() => setCurrentStep(1)}
            onChange={(f) => {
              if (f.folderName !== undefined) setFolderName(f.folderName);
              if (f.folderId !== undefined) setFolderId(f.folderId);
              if (f.filePattern !== undefined) setFilePattern(f.filePattern);
            }}
          />
        )}

        {currentStep === 3 && (
          <StepIdentificationRules
            rules={rules}
            confidenceThreshold={confidenceThreshold}
            onChange={(f) => {
              if (f.rules) setRules(f.rules);
              if (f.confidenceThreshold !== undefined) setConfidenceThreshold(f.confidenceThreshold);
            }}
          />
        )}

        {currentStep === 4 && (
          <StepChannelSelect
            selectedChannels={channels}
            onSelect={(c) => setChannels(c)}
          />
        )}

        {currentStep === 5 && (
          <StepTemplateSelect
            templateName={templateName}
            templateId={templateId}
            onChange={(f) => {
              if (f.templateName) setTemplateName(f.templateName);
              if (f.templateId) setTemplateId(f.templateId);
            }}
          />
        )}

        {currentStep === 6 && (
          <StepReviewActivate
            processName={processName}
            sourceType={sourceType}
            folderName={folderName}
            filePattern={filePattern}
            rules={rules}
            confidenceThreshold={confidenceThreshold}
            channels={channels}
            templateName={templateName}
            isSaving={isSaving}
            onNameChange={setProcessName}
            onActivate={handleSaveAndActivate}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSaving}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {currentStep < 6 && (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-primary text-primary-foreground gap-2 font-semibold px-6"
          >
            Próximo Passo
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewDocumentDeliveryProcessWizard() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando assistente...</div>}>
      <WizardContent />
    </React.Suspense>
  );
}
