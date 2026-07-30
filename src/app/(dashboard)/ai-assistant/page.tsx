"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Bot,
  Key,
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Upload,
  Image as ImageIcon,
  Video,
  FileCode,
  RefreshCw,
  Eye,
  ShieldCheck,
  Zap,
  ShieldAlert,
  Activity,
  Cpu,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AIConfig {
  account_id: string
  enabled: boolean
  company_name: string
  business_segment: string
  service_goal: string
  communication_style: string
  service_rules: string
  limitations: string
  handoff_instructions: string
  openai_api_key_masked?: string
  has_key: boolean
  openai_api_url: string
  openai_model: string
  temperature: number
  max_tokens: number
}

interface KnowledgeItem {
  id: string
  category: string
  title: string
  content: string
  is_active: boolean
}

interface MediaItem {
  id: string
  title: string
  media_type: 'image' | 'video' | 'document'
  media_url: string
  filename?: string
  description: string
  is_active: boolean
}

interface SimMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  handoffRequested?: boolean
  handoffReason?: string
  attachedMedia?: MediaItem[]
}

interface ExecutionLog {
  id: string
  conversation_id: string
  inbound_message_text: string
  outbound_text: string
  model_used: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  execution_time_ms: number
  handoff_triggered: boolean
  handoff_reason?: string
  created_at: string
}

interface SecurityEvent {
  id: string
  conversation_id?: string
  event_type: string
  severity: 'info' | 'warning' | 'critical'
  details: string
  created_at: string
}

interface AuditMetrics {
  totalExecutions: number
  totalTokens: number
  avgLatencyMs: number
  handoffCount: number
  handoffRate: number
}

interface ActiveFlowInfo {
  id: string
  name: string
  status: string
  trigger_type: string
}

