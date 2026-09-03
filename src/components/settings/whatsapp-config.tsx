'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { META_API_VERSION } from '@/lib/whatsapp/api-version';
import Script from 'next/script';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Zap,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Building2,
  Smartphone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SettingsPanelHead } from './settings-panel-head';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { WhatsAppConfig as WhatsAppConfigType } from '@/types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FB?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbAsyncInit?: any;
  }
}

const MASKED_TOKEN = '••••••••••••••••';

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
type ResetReason = 'token_corrupted' | 'meta_api_error' | null;

export function WhatsAppConfig() {
  const supabase = createClient();
  const { t } = useTranslation();
  const { user, accountId, loading: authLoading, profileLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null);
  const [allConfigs, setAllConfigs] = useState<WhatsAppConfigType[]>([]);
  const [limitInfo, setLimitInfo] = useState<{ current: number; max: number; allowed: boolean }>({
    current: 0,
    max: 1,
    allowed: true,
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [resetReason, setResetReason] = useState<ResetReason>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [label, setLabel] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [pin, setPin] = useState('');
  // Campo manual recolhido: só para quem já tem um PIN e quer mantê-lo.
  const [showManualPin, setShowManualPin] = useState(false);
  // PIN definido pelo servidor nesta reativação. Vive só neste estado —
  // não é gravado no banco nem volta em outra requisição.
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [tokenEdited, setTokenEdited] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Âncora do formulário de conexão. Quando ele abre a partir do botão
  // "+ Conectar Novo Número" — com números já na lista — o formulário
  // nasce abaixo da dobra; sem trazer a atenção até ele, o clique parece
  // não surtir efeito. O scroll suave faz a próxima etapa se apresentar.
  const formRef = useRef<HTMLDivElement>(null);
  // Pedido de scroll disparado a cada clique no botão. Não basta observar
  // a abertura do formulário: se ele já estiver aberto e o usuário rolar
  // de volta e clicar de novo, `isFormOpen` não muda e o scroll não
  // aconteceria — parecia rolar "só na primeira vez". Um contador
  // dedicado garante que todo clique traga o formulário à vista.
  const [scrollRequest, setScrollRequest] = useState(0);

  // Auto-Discovery state
  const [discovering, setDiscovering] = useState(false);
  const [discoveredAccounts, setDiscoveredAccounts] = useState<
    Array<{
      id: string;
      name: string;
      phone_numbers: Array<{
        id: string;
        display_phone_number: string;
        verified_name?: string;
      }>;
    }>
  >([]);
  const [selectedWabaId, setSelectedWabaId] = useState('');
  const [connectingEmbedded, setConnectingEmbedded] = useState(false);

  const isRegistered = Boolean(config?.registered_at);
  const lastRegistrationError = config?.last_registration_error ?? null;

  const [verifyingRegistration, setVerifyingRegistration] = useState(false);
  type RegistrationProbe = {
    live: boolean;
    checks: Record<string, boolean | null>;
    errors?: string[];
    last_registration_error?: string | null;
    registered_at?: string | null;
    subscribed_apps_at?: string | null;
  };
  const [registrationProbe, setRegistrationProbe] =
    useState<RegistrationProbe | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const fetchConfig = useCallback(async (acctId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('account_id', acctId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load config rows:', error);
      }

      const list = (data as WhatsAppConfigType[]) || [];
      setAllConfigs(list);

      const primary = list.find((c) => c.is_default) || list[0] || null;
      if (primary) {
        setConfig(primary);
        setPhoneNumberId(primary.phone_number_id || '');
        setWabaId(primary.waba_id || '');
        setLabel(primary.label || '');
        setAccessToken(MASKED_TOKEN);
        setPin('');
        setTokenEdited(false);
      } else {
        setConfig(null);
        setPhoneNumberId('');
        setWabaId('');
        setLabel('');
        setAccessToken('');
        setPin('');
        setTokenEdited(false);
        setIsFormOpen(true);
      }

      setRegistrationProbe(null);
      setLoading(false);

      try {
        const res = await fetch('/api/whatsapp/config', { method: 'GET' });
        const payload = await res.json();
        if (payload.limit_info) {
          setLimitInfo(payload.limit_info);
        }
        if (payload.connected) {
          setConnectionStatus('connected');
          setResetReason(null);
          setStatusMessage('');
        } else {
          setConnectionStatus('disconnected');
          setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
          setStatusMessage(payload.message || '');
        }
      } catch (err) {
        console.error('Health/limit check failed:', err);
      }
    } catch (err) {
      console.error('fetchConfig error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);


  useEffect(() => {
    // Need both the auth session (`!authLoading`) AND the profile
    // (`!profileLoading`, which carries `accountId`). Without the
    // second guard, the effect would fire with `accountId === null`
    // for the first render window and bail without ever retrying
    // once the profile arrives.
    if (authLoading || profileLoading) return;
    if (!user || !accountId) {
      setLoading(false);
      return;
    }
    fetchConfig(accountId);
  }, [authLoading, profileLoading, user, accountId, fetchConfig]);

  // Cada clique no botão bump `scrollRequest`; aqui trazemos o formulário
  // à vista. Fica de fora a abertura automática (nenhuma conexão ainda):
  // ali o formulário já é o conteúdo principal, no topo, e um scroll seria
  // movimento sem motivo — por isso o mount, com scrollRequest === 0, não
  // rola. rAF garante que o bloco condicional já montou antes de medir a
  // posição, cobrindo o primeiro clique (formulário ainda desmontado).
  useEffect(() => {
    if (scrollRequest === 0) return;
    const raf = requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollRequest]);

  /** Salvar normal: nunca mexe no PIN de duas etapas do número. */
  async function handleSave() {
    await submitConfig({ autoPin: false });
  }

  /**
   * Reativação pedida pelo usuário. `autoPin` autoriza o servidor a
   * definir um PIN novo — é o único caminho que faz isso, e nunca roda
   * junto de um salvar comum (trocar o PIN invalida o que o cliente
   * tinha, então precisa ser ato deliberado).
   */
  async function handleReactivate() {
    setGeneratedPin(null);
    await submitConfig({ autoPin: true });
  }

  async function submitConfig({ autoPin }: { autoPin: boolean }) {
    if (!phoneNumberId.trim()) {
      toast.error(t('settings.whatsappConfig.phoneNumberIdRequired'));
      return;
    }

    if (!config && (!accessToken.trim() || accessToken === MASKED_TOKEN)) {
      toast.error(t('settings.whatsappConfig.accessTokenRequired'));
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim() || null,
        pin: pin.trim() || null,
      };

      if (autoPin) payload.auto_two_step_pin = true;

      // Rotulo vazio nao vai no payload: quem renomeia e a lista de
      // conexoes, e um salvar por outro motivo nao pode reescrever o
      // nome que o operador deu a linha.
      if (label.trim()) payload.label = label.trim();

      if (tokenEdited && accessToken !== MASKED_TOKEN && accessToken.trim()) {
        payload.access_token = accessToken.trim();
      }

      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('settings.whatsappConfig.failedSave'));
        setSaving(false);
        return;
      }

      // O PIN novo aparece mesmo quando o registro falha depois dele: a
      // troca na Meta já aconteceu e o PIN anterior morreu ali.
      if (typeof data.two_step_pin === 'string') {
        setGeneratedPin(data.two_step_pin);
      }

      if (data.registered === false && data.registration_error) {
        toast.error(
          data.two_step_pin
            ? t('settings.whatsappConfig.pinRenewedButRegistrationFailed')
            : t('settings.whatsappConfig.savedButRegistrationFailed', {
                message: data.registration_error,
              }),
          { duration: 12000 },
        );
      } else if (data.registration_skipped) {
        toast.success(
          t('settings.whatsappConfig.savedAndVerifiedRegistrationSkipped'),
          { duration: 10000 },
        );
        setPin('');
      } else {
        toast.success(
          data.phone_info?.verified_name
            ? t('settings.whatsappConfig.liveWithName', {
                name: data.phone_info.verified_name,
              })
            : t('settings.whatsappConfig.whatsappConnected'),
        );
        setPin('');
      }

      setIsFormOpen(false);
      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(t('settings.whatsappConfig.failedSave'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(configId: string) {
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: configId, action: 'set_default' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Número principal atualizado com sucesso!');
        if (accountId) await fetchConfig(accountId);
      } else {
        toast.error(data.error || 'Falha ao definir número principal.');
      }
    } catch (err) {
      toast.error('Erro de conexão ao definir número principal.');
    }
  }

  async function handleRenameConfig(configId: string) {
    const nextLabel = renameValue.trim();
    if (!nextLabel) {
      toast.error(t('settings.whatsappConfig.labelRequired'));
      return;
    }
    setRenaming(true);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: configId, action: 'update_label', label: nextLabel }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || t('settings.whatsappConfig.failedSave'));
        return;
      }
      setRenamingId(null);
      setRenameValue('');
      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('Rename config failed:', err);
      toast.error(t('settings.whatsappConfig.failedSave'));
    } finally {
      setRenaming(false);
    }
  }

  async function handleDeleteConfig(configId: string) {
    if (!confirm('Deseja realmente remover esta conexão de WhatsApp da sua conta?')) return;
    try {
      const res = await fetch(`/api/whatsapp/config?id=${configId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Conexão de WhatsApp removida!');
        if (accountId) await fetchConfig(accountId);
      } else {
        toast.error(data.error || 'Falha ao remover conexão.');
      }
    } catch (err) {
      toast.error('Erro de conexão ao remover.');
    }
  }


  async function handleTestConnection() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'GET' });
      const payload = await res.json();

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
        toast.success(
          payload.phone_info?.verified_name
            ? t('settings.whatsappConfig.connectedTo', {
                name: payload.phone_info.verified_name,
              })
            : t('settings.whatsappConfig.apiConnectionSuccessful')
        );
      } else {
        setConnectionStatus('disconnected');
        setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
        setStatusMessage(payload.message || '');
        toast.error(payload.message || t('settings.whatsappConfig.apiConnectionFailed'));
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setConnectionStatus('disconnected');
      toast.error(t('settings.whatsappConfig.connectionTestFailed'));
    } finally {
      setTesting(false);
    }
  }

  async function handleVerifyRegistration() {
    setVerifyingRegistration(true);
    setRegistrationProbe(null);
    try {
      const res = await fetch('/api/whatsapp/config/verify-registration', {
        method: 'GET',
      });
      const data = (await res.json()) as RegistrationProbe;
      setRegistrationProbe(data);
      if (data.live) {
        toast.success(t('settings.whatsappConfig.numberFullyWired'));
      } else {
        toast.error(
          t('settings.whatsappConfig.numberNotFullyRegistered'),
          { duration: 8000 },
        );
      }
      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('verify-registration failed:', err);
      toast.error(t('settings.whatsappConfig.couldNotReachVerificationEndpoint'));
    } finally {
      setVerifyingRegistration(false);
    }
  }

  async function handleReset() {
    if (!confirm(t('settings.whatsappConfig.resetConfirm')) ) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('settings.whatsappConfig.failedReset'));
        return;
      }

      toast.success(t('settings.whatsappConfig.configurationCleared'));
      setConfig(null);
      setPhoneNumberId('');
      setWabaId('');
      setAccessToken('');
      setTokenEdited(false);
      setConnectionStatus('disconnected');
      setResetReason(null);
      setStatusMessage('');
    } catch (err) {
      console.error('Reset error:', err);
      toast.error(t('settings.whatsappConfig.failedReset'));
    } finally {
      setResetting(false);
    }
  }


  async function handleLaunchEmbeddedSignup() {
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      toast.error(
        'O SDK da Meta exige HTTPS no navegador. Para testar o pop-up localmente em dev, execute via HTTPS (ex: npx next dev --experimental-https ou ngrok), ou use a "Auto-Detecção por Token" abaixo.',
        { duration: 9000 }
      );
      return;
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

    if (!appId || !configId) {
      toast.error(
        'Para utilizar o cadastro de 1 clique, configure as variáveis NEXT_PUBLIC_META_APP_ID e NEXT_PUBLIC_META_CONFIG_ID no seu arquivo .env.',
        { duration: 8000 }
      );
      return;
    }

    setConnectingEmbedded(true);
    try {
      if (typeof window !== 'undefined') {
        if (!window.FB) {
          await new Promise<void>((resolve, reject) => {
            window.fbAsyncInit = function () {
              try {
                window.FB?.init({
                  appId,
                  autoLogAppEvents: true,
                  xfbml: true,
                  version: META_API_VERSION,
                });
                resolve();
              } catch (e) {
                reject(e);
              }
            };

            const existing = document.getElementById('facebook-jssdk');
            if (!existing) {
              const script = document.createElement('script');
              script.id = 'facebook-jssdk';
              script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
              script.async = true;
              script.onload = () => {
                if (window.FB) {
                  try {
                    window.FB.init({
                      appId,
                      autoLogAppEvents: true,
                      xfbml: true,
                      version: META_API_VERSION,
                    });
                  } catch {
                    /* keep existing init */
                  }
                  resolve();
                }
              };
              script.onerror = () =>
                reject(new Error('Não foi possível carregar o script da Meta. Verifique sua conexão.'));
              document.body.appendChild(script);
            } else {
              let elapsed = 0;
              const interval = setInterval(() => {
                elapsed += 100;
                if (window.FB) {
                  clearInterval(interval);
                  try {
                    window.FB.init({
                      appId,
                      autoLogAppEvents: true,
                      xfbml: true,
                      version: META_API_VERSION,
                    });
                  } catch {
                    /* keep existing init */
                  }
                  resolve();
                } else if (elapsed >= 3000) {
                  clearInterval(interval);
                  reject(new Error('SDK da Meta não respondeu a tempo. Tente a Auto-Detecção por Token abaixo.'));
                }
              }, 100);
            }
          });
        } else {
          try {
            window.FB.init({
              appId,
              autoLogAppEvents: true,
              xfbml: true,
              version: META_API_VERSION,
            });
          } catch {
            /* Keep existing init */
          }
        }
      }

      if (!window.FB?.login) {
        toast.error('O SDK da Meta não pôde ser iniciado neste navegador.');
        setConnectingEmbedded(false);
        return;
      }

      // A Meta entrega os dados da jornada por postMessage, vindos de
      // https://www.facebook.com — nao por callback passado em `extras`.
      // Sem este listener, phone_number_id e waba_id chegam vazios no
      // backend e ele precisa adivinhar o numero por debug_token. O
      // `event` (FINISH / CANCEL / ERROR) e o `current_step` sao o que
      // nos permite dizer ao operador onde a jornada parou, em vez de
      // devolver silencio quando ele fecha a janela (FH-43.04).
      let embeddedPhoneNumberId: string | undefined;
      let embeddedWabaId: string | undefined;
      let sessionEvent: string | undefined;
      let sessionStep: string | undefined;
      let sessionError: string | undefined;

      const handleSessionInfo = (event: MessageEvent) => {
        if (event.origin !== 'https://www.facebook.com') return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.type !== 'WA_EMBEDDED_SIGNUP') return;
          const info = parsed.data ?? {};
          sessionEvent = parsed.event;
          sessionStep = info.current_step;
          sessionError = info.error_message;
          if (info.phone_number_id) embeddedPhoneNumberId = info.phone_number_id;
          if (info.waba_id) embeddedWabaId = info.waba_id;
        } catch {
          // Outra origem do facebook.com conversando na mesma janela.
        }
      };
      window.addEventListener('message', handleSessionInfo);

      const stopListening = () => window.removeEventListener('message', handleSessionInfo);

      window.FB.login(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (response: any) => {
          stopListening();

          if (response?.authResponse?.code) {
            fetch('/api/whatsapp/embedded-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: response.authResponse.code,
                phone_number_id: embeddedPhoneNumberId,
                waba_id: embeddedWabaId,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  toast.success('WhatsApp conectado com sucesso via Embedded Signup!');
                  if (accountId) fetchConfig(accountId);
                } else {
                  toast.error(data.error || 'Falha ao processar Embedded Signup');
                }
              })
              .catch((err) => {
                console.error('Embedded signup POST failed:', err);
                toast.error('Erro de conexão ao salvar no servidor.');
              })
              .finally(() => setConnectingEmbedded(false));
          } else if (sessionEvent === 'ERROR') {
            toast.error(
              t('settings.whatsappConfig.signupErrorFromMeta', {
                message: sessionError || t('settings.whatsappConfig.signupErrorUnknown'),
              }),
              { duration: 10000 },
            );
            setConnectingEmbedded(false);
          } else {
            // A Meta cria passos novos sem aviso: sem rotulo traduzido,
            // cai na mensagem generica em vez de exibir a chave crua.
            const stepLabel = sessionStep
              ? t(`settings.whatsappConfig.signupSteps.${sessionStep}`, undefined, '')
              : '';
            toast.info(
              stepLabel
                ? t('settings.whatsappConfig.signupCancelledAtStep', { step: stepLabel })
                : t('settings.whatsappConfig.signupCancelled'),
              { duration: 8000 },
            );
            setConnectingEmbedded(false);
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          // Versao do fluxo, exatamente como a Meta gera no painel do app.
          extras: { version: 'v4' },
        }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Meta SDK init error:', err);
      toast.error(`Falha no pop-up da Meta: ${msg}`);
      setConnectingEmbedded(false);
    }
  }


  async function handleDiscoverAccounts() {
    if (!accessToken.trim() || accessToken === MASKED_TOKEN) {
      toast.error(t('settings.whatsappConfig.accessTokenRequired'));
      return;
    }

    setDiscovering(true);
    try {
      const res = await fetch('/api/whatsapp/config/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Falha na busca de contas da Meta.');
        return;
      }

      if (!data.accounts || data.accounts.length === 0) {
        toast.error('Nenhuma Conta Comercial do WhatsApp (WABA) foi encontrada para este token.');
        return;
      }

      setDiscoveredAccounts(data.accounts);
      toast.success(`${data.accounts.length} conta(s) encontrada(s)! Selecione seu WABA e número abaixo.`);

      const firstWaba = data.accounts[0];
      setSelectedWabaId(firstWaba.id);
      setWabaId(firstWaba.id);
      if (firstWaba.phone_numbers && firstWaba.phone_numbers.length > 0) {
        setPhoneNumberId(firstWaba.phone_numbers[0].id);
      }
    } catch (err) {
      console.error('Discover error:', err);
      toast.error('Erro ao buscar contas na Meta API.');
    } finally {
      setDiscovering(false);
    }
  }


  if (loading) {
    return (
      <section className="animate-in fade-in-50 duration-200">
        <SettingsPanelHead
          title={t('settings.whatsappConfig.title')}
          description={t('settings.whatsappConfig.description')}
          scope="account"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const showResetBanner = resetReason === 'token_corrupted';

  return (
    <section className="animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title={t('settings.whatsappConfig.title')}
        description={t('settings.whatsappConfig.description')}
        scope="account"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Main config form */}
      <div className="space-y-6">
        {/* Multi-WhatsApp Connections Overview */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="size-4 text-primary" />
                  Conexões de WhatsApp API Oficial Meta
                </CardTitle>
                <CardDescription className="text-xs">
                  Gerencie os números oficiais conectados à sua empresa.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {limitInfo.current} de {limitInfo.max} número(s)
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    if (limitInfo.current >= limitInfo.max) {
                      toast.error(`Limite de ${limitInfo.max} conexão(ões) atingido para seu plano. Altere seu plano em Faturamento para conectar mais números.`);
                    } else {
                      setConfig(null);
                      setPhoneNumberId('');
                      setWabaId('');
                      setLabel('');
                      setAccessToken('');
                      setPin('');
                      setIsFormOpen(true);
                      // Todo clique pede o scroll — inclusive quando o
                      // formulário já está aberto (isFormOpen não muda).
                      setScrollRequest((n) => n + 1);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  + Conectar Novo Número
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {allConfigs.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                Nenhum número de WhatsApp conectado ainda. Clique em "+ Conectar Novo Número" acima para começar.
              </div>
            ) : (
              <div className="grid gap-3">
                {allConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      cfg.is_default
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renamingId === cfg.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              autoFocus
                              value={renameValue}
                              maxLength={60}
                              placeholder={t('settings.whatsappConfig.labelPlaceholder')}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameConfig(cfg.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              className="h-7 w-56 bg-muted border-border text-foreground text-sm"
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              disabled={renaming}
                              onClick={() => handleRenameConfig(cfg.id)}
                            >
                              {renaming ? <Loader2 className="size-3.5 animate-spin" /> : t('common.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setRenamingId(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <span className="font-bold text-foreground text-sm">
                            {cfg.label || `WhatsApp (${cfg.phone_number_id})`}
                          </span>
                        )}
                        {cfg.is_default && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            ⭐ Principal
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          cfg.status === 'connected' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {cfg.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-[11px] flex-wrap">
                        <span>ID do Número: <code className="text-foreground">{cfg.phone_number_id}</code></span>
                        {cfg.waba_id && <span>WABA ID: <code className="text-foreground">{cfg.waba_id}</code></span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {!cfg.is_default && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleSetDefault(cfg.id)}
                        >
                          Tornar Principal
                        </Button>
                      )}
                      {renamingId !== cfg.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            setRenamingId(cfg.id);
                            setRenameValue(cfg.label || '');
                          }}
                        >
                          {t('settings.whatsappConfig.rename')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeleteConfig(cfg.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Corrupted-token reset banner */}
        {showResetBanner && (
          <Alert className="bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-600/40">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <AlertTitle className="text-amber-900 dark:text-amber-200 mb-1 font-semibold">
                  {t('settings.whatsappConfig.tokenCorruptedTitle')}
                </AlertTitle>
                <AlertDescription className="text-amber-800/90 dark:text-amber-100/80 text-sm">
                  {statusMessage}
                </AlertDescription>
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" />
                      {t('settings.whatsappConfig.resetConfiguration')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Connection Status */}
        <Alert id="tour-whatsapp-status" className="bg-card border-border">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <XCircle className="size-4 text-red-500" />
            )}
            <AlertTitle className="text-foreground mb-0">
              {connectionStatus === 'connected'
                ? t('settings.whatsappConfig.credentialsValid')
                : t('settings.whatsappConfig.notConnected')}
            </AlertTitle>
          </div>
          <AlertDescription className="text-muted-foreground">
            {connectionStatus === 'connected'
              ? t('settings.whatsappConfig.credentialsValidDescription')
              : statusMessage || t('settings.whatsappConfig.notConnectedDescription')}
          </AlertDescription>
        </Alert>

        {/* Registration Status — the "is it actually live?" check.
            Credentials being valid is necessary but not sufficient;
            without a successful /register call the number won't
            receive inbound events. Surface this dimension separately
            so users don't trust a misleading green banner. */}
        {config && (
          <Alert
            className={
              isRegistered
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60'
            }
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {isRegistered ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <AlertTitle
                  className={
                    'mb-0 font-semibold ' +
                    (isRegistered
                      ? 'text-emerald-950 dark:text-emerald-200'
                      : 'text-amber-950 dark:text-amber-200')
                  }
                >
                  {isRegistered
                    ? t('settings.whatsappConfig.registeredTitle')
                    : t('settings.whatsappConfig.notRegisteredTitle')}
                </AlertTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyRegistration}
                disabled={verifyingRegistration}
                className={
                  'h-7 text-xs font-medium border transition-colors ' +
                  (isRegistered
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-950 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:border-emerald-700/60 dark:text-emerald-200 dark:hover:text-emerald-100'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-950 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:border-amber-700/60 dark:text-amber-200 dark:hover:text-amber-100')
                }
              >
                {verifyingRegistration ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Zap className="size-3.5" />
                )}
                {t('settings.whatsappConfig.verifyWithMeta')}
              </Button>
            </div>
            <AlertDescription
              className={
                'mt-2 text-xs leading-relaxed ' +
                (isRegistered
                  ? 'text-emerald-900/90 dark:text-emerald-300/90'
                  : 'text-amber-900/90 dark:text-amber-300/90')
              }
            >
              {isRegistered ? (
                <>
                  {t('settings.whatsappConfig.subscribedSince')}{' '}
                  {config.registered_at
                    ? new Date(config.registered_at).toLocaleString()
                    : 'unknown'}
                  . {t('settings.whatsappConfig.verifyWhenEventsStop')}
                </>
              ) : lastRegistrationError ? (
                <>
                  {t('settings.whatsappConfig.lastAttemptFailedWith')}{' '}
                  <span className="text-red-600 dark:text-red-300 font-medium">
                    &quot;{lastRegistrationError}&quot;
                  </span>
                  . {t('settings.whatsappConfig.enterPinToRetry')}
                </>
              ) : (
                <>
                  {t('settings.whatsappConfig.notRegisteredDescription')}
                </>
              )}
            </AlertDescription>

            {/* Reativar e saida de emergencia, nao etapa: so aparece quando
                o registro esta pendente, e no ponto onde a correcao
                acontece (FH-44.03). Na conexao de 1 clique a Meta
                registra o numero sozinha e ninguem nunca ve isto.

                O PIN nao e pedido: a Meta nao exibe o PIN vigente em lugar
                nenhum, entao mandar o usuario "buscar" o dele e mandar
                procurar o que nao existe. Aqui o proprio FlowHub define um
                PIN novo e registra com ele. O campo manual fica recolhido
                para quem ja tem um PIN e quer manter. */}
            {!isRegistered && (
              <div className="mt-3 rounded-lg border border-border bg-background/80 dark:bg-card/60 px-3.5 py-3 space-y-2.5">
                <p className="text-xs text-foreground leading-relaxed">
                  {t('settings.whatsappConfig.reactivateDescription')}
                </p>
                <Button
                  size="sm"
                  onClick={handleReactivate}
                  disabled={saving}
                  className="h-10 sm:h-9 w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    t('settings.whatsappConfig.reactivateNumber')
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('settings.whatsappConfig.reactivateRenewsPin')}
                </p>

                {showManualPin ? (
                  <div className="pt-1 space-y-2 border-t border-border">
                    <Label className="text-xs text-foreground pt-2 block">
                      {t('settings.whatsappConfig.twoStepPin')}
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder={t('settings.whatsappConfig.pinPlaceholder')}
                        value={pin}
                        onChange={(e) =>
                          setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground tracking-widest sm:max-w-[220px]"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSave}
                        disabled={saving || pin.trim().length !== 6}
                        className="h-10 sm:h-9"
                      >
                        {t('settings.whatsappConfig.registerNumber')}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {t('settings.whatsappConfig.pinHelp')}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowManualPin(true)}
                    className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    {t('settings.whatsappConfig.useOwnPin')}
                  </button>
                )}
              </div>
            )}

            {/* Exibido UMA vez, e so aqui: o PIN novo nao e gravado em
                lugar nenhum. Fica em bloco fixo, nao em toast, porque o
                usuario precisa de tempo para anotar. */}
            {generatedPin && (
              <div className="mt-3 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-3 space-y-1.5">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                  {t('settings.whatsappConfig.pinRenewedTitle')}
                </p>
                <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {t('settings.whatsappConfig.pinRenewedBody', {
                    pin: generatedPin,
                  })}
                </p>
              </div>
            )}

            {registrationProbe && (
              <div className="mt-3 rounded-lg border border-border bg-background/80 dark:bg-card/60 px-3.5 py-2.5 space-y-1.5 text-[11px]">
                <p className="font-medium text-foreground">
                  {t('settings.whatsappConfig.diagnosticLastRun')}{' '}
                  <span className={registrationProbe.live ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                    {registrationProbe.live ? t('settings.whatsappConfig.live') : t('settings.whatsappConfig.notLive')}
                  </span>
                </p>
                <ul className="space-y-0.5 text-muted-foreground">
                  {Object.entries(registrationProbe.checks).map(([k, v]) => (
                    <li key={k} className="flex items-center gap-1.5">
                      {v === true ? (
                        <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : v === false ? (
                        <XCircle className="size-3 text-red-600 dark:text-red-400 shrink-0" />
                      ) : (
                        <span className="size-3 rounded-full border border-border shrink-0" />
                      )}
                      <code className="text-muted-foreground">{k}</code>
                    </li>
                  ))}
                </ul>
                {(registrationProbe.errors ?? []).length > 0 && (
                  <ul className="pt-1 space-y-0.5 text-red-600 dark:text-red-300">
                    {registrationProbe.errors?.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Alert>
        )}

        {/* Formulário de conexão. Fica recolhido quando já existe pelo
            menos um número conectado — a lista acima é a visão padrão — e
            só se abre em "+ Conectar Novo Número" (setIsFormOpen(true)) ou
            automaticamente quando ainda não há nenhuma conexão. Sem este
            gate o botão não produzia efeito perceptível: os cards já
            estavam sempre na tela. */}
        {isFormOpen && (
          <div ref={formRef} className="space-y-6 scroll-mt-6">
            {allConfigs.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="size-4 text-primary" />
                  Conectar novo número
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsFormOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
        {/* Mode 1: 1-Click Embedded Signup */}
        <Card id="tour-whatsapp-connect" className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
                {t('settings.whatsappConfig.quickConnectTitle')}
              </CardTitle>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Recomendado
              </span>
            </div>
            <CardDescription className="text-muted-foreground">
              {t('settings.whatsappConfig.quickConnectDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preparo antes do popup da Meta. O erro "este numero ja
                pertence a uma conta do WhatsApp" so aparece dentro do
                fluxo da Meta, onde nao temos como explicar nada — e a
                exclusao da conta no aplicativo leva o historico junto.
                Prevenir aqui e mais barato que a mensagem depois
                (FH-44.01), e a ultima linha diz em voz alta que o
                numero continua sendo do cliente (FH-11). */}
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5 space-y-2">
              <p className="text-xs font-semibold text-foreground">
                {t('settings.whatsappConfig.beforeConnectTitle')}
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-xs leading-relaxed text-muted-foreground marker:text-muted-foreground/60">
                <li>{t('settings.whatsappConfig.beforeConnectNumber')}</li>
                <li>{t('settings.whatsappConfig.beforeConnectBackup')}</li>
                <li>{t('settings.whatsappConfig.beforeConnectMove')}</li>
                <li className="text-foreground/80">
                  {t('settings.whatsappConfig.beforeConnectFreedom')}
                </li>
              </ul>
            </div>
            <Button
              onClick={handleLaunchEmbeddedSignup}
              disabled={connectingEmbedded}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 text-sm h-10 px-5 shadow-sm"
            >
              {connectingEmbedded ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Conectando com a Meta...
                </>
              ) : (
                <>
                  <Smartphone className="size-4" />
                  {t('settings.whatsappConfig.connectWithWhatsApp')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mode 2: Auto-Discovery via Access Token */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Search className="size-5 text-primary" />
              {t('settings.whatsappConfig.autoDiscoverTitle')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('settings.whatsappConfig.autoDiscoverDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('settings.whatsappConfig.accessToken')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    placeholder={t('settings.whatsappConfig.accessTokenPlaceholder')}
                    value={accessToken}
                    onChange={(e) => {
                      setAccessToken(e.target.value);
                      setTokenEdited(true);
                    }}
                    onFocus={() => {
                      if (accessToken === MASKED_TOKEN) {
                        setAccessToken('');
                        setTokenEdited(true);
                      }
                    }}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleDiscoverAccounts}
                  disabled={discovering || !accessToken.trim() || accessToken === MASKED_TOKEN}
                  variant="secondary"
                  className="shrink-0 gap-2"
                >
                  {discovering ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('settings.whatsappConfig.discovering')}
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      {t('settings.whatsappConfig.autoDiscoverButton')}
                    </>
                  )}
                </Button>
              </div>
              {config && !tokenEdited && (
                <p className="text-xs text-muted-foreground">
                  {t('settings.whatsappConfig.accessTokenHidden')}
                </p>
              )}
            </div>

            {discoveredAccounts.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-border animate-in fade-in-50">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-4 text-primary" />
                    {t('settings.whatsappConfig.selectAccount')}
                  </Label>
                  <select
                    value={selectedWabaId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedWabaId(id);
                      setWabaId(id);
                      const acc = discoveredAccounts.find((a) => a.id === id);
                      if (acc?.phone_numbers && acc.phone_numbers.length > 0) {
                        setPhoneNumberId(acc.phone_numbers[0].id);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-md border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {discoveredAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (ID: {acc.id})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedWabaId && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-1.5">
                      <Smartphone className="size-4 text-primary" />
                      {t('settings.whatsappConfig.selectPhone')}
                    </Label>
                    <select
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {discoveredAccounts
                        .find((a) => a.id === selectedWabaId)
                        ?.phone_numbers.map((phone) => (
                          <option key={phone.id} value={phone.id}>
                            {phone.display_phone_number} {phone.verified_name ? `(${phone.verified_name})` : ''} - ID: {phone.id}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div id="tour-whatsapp-actions" className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                    {t('common.saving')}
              </>
            ) : (
                  t('settings.whatsappConfig.saveConfiguration')
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || !config}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {testing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('settings.whatsappConfig.testing')}
              </>
            ) : (
              <>
                <Zap className="size-4" />
                {t('settings.whatsappConfig.testApiConnection')}
              </>
            )}
          </Button>
          {config && (
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  {t('settings.whatsappConfig.resetConfiguration')}
                </>
              )}
            </Button>
          )}
        </div>
          </div>
        )}
      </div>

      {/* Setup Instructions Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base">{t('settings.whatsappConfig.setupInstructionsTitle')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('settings.whatsappConfig.setupInstructionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion>
              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                    {t('settings.whatsappConfig.step1Title')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('settings.whatsappConfig.step1Item1')} <span className="text-primary">developers.facebook.com</span></li>
                    <li>{t('settings.whatsappConfig.step1Item2')}</li>
                    <li>{t('settings.whatsappConfig.step1Item3')}</li>
                    <li>{t('settings.whatsappConfig.step1Item4')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                    {t('settings.whatsappConfig.step2Title')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('settings.whatsappConfig.step2Item1')}</li>
                    <li>{t('settings.whatsappConfig.step2Item2')}</li>
                    <li>{t('settings.whatsappConfig.step2Item3')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border">
                <AccordionTrigger className="text-muted-foreground hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                    {t('settings.whatsappConfig.step3Title')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t('settings.whatsappConfig.step3Item1')}</li>
                    <li>{t('settings.whatsappConfig.step3Item2')} <strong className="text-foreground">{t('settings.whatsappConfig.phoneNumberId')}</strong></li>
                    <li>{t('settings.whatsappConfig.step3Item3')} <strong className="text-foreground">{t('settings.whatsappConfig.businessAccountId')}</strong></li>
                    <li>{t('settings.whatsappConfig.step3Item4')} <strong className="text-foreground">{t('settings.whatsappConfig.accessToken')}</strong></li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <div className="mt-4 pt-4 border-t border-border">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                {t('settings.whatsappConfig.metaDocs')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Script
      id="facebook-jssdk"
      src="https://connect.facebook.net/pt_BR/sdk.js"
      strategy="afterInteractive"
      onLoad={() => {
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        if (typeof window !== 'undefined' && window.FB && appId) {
          try {
            window.FB.init({
              appId,
              autoLogAppEvents: true,
              xfbml: true,
              version: META_API_VERSION,
            });
          } catch (err) {
            console.error('Meta FB.init error:', err);
          }
        }
      }}
    />
    </section>
  );
}