export default function AIAssistantPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('config')

  // Config State
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeFlows, setActiveFlows] = useState<ActiveFlowInfo[]>([])

  // Dynamic LLM Models State
  const [availableModels, setAvailableModels] = useState<string[]>([
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'deepseek-chat',
    'llama-3.3-70b-versatile',
  ])
  const [loadingModels, setLoadingModels] = useState(false)

  // Knowledge State
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([])
  const [loadingKnowledge, setLoadingKnowledge] = useState(false)
  const [searchKnowledge, setSearchKnowledge] = useState('')
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeItem | null>(null)
  const [kCategory, setKCategory] = useState('Geral')
  const [kTitle, setKTitle] = useState('')
  const [kContent, setKContent] = useState('')
  const [savingKnowledge, setSavingKnowledge] = useState(false)

  // Media State
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [mTitle, setMTitle] = useState('')
  const [mDescription, setMDescription] = useState('')
  const [mFileType, setMFileType] = useState<'image' | 'video' | 'document'>('image')
  const [mCustomUrl, setMCustomUrl] = useState('')
  const [mSelectedFile, setMSelectedFile] = useState<File | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  // Playground / Simulator State
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: t('aiAssistant.playground.welcome'),
    },
  ])
  const [simInput, setSimInput] = useState('')
  const [simulating, setSimulating] = useState(false)

  // Audit State
  const [auditLogs, setAuditLogs] = useState<ExecutionLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics>({
    totalExecutions: 0,
    totalTokens: 0,
    avgLatencyMs: 0,
    handoffCount: 0,
    handoffRate: 0,
  })
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Status notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load Config
  const fetchConfig = async () => {
    try {
      setLoadingConfig(true)
      const res = await fetch('/api/ai-assistant/config')
      const data = await res.json()
      if (res.ok && data.config) {
        setConfig(data.config)
      } else {
        showToast('error', data.error || 'Erro ao carregar configurações.')
      }
    } catch {
      showToast('error', 'Falha ao conectar com o servidor.')
    } finally {
      setLoadingConfig(false)
    }
  }

  // Fetch Available Models from provider
  const fetchModels = useCallback(async (keyOverride?: string, urlOverride?: string) => {
    setLoadingModels(true)
    try {
      const res = await fetch('/api/ai-assistant/config/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openai_api_key: keyOverride ?? (newApiKey.trim() || undefined),
          openai_api_url: urlOverride ?? config?.openai_api_url,
        }),
      })
      const data = await res.json()
      if (data.models && Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models)
      }
    } catch {
      // keep default models
    } finally {
      setLoadingModels(false)
    }
  }, [newApiKey, config?.openai_api_url])

  // Load Knowledge
  const fetchKnowledge = async () => {
    try {
      setLoadingKnowledge(true)
      const res = await fetch('/api/ai-assistant/knowledge')
      const data = await res.json()
      if (res.ok) setKnowledgeList(data.items || [])
    } catch {
      // quiet
    } finally {
      setLoadingKnowledge(false)
    }
  }

  // Load Media
  const fetchMedia = async () => {
    try {
      setLoadingMedia(true)
      const res = await fetch('/api/ai-assistant/media')
      const data = await res.json()
      if (res.ok) setMediaList(data.items || [])
    } catch {
      // quiet
    } finally {
      setLoadingMedia(false)
    }
  }

  // Load Audit Data
  const fetchAudit = async () => {
    try {
      setLoadingAudit(true)
      const res = await fetch('/api/ai-assistant/audit')
      const data = await res.json()
      if (res.ok) {
        setAuditLogs(data.logs || [])
        setSecurityEvents(data.securityEvents || [])
        if (data.metrics) setAuditMetrics(data.metrics)
      }
    } catch {
      // quiet
    } finally {
      setLoadingAudit(false)
    }
  }

  // Load Active Flows for Precedence Warning
  const fetchActiveFlows = async () => {
    try {
      const res = await fetch('/api/flows')
      const data = await res.json()
      if (res.ok && Array.isArray(data.flows)) {
        const active = data.flows.filter((f: ActiveFlowInfo) => f.status === 'active')
        setActiveFlows(active)
      }
    } catch {
      // quiet
    }
  }

  useEffect(() => {
    fetchConfig()
    fetchKnowledge()
    fetchMedia()
    fetchAudit()
    fetchActiveFlows()
  }, [])

  useEffect(() => {
    if (config?.has_key || newApiKey.trim()) {
      fetchModels()
    }
  }, [config?.has_key, newApiKey, fetchModels])

  // Save Config
  const handleSaveConfig = async () => {
    if (!config) return
    setSavingConfig(true)
    try {
      const payload: Record<string, unknown> = { ...config }
      if (newApiKey.trim()) {
        payload.openai_api_key = newApiKey.trim()
      }
      const res = await fetch('/api/ai-assistant/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('success', t('aiAssistant.notifications.configSaved'))
        setNewApiKey('')
        fetchConfig()
      } else {
        showToast('error', data.error || 'Erro ao salvar configurações.')
      }
    } catch {
      showToast('error', 'Erro ao salvar configurações.')
    } finally {
      setSavingConfig(false)
    }
  }

  // Test BYOK Key
  const handleTestKey = async () => {
    setTestingKey(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/ai-assistant/config/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openai_api_key: newApiKey.trim() || undefined,
          openai_api_url: config?.openai_api_url,
          openai_model: config?.openai_model,
        }),
      })
      const data = await res.json()
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? t('aiAssistant.notifications.connectionSuccess') : 'Falha na conexão.'),
      })

      if (data.success) {
        fetchModels()
      }
    } catch {
      setTestResult({ success: false, message: 'Erro ao testar a conexão com a chave de API.' })
    } finally {
      setTestingKey(false)
    }
  }

  // Create/Edit Knowledge
  const handleSaveKnowledge = async () => {
    if (!kTitle.trim() || !kContent.trim()) {
      showToast('error', t('common.required'))
      return
    }
    setSavingKnowledge(true)
    try {
      const isEdit = Boolean(editingKnowledge)
      const url = isEdit ? `/api/ai-assistant/knowledge/${editingKnowledge!.id}` : '/api/ai-assistant/knowledge'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: kCategory,
          title: kTitle,
          content: kContent,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('success', t('aiAssistant.notifications.knowledgeSaved'))
        setKnowledgeModalOpen(false)
        setEditingKnowledge(null)
        setKTitle('')
        setKContent('')
        fetchKnowledge()
      } else {
        showToast('error', data.error || 'Erro ao salvar item.')
      }
    } catch {
      showToast('error', 'Falha ao salvar item.')
    } finally {
      setSavingKnowledge(false)
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm(t('aiAssistant.knowledge.confirmDelete'))) return
    try {
      const res = await fetch(`/api/ai-assistant/knowledge/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('success', t('aiAssistant.notifications.knowledgeDeleted'))
        fetchKnowledge()
      }
    } catch {
      showToast('error', 'Erro ao excluir item.')
    }
  }

  // Create Media
  const handleSaveMedia = async () => {
    if (!mTitle.trim() || (!mSelectedFile && !mCustomUrl.trim())) {
      showToast('error', t('common.required'))
      return
    }
    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('title', mTitle)
      formData.append('description', mDescription)
      formData.append('media_type', mFileType)
      if (mCustomUrl) formData.append('media_url', mCustomUrl)
      if (mSelectedFile) formData.append('file', mSelectedFile)

      const res = await fetch('/api/ai-assistant/media', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        showToast('success', t('aiAssistant.notifications.mediaSaved'))
        setMediaModalOpen(false)
        setMTitle('')
        setMDescription('')
        setMCustomUrl('')
        setMSelectedFile(null)
        fetchMedia()
      } else {
        showToast('error', data.error || 'Erro ao cadastrar mídia.')
      }
    } catch {
      showToast('error', 'Falha ao enviar arquivo.')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm(t('aiAssistant.media.confirmDelete'))) return
    try {
      const res = await fetch(`/api/ai-assistant/media/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('success', t('aiAssistant.notifications.mediaDeleted'))
        fetchMedia()
      }
    } catch {
      showToast('error', 'Erro ao excluir mídia.')
    }
  }

  // Simulator
  const handleSendSimMessage = async () => {
    if (!simInput.trim() || simulating) return

    const userText = simInput.trim()
    const userMsg: SimMessage = { id: `u_${Date.now()}`, sender: 'user', text: userText }
    setSimMessages((prev) => [...prev, userMsg])
    setSimInput('')
    setSimulating(true)

    try {
      const historyPayload = simMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ sender: m.sender, text: m.text }))

      const res = await fetch('/api/ai-assistant/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: userText,
          history: historyPayload,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const botMsg: SimMessage = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: data.text || '(Sem resposta)',
          handoffRequested: data.handoffRequested,
          handoffReason: data.handoffReason,
          attachedMedia: data.attachedMedia,
        }
        setSimMessages((prev) => [...prev, botMsg])
        fetchAudit()
      } else {
        setSimMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'bot',
            text: `⚠️ Erro na resposta da IA: ${data.error || 'Falha ao processar.'}`,
          },
        ])
      }
    } catch {
      setSimMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Erro ao conectar com o simulador.',
        },
      ])
    } finally {
      setSimulating(false)
    }
  }

  const filteredKnowledge = knowledgeList.filter(
    (k) =>
      k.title.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
      k.category.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
      k.content.toLowerCase().includes(searchKnowledge.toLowerCase())
  )

  if (loadingConfig) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('aiAssistant.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg transition-all ${
            toastMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div id="tour-ai-header" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-background p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.title')}
              </Badge>
              {config?.enabled ? (
                <Badge variant="default" className="bg-emerald-600 text-white">
                  {t('aiAssistant.activeInWhatsApp')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  {t('aiAssistant.inactive')}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mt-3">{t('aiAssistant.title')}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {t('aiAssistant.subtitle')}
            </p>
          </div>

          {config && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{t('aiAssistant.statusLabel')}</span>
              <Switch
                checked={config.enabled}
                onCheckedChange={(val) => setConfig({ ...config, enabled: val })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Routing Order & Precedence Card */}
      <Card id="tour-ai-routing" className="border-border bg-card/60">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Zap className="h-4 w-4 text-amber-400" />
              {t('aiAssistant.routing.title', {}, 'Ordem de Roteamento & Prioridade de Atendimento')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('aiAssistant.routing.subtitle', {}, 'Como o Flow Hub decide quem responde às mensagens recebidas no WhatsApp.')}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                <Zap className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step1Title', {}, '1º Fluxos Visuais')}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('aiAssistant.routing.step1Desc', {}, 'Automações rígidas de menu e triagem respondem primeiro.')}
              </p>
            </div>

            <div className="rounded-lg border bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                <Bot className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step2Title', {}, '2º Atendimento IA')}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('aiAssistant.routing.step2Desc', {}, 'Responde se nenhum fluxo for acionado e a IA estiver ativa.')}
              </p>
            </div>

            <div className="rounded-lg border bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <UserCheck className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step3Title', {}, '3º Atendente Humano')}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('aiAssistant.routing.step3Desc', {}, 'Assume a conversa quando a IA aciona a transferência.')}
              </p>
            </div>
          </div>

          {activeFlows.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">
                  {t('aiAssistant.routing.activeFlowsWarning', { count: activeFlows.length }, `Você possui ${activeFlows.length} fluxo(s) ativo(s) que intercepta(m) mensagens antes da IA:`)}
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeFlows.map((f) => (
                    <Badge key={f.id} variant="outline" className="border-amber-400/40 bg-amber-500/20 text-amber-200 text-[10px]">
                      {f.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList id="tour-ai-tabs" className="grid w-full grid-cols-5 lg:w-[780px]">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>{t('aiAssistant.tabs.config')}</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{t('aiAssistant.tabs.knowledge')}</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{t('aiAssistant.tabs.media')}</span>
          </TabsTrigger>
          <TabsTrigger value="playground" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{t('aiAssistant.tabs.playground')}</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>{t('aiAssistant.tabs.audit')}</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONFIGURAÇÕES DA IA */}
        <TabsContent value="config" className="space-y-6">
          <Card id="tour-ai-config-persona">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" /> {t('aiAssistant.persona.title')}
              </CardTitle>
              <CardDescription>
                {t('aiAssistant.persona.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">{t('aiAssistant.persona.companyName')}</Label>
                  <Input
                    id="company_name"
                    placeholder={t('aiAssistant.persona.companyNamePlaceholder')}
                    value={config?.company_name || ''}
                    onChange={(e) => config && setConfig({ ...config, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_segment">{t('aiAssistant.persona.segment')}</Label>
                  <Input
                    id="business_segment"
                    placeholder={t('aiAssistant.persona.segmentPlaceholder')}
                    value={config?.business_segment || ''}
                    onChange={(e) => config && setConfig({ ...config, business_segment: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service_goal">{t('aiAssistant.persona.goal')}</Label>
                  <Input
                    id="service_goal"
                    placeholder={t('aiAssistant.persona.goalPlaceholder')}
                    value={config?.service_goal || ''}
                    onChange={(e) => config && setConfig({ ...config, service_goal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communication_style">{t('aiAssistant.persona.style')}</Label>
                  <Input
                    id="communication_style"
                    placeholder={t('aiAssistant.persona.stylePlaceholder')}
                    value={config?.communication_style || ''}
                    onChange={(e) => config && setConfig({ ...config, communication_style: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_rules">{t('aiAssistant.persona.rules')}</Label>
                <Textarea
                  id="service_rules"
                  rows={3}
                  placeholder={t('aiAssistant.persona.rulesPlaceholder')}
                  value={config?.service_rules || ''}
                  onChange={(e) => config && setConfig({ ...config, service_rules: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitations" className="flex items-center gap-1.5 text-rose-400">
                  <ShieldCheck className="h-4 w-4" /> {t('aiAssistant.persona.limitations')}
                </Label>
                <Textarea
                  id="limitations"
                  rows={3}
                  placeholder={t('aiAssistant.persona.limitationsPlaceholder')}
                  value={config?.limitations || ''}
                  onChange={(e) => config && setConfig({ ...config, limitations: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoff_instructions" className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="h-4 w-4" /> {t('aiAssistant.persona.handoff')}
                </Label>
                <Textarea
                  id="handoff_instructions"
                  rows={3}
                  placeholder={t('aiAssistant.persona.handoffPlaceholder')}
                  value={config?.handoff_instructions || ''}
                  onChange={(e) => config && setConfig({ ...config, handoff_instructions: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* BYOK Credentials Card */}
          <Card id="tour-ai-config-byok">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-primary" /> {t('aiAssistant.byok.title')}
              </CardTitle>
              <CardDescription>
                {t('aiAssistant.byok.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="openai_api_url">{t('aiAssistant.byok.apiUrl')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai_api_url"
                      placeholder="https://api.openai.com/v1"
                      value={config?.openai_api_url || 'https://api.openai.com/v1'}
                      onChange={(e) => config && setConfig({ ...config, openai_api_url: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchModels()}
                      disabled={loadingModels}
                      className="shrink-0"
                      title={t('aiAssistant.byok.fetchModels')}
                    >
                      {loadingModels ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      <span className="ml-1 hidden sm:inline">{t('aiAssistant.byok.fetchModels')}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openai_model">{t('aiAssistant.byok.model')}</Label>
                  <Select
                    value={config?.openai_model || 'gpt-4o-mini'}
                    onValueChange={(val) => {
                      if (val && config) setConfig({ ...config, openai_model: val })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('aiAssistant.byok.modelSelectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableModels.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">{t('aiAssistant.byok.apiKey')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="api_key"
                    type="password"
                    placeholder={
                      config?.has_key
                        ? t('aiAssistant.byok.keyConfigured', { key: config.openai_api_key_masked ?? '••••••••' })
                        : t('aiAssistant.byok.keyPlaceholder')
                    }
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestKey}
                    disabled={testingKey}
                    className="shrink-0"
                  >
                    {testingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {t('aiAssistant.byok.testConnection')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('aiAssistant.byok.keyNotice')}
                </p>
              </div>

              {testResult && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                    testResult.success
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} disabled={savingConfig} className="min-w-[150px]">
                  {savingConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {t('aiAssistant.byok.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: BASE DE CONHECIMENTO */}
        <TabsContent value="knowledge" className="space-y-6">
          <div id="tour-ai-knowledge" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder={t('aiAssistant.knowledge.searchPlaceholder')}
              value={searchKnowledge}
              onChange={(e) => setSearchKnowledge(e.target.value)}
              className="max-w-md"
            />
            <Button
              onClick={() => {
                setEditingKnowledge(null)
                setKCategory('Geral')
                setKTitle('')
                setKContent('')
                setKnowledgeModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> {t('aiAssistant.knowledge.add')}
            </Button>
          </div>

          {loadingKnowledge ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className="mb-2 h-10 w-10 text-muted-foreground/60" />
              <h3 className="font-semibold">{t('aiAssistant.knowledge.emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                {t('aiAssistant.knowledge.emptyDescription')}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredKnowledge.map((item) => (
                <Card key={item.id} className="relative transition-all hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="secondary" className="mb-1 text-xs">
                          {item.category}
                        </Badge>
                        <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingKnowledge(item)
                            setKCategory(item.category)
                            setKTitle(item.title)
                            setKContent(item.content)
                            setKnowledgeModalOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteKnowledge(item.id)}>
                          <Trash2 className="h-4 w-4 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Modal Adicionar/Editar Conhecimento */}
          <Dialog open={knowledgeModalOpen} onOpenChange={setKnowledgeModalOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingKnowledge ? t('aiAssistant.knowledge.modalEditTitle') : t('aiAssistant.knowledge.modalAddTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('aiAssistant.knowledge.modalDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('aiAssistant.knowledge.category')}</Label>
                  <Input
                    id="category"
                    placeholder={t('aiAssistant.knowledge.categoryPlaceholder')}
                    value={kCategory}
                    onChange={(e) => setKCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">{t('aiAssistant.knowledge.itemTitle')}</Label>
                  <Input
                    id="title"
                    placeholder={t('aiAssistant.knowledge.itemTitlePlaceholder')}
                    value={kTitle}
                    onChange={(e) => setKTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">{t('aiAssistant.knowledge.content')}</Label>
                  <Textarea
                    id="content"
                    rows={6}
                    placeholder={t('aiAssistant.knowledge.contentPlaceholder')}
                    value={kContent}
                    onChange={(e) => setKContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setKnowledgeModalOpen(false)}>
                  {t('aiAssistant.knowledge.cancel')}
                </Button>
                <Button onClick={handleSaveKnowledge} disabled={savingKnowledge}>
                  {savingKnowledge ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {t('aiAssistant.knowledge.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 3: BIBLIOTECA DE MÍDIAS */}
        <TabsContent value="media" className="space-y-6">
          <div id="tour-ai-media" className="flex justify-end">
            <Button onClick={() => setMediaModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> {t('aiAssistant.media.add')}
            </Button>
          </div>

          {loadingMedia ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : mediaList.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="mb-2 h-10 w-10 text-muted-foreground/60" />
              <h3 className="font-semibold">{t('aiAssistant.media.emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                {t('aiAssistant.media.emptyDescription')}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {mediaList.map((item) => (
                <Card key={item.id} className="relative overflow-hidden transition-all hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.media_type === 'image' && <ImageIcon className="h-5 w-5 text-sky-400" />}
                        {item.media_type === 'video' && <Video className="h-5 w-5 text-purple-400" />}
                        {item.media_type === 'document' && <FileCode className="h-5 w-5 text-emerald-400" />}
                        <CardTitle className="text-base font-semibold truncate">{item.title}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMedia(item.id)}>
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-md border bg-muted/30 p-2 text-xs font-mono truncate">
                      <a href={item.media_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {t('aiAssistant.media.viewMedia')}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">{t('aiAssistant.media.whenToSend')}</span>
                      <p className="text-xs text-foreground bg-card p-2 rounded border">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Modal Nova Mídia */}
          <Dialog open={mediaModalOpen} onOpenChange={setMediaModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t('aiAssistant.media.modalTitle')}</DialogTitle>
                <DialogDescription>
                  {t('aiAssistant.media.modalDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="m_title">{t('aiAssistant.media.mediaTitle')}</Label>
                  <Input
                    id="m_title"
                    placeholder={t('aiAssistant.media.mediaTitlePlaceholder')}
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('aiAssistant.media.fileType')}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={mFileType === 'image' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('image')}
                    >
                      <ImageIcon className="mr-1 h-4 w-4" /> {t('aiAssistant.media.image')}
                    </Button>
                    <Button
                      type="button"
                      variant={mFileType === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('video')}
                    >
                      <Video className="mr-1 h-4 w-4" /> {t('aiAssistant.media.video')}
                    </Button>
                    <Button
                      type="button"
                      variant={mFileType === 'document' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('document')}
                    >
                      <FileCode className="mr-1 h-4 w-4" /> {t('aiAssistant.media.document')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_upload">{t('aiAssistant.media.upload')}</Label>
                  <Input
                    id="file_upload"
                    type="file"
                    onChange={(e) => setMSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m_url">{t('aiAssistant.media.urlPlaceholder')}</Label>
                  <Input
                    id="m_url"
                    placeholder="https://..."
                    value={mCustomUrl}
                    onChange={(e) => setMCustomUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m_desc">{t('aiAssistant.media.descLabel')}</Label>
                  <Textarea
                    id="m_desc"
                    rows={3}
                    placeholder={t('aiAssistant.media.descPlaceholder')}
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMediaModalOpen(false)}>
                  {t('aiAssistant.media.cancel')}
                </Button>
                <Button onClick={handleSaveMedia} disabled={uploadingMedia}>
                  {uploadingMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {t('aiAssistant.media.submit')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 4: PLAYGROUND / SIMULADOR */}
        <TabsContent value="playground" className="space-y-4">
          <Card id="tour-ai-playground" className="flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t('aiAssistant.playground.title')}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSimMessages([
                      {
                        id: 'welcome',
                        sender: 'bot',
                        text: t('aiAssistant.playground.restarted'),
                      },
                    ])
                  }
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.playground.clear')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {simMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border text-card-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Handoff Notice */}
                    {msg.handoffRequested && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-300">
                        <Zap className="h-4 w-4 shrink-0" />
                        <span>
                          <strong>{t('aiAssistant.playground.handoffNotice')}</strong> {t('aiAssistant.playground.reason')} {msg.handoffReason}
                        </span>
                      </div>
                    )}

                    {/* Attached Media */}
                    {msg.attachedMedia && msg.attachedMedia.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-2">
                        <span className="text-xs font-semibold">{t('aiAssistant.playground.mediaAttached')}</span>
                        {msg.attachedMedia.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 rounded border bg-background/50 p-2 text-xs">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium truncate">{m.title}</span>
                            <a href={m.media_url} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline">
                              {t('aiAssistant.playground.open')}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {simulating && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('aiAssistant.playground.thinking')}
                </div>
              )}
            </CardContent>

            {/* Input Bar */}
            <div className="border-t p-3 bg-card flex gap-2">
              <Input
                placeholder={t('aiAssistant.playground.inputPlaceholder')}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                disabled={simulating}
              />
              <Button onClick={handleSendSimMessage} disabled={simulating || !simInput.trim()}>
                {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: AUDITORIA & LOGS */}
        <TabsContent value="audit" className="space-y-6">
          <div id="tour-ai-audit" className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> {t('aiAssistant.audit.title')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('aiAssistant.audit.description')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAudit} disabled={loadingAudit}>
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('aiAssistant.audit.totalExecutions')}</p>
                  <p className="text-2xl font-bold">{auditMetrics.totalExecutions}</p>
                </div>
                <Activity className="h-8 w-8 text-primary/60" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('aiAssistant.audit.totalTokens')}</p>
                  <p className="text-2xl font-bold">{auditMetrics.totalTokens.toLocaleString()}</p>
                </div>
                <Cpu className="h-8 w-8 text-emerald-400/60" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('aiAssistant.audit.avgLatency')}</p>
                  <p className="text-2xl font-bold">{auditMetrics.avgLatencyMs} ms</p>
                </div>
                <Clock className="h-8 w-8 text-sky-400/60" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('aiAssistant.audit.handoffRate')}</p>
                  <p className="text-2xl font-bold">{auditMetrics.handoffRate}%</p>
                </div>
                <Zap className="h-8 w-8 text-amber-400/60" />
              </CardContent>
            </Card>
          </div>

          {/* Security Events Card */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" /> {t('aiAssistant.audit.securityEventsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {securityEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  {t('aiAssistant.audit.emptySecurity')}
                </p>
              ) : (
                securityEvents.map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between rounded border border-amber-500/20 bg-background/60 p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={evt.severity === 'critical' ? 'destructive' : 'outline'}
                        className="text-[10px]"
                      >
                        {evt.severity.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-foreground">{evt.event_type}</span>
                      <span className="text-muted-foreground">— {evt.details}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Execution Logs Table */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">{t('aiAssistant.audit.logsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAudit ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-6 text-center">
                  {t('aiAssistant.audit.emptyLogs')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/30 text-muted-foreground uppercase font-mono text-[10px] border-b">
                      <tr>
                        <th className="p-3">{t('aiAssistant.audit.colTimestamp')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colInbound')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colOutbound')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colModel')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colTokens')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colLatency')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colHandoff')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono whitespace-nowrap text-[11px]">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="p-3 max-w-[200px] truncate">{log.inbound_message_text || '-'}</td>
                          <td className="p-3 max-w-[240px] truncate">{log.outbound_text || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">
                              {log.model_used}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono">{log.total_tokens || 0}</td>
                          <td className="p-3 font-mono">{log.execution_time_ms}ms</td>
                          <td className="p-3">
                            {log.handoff_triggered ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Sim ({log.handoff_reason})
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                Não
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
