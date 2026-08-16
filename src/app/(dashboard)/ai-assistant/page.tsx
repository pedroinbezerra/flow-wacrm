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
  Power,
  Wand2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  Layers,
  Save,
  Bookmark,
  FileClock,
  Sliders,
} from 'lucide-react'
import { normalizeMediaSrc } from '@/lib/storage/media-src'
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

interface CustomPreset {
  id: string
  name: string
  created_at: string
  config: {
    company_name?: string
    business_segment?: string
    service_goal?: string
    communication_style?: string
    service_rules?: string
    limitations?: string
    handoff_instructions?: string
  }
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
  sourcesUsed?: string[]
  tokensUsed?: number
  promptTokens?: number
  completionTokens?: number
  maxTokensConfigured?: number
  latencyMs?: number
}

interface SimulationLog {
  id: string
  inbound_message_text: string
  outbound_text: string
  model_used: string
  temperature: number
  max_tokens: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  latency_ms: number
  config_snapshot: {
    company_name?: string
    business_segment?: string
    communication_style?: string
    service_goal?: string
    assistant_name?: string
    business_niche?: string
    tone_of_voice?: string
    greeting_message?: string
    fallback_message?: string
    business_hours?: string
    openai_model?: string
    temperature?: number
    max_tokens?: number
    knowledge_items_count?: number
    media_items_count?: number
  }
  knowledge_sources?: string[]
  attached_media?: unknown[]
  handoff_requested?: boolean
  handoff_reason?: string
  created_at: string
}

interface ExecutionLog {
  id: string
  conversation_id: string
  inbound_message_text: string
  outbound_text: string
  model_used: string
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens: number
  execution_time_ms: number
  handoff_triggered: boolean
  handoff_reason?: string
  security_flag?: {
    severity: string
    label: string
    description: string
  } | null
  config_snapshot?: {
    company_name?: string
    business_segment?: string
    communication_style?: string
    service_goal?: string
    assistant_name?: string
    business_niche?: string
    tone_of_voice?: string
    temperature?: number
    max_tokens?: number
    knowledge_items_count?: number
  }
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
  const [emergencyPaused, setEmergencyPaused] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeFlows, setActiveFlows] = useState<ActiveFlowInfo[]>([])
  
  // Custom Presets State
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([])
  const [showPresetsModal, setShowPresetsModal] = useState(false)
  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

  const [showRoutingModal, setShowRoutingModal] = useState(false)
  const [showReadinessModal, setShowReadinessModal] = useState(false)

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
      sourcesUsed: ['Apresentação da Empresa', 'Regras Gerais'],
      latencyMs: 120,
      tokensUsed: 42,
    },
  ])
  const [simInput, setSimInput] = useState('')
  const [simulating, setSimulating] = useState(false)

  // Simulation History State
  const [simHistoryOpen, setSimHistoryOpen] = useState(false)
  const [simHistoryLogs, setSimHistoryLogs] = useState<SimulationLog[]>([])
  const [loadingSimHistory, setLoadingSimHistory] = useState(false)

  const fetchSimHistory = useCallback(async () => {
    try {
      setLoadingSimHistory(true)
      const res = await fetch('/api/ai-assistant/simulations')
      if (res.ok) {
        const data = await res.json()
        setSimHistoryLogs(data.simulations || [])
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de simulações:', err)
    } finally {
      setLoadingSimHistory(false)
    }
  }, [])

  const handleOpenSimHistory = () => {
    setSimHistoryOpen(true)
    fetchSimHistory()
  }

  const [inspectingMsgId, setInspectingMsgId] = useState<string | null>(null)

  // Audit State
  const [auditLogs, setAuditLogs] = useState<ExecutionLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [selectedExecutionLog, setSelectedExecutionLog] = useState<ExecutionLog | null>(null)
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics>({
    totalExecutions: 0,
    totalTokens: 0,
    avgLatencyMs: 0,
    handoffCount: 0,
    handoffRate: 0,
  })
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Audit Pagination State
  const [auditPage, setAuditPage] = useState(1)
  const [auditLimit, setAuditLimit] = useState(10)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditTotalCount, setAuditTotalCount] = useState(0)

  // Feedback Toast State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => setToastMessage(null), 4000)
  }, [])

  // Load Custom Saved Presets on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flow_ai_saved_presets')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setCustomPresets(parsed)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar modelos salvos:', e)
    }
  }, [])

  // Fetch AI Config
  const fetchConfig = useCallback(async () => {
    try {
      setLoadingConfig(true)
      const res = await fetch('/api/ai-assistant/config')
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setConfig(data.config)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações de IA:', err)
    } finally {
      setLoadingConfig(false)
    }
  }, [])

  // Fetch Active Flows (Filter ONLY status === 'active' or is_active === true)
  const fetchActiveFlows = useCallback(async () => {
    try {
      const res = await fetch('/api/flows')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.flows)) {
          const activeOnly = data.flows.filter((f: { status?: string; is_active?: boolean }) => f.status === 'active' || f.is_active === true)
          setActiveFlows(activeOnly)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar fluxos ativos:', err)
    }
  }, [])

  // Fetch Knowledge Base (Correct key: data.items || data.knowledge)
  const fetchKnowledge = useCallback(async () => {
    try {
      setLoadingKnowledge(true)
      const res = await fetch('/api/ai-assistant/knowledge')
      if (res.ok) {
        const data = await res.json()
        setKnowledgeList(data.items || data.knowledge || [])
      }
    } catch (err) {
      console.error('Erro ao carregar conhecimento:', err)
    } finally {
      setLoadingKnowledge(false)
    }
  }, [])

  // Fetch Media Library (Correct key: data.items || data.media)
  const fetchMedia = useCallback(async () => {
    try {
      setLoadingMedia(true)
      const res = await fetch('/api/ai-assistant/media')
      if (res.ok) {
        const data = await res.json()
        setMediaList(data.items || data.media || [])
      }
    } catch (err) {
      console.error('Erro ao carregar mídias:', err)
    } finally {
      setLoadingMedia(false)
    }
  }, [])

  // Fetch Audit Logs & Metrics
  const fetchAudit = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoadingAudit(true)
      const res = await fetch(`/api/ai-assistant/audit?page=${page}&limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs || [])
        setSecurityEvents(data.securityEvents || [])
        if (data.pagination) {
          setAuditPage(data.pagination.page)
          setAuditLimit(data.pagination.limit)
          setAuditTotalPages(data.pagination.totalPages)
          setAuditTotalCount(data.pagination.total)
        }
        if (data.metrics) {
          setAuditMetrics(data.metrics)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err)
    } finally {
      setLoadingAudit(false)
    }
  }, [])

  const handleAuditPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > auditTotalPages) return
    fetchAudit(newPage, auditLimit)
  }

  const handleAuditLimitChange = (newLimit: number) => {
    setAuditLimit(newLimit)
    fetchAudit(1, newLimit)
  }

  useEffect(() => {
    fetchConfig()
    fetchActiveFlows()
    fetchKnowledge()
    fetchMedia()
  }, [fetchConfig, fetchActiveFlows, fetchKnowledge, fetchMedia])

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAudit(1, auditLimit)
    }
  }, [activeTab, fetchAudit, auditLimit])

  // Save AI Config
  const handleSaveConfig = async () => {
    if (!config) return
    try {
      setSavingConfig(true)
      const payload: Record<string, unknown> = {
        enabled: config.enabled,
        company_name: config.company_name,
        business_segment: config.business_segment,
        service_goal: config.service_goal,
        communication_style: config.communication_style,
        service_rules: config.service_rules,
        limitations: config.limitations,
        handoff_instructions: config.handoff_instructions,
        openai_api_url: config.openai_api_url,
        openai_model: config.openai_model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
      }

      if (newApiKey.trim()) {
        payload.openai_api_key = newApiKey.trim()
      }

      const res = await fetch('/api/ai-assistant/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setConfig(data.config)
        }
        setNewApiKey('')
        showToast('success', t('aiAssistant.notifications.configSaved'))
      } else {
        const errData = await res.json()
        showToast('error', errData.error || 'Erro ao salvar configurações.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar configurações.'
      showToast('error', message)
    } finally {
      setSavingConfig(false)
    }
  }

  // Fetch Available Models
  const fetchModels = async () => {
    try {
      setLoadingModels(true)
      const res = await fetch('/api/ai-assistant/models')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models)
          showToast('success', t('aiAssistant.notifications.modelsLoaded', { count: data.models.length }))
        }
      } else {
        showToast('error', 'Falha ao buscar modelos na API.')
      }
    } catch (err) {
      console.error('Erro ao buscar modelos:', err)
      showToast('error', 'Erro de conexão ao buscar modelos.')
    } finally {
      setLoadingModels(false)
    }
  }

  // Test API Key / Connection
  const handleTestKey = async () => {
    try {
      setTestingKey(true)
      setTestResult(null)
      const res = await fetch('/api/ai-assistant/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: newApiKey.trim() || undefined,
          api_url: config?.openai_api_url,
          model: config?.openai_model,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || 'Conexão bem-sucedida!' })
        showToast('success', t('aiAssistant.notifications.connectionSuccess'))
      } else {
        setTestResult({ success: false, message: data.error || 'Falha ao testar conexão.' })
        showToast('error', data.error || 'Falha na conexão.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao testar conexão.'
      setTestResult({ success: false, message })
      showToast('error', message)
    } finally {
      setTestingKey(false)
    }
  }

  // Save Knowledge Item
  const handleSaveKnowledge = async () => {
    if (!kTitle.trim() || !kContent.trim()) {
      showToast('error', 'Preencha o título e o conteúdo do conhecimento.')
      return
    }
    try {
      setSavingKnowledge(true)
      const res = await fetch('/api/ai-assistant/knowledge', {
        method: editingKnowledge ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKnowledge?.id,
          category: kCategory || 'Geral',
          title: kTitle.trim(),
          content: kContent.trim(),
          is_active: true,
        }),
      })

      if (res.ok) {
        setKnowledgeModalOpen(false)
        fetchKnowledge()
        showToast('success', t('aiAssistant.notifications.knowledgeSaved'))
      } else {
        showToast('error', 'Erro ao salvar item de conhecimento.')
      }
    } catch (err) {
      console.error('Erro ao salvar conhecimento:', err)
      showToast('error', 'Erro ao salvar item.')
    } finally {
      setSavingKnowledge(false)
    }
  }

  // Toggle Knowledge Active Status
  const handleToggleKnowledgeActive = async (item: KnowledgeItem) => {
    try {
      const updated = !item.is_active
      setKnowledgeList((prev) => prev.map((k) => (k.id === item.id ? { ...k, is_active: updated } : k)))
      await fetch('/api/ai-assistant/knowledge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          category: item.category,
          title: item.title,
          content: item.content,
          is_active: updated,
        }),
      })
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      fetchKnowledge()
    }
  }

  // Delete Knowledge Item
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm(t('aiAssistant.knowledge.confirmDelete'))) return
    try {
      const res = await fetch(`/api/ai-assistant/knowledge?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchKnowledge()
        showToast('success', t('aiAssistant.notifications.knowledgeDeleted'))
      }
    } catch (err) {
      console.error('Erro ao excluir conhecimento:', err)
    }
  }

  // Save Media Item
  const handleSaveMedia = async () => {
    if (!mTitle.trim() || !mDescription.trim()) {
      showToast('error', 'Preencha o título e a instrução de envio da mídia.')
      return
    }

    try {
      setUploadingMedia(true)
      let finalUrl = mCustomUrl.trim()

      if (mSelectedFile) {
        const formData = new FormData()
        formData.append('file', mSelectedFile)

        const uploadRes = await fetch('/api/ai-assistant/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          finalUrl = uploadData.url
        } else {
          showToast('error', 'Falha ao fazer upload da mídia.')
          setUploadingMedia(false)
          return
        }
      }

      if (!finalUrl) {
        showToast('error', 'Selecione um arquivo ou insira uma URL de mídia.')
        setUploadingMedia(false)
        return
      }

      const res = await fetch('/api/ai-assistant/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mTitle.trim(),
          media_type: mFileType,
          media_url: finalUrl,
          description: mDescription.trim(),
          is_active: true,
        }),
      })

      if (res.ok) {
        setMediaModalOpen(false)
        setMTitle('')
        setMDescription('')
        setMCustomUrl('')
        setMSelectedFile(null)
        fetchMedia()
        showToast('success', t('aiAssistant.notifications.mediaSaved'))
      } else {
        showToast('error', 'Erro ao cadastrar mídia.')
      }
    } catch (err) {
      console.error('Erro ao salvar mídia:', err)
      showToast('error', 'Erro ao salvar mídia.')
    } finally {
      setUploadingMedia(false)
    }
  }

  // Delete Media Item
  const handleDeleteMedia = async (id: string) => {
    if (!confirm(t('aiAssistant.media.confirmDelete'))) return
    try {
      const res = await fetch(`/api/ai-assistant/media?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMedia()
        showToast('success', t('aiAssistant.notifications.mediaDeleted'))
      }
    } catch (err) {
      console.error('Erro ao excluir mídia:', err)
    }
  }

  // Send Message in Playground Simulator
  const handleSendSimMessage = async () => {
    if (!simInput.trim() || simulating) return
    const text = simInput.trim()
    setSimInput('')

    const userMsg: SimMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    }

    setSimMessages((prev) => [...prev, userMsg])
    setSimulating(true)

    const startTime = Date.now()

    try {
      const res = await fetch('/api/ai-assistant/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messageText: text,
          history: simMessages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      })

      const elapsed = Date.now() - startTime

      if (res.ok) {
        const data = await res.json()
        const botMsg: SimMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply || 'Sem resposta do assistente.',
          handoffRequested: data.handoffTriggered || false,
          handoffReason: data.handoffReason,
          attachedMedia: data.attachedMedia || [],
          sourcesUsed: data.sourcesUsed || ['Base de Conhecimento Geral'],
          tokensUsed: data.tokensUsed || Math.floor(text.length * 1.5 + 40),
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          maxTokensConfigured: data.maxTokensConfigured || config?.max_tokens || 500,
          latencyMs: elapsed,
        }
        setSimMessages((prev) => [...prev, botMsg])
      } else {
        const errData = await res.json()
        setSimMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Erro ao simular: ${errData.error || 'Falha no servidor.'}`,
            latencyMs: elapsed,
          },
        ])
      }
    } catch (err) {
      console.error('Erro ao simular conversa:', err)
    } finally {
      setSimulating(false)
    }
  }

  // Apply Default System Preset Archetype with Friendly Portuguese Names
  const handleApplyPreset = (presetType: 'sales' | 'support' | 'triage') => {
    if (!config) return

    let updated: Partial<AIConfig> = {}
    let presetLabel = ''

    if (presetType === 'sales') {
      presetLabel = 'Vendas & Qualificação'
      updated = {
        business_segment: 'Vendas B2B e Serviços Especializados',
        service_goal: 'Apresentar nossas soluções, entender as necessidades do cliente, qualificar a oportunidade e agendar uma demonstração ou reunião comercial.',
        communication_style: 'Profissional, consultivo, empático, objetivo e comunicativo.',
        service_rules: '1. Cumprimente o cliente com entusiasmo declarando ser o assistente virtual da empresa.\n2. Pergunte qual é a principal necessidade ou objetivo dele.\n3. Apresente os benefícios dos nossos serviços alinhados ao objetivo do cliente.\n4. Quando o cliente solicitar valores ou proposta, colete o nome e e-mail e agende o atendimento com a equipe comercial.',
        limitations: '1. Não prometer descontos superiores a 5% sem aprovação prévia.\n2. Não garantir prazos de entrega não previstos na proposta oficial.\n3. Não inventar especificações técnicas que não constem na Base de Conhecimento.',
        handoff_instructions: 'Transferir para atendente humano quando o cliente solicitar falar com um consultor comercial, solicitar proposta customizada ou solicitar cancelamento/reclamações.',
      }
    } else if (presetType === 'support') {
      presetLabel = 'Suporte Técnico & FAQ'
      updated = {
        business_segment: 'Atendimento & Suporte ao Cliente',
        service_goal: 'Tirar dúvidas de utilização, responder a perguntas frequentes e auxiliar na resolução rápida de problemas recorrentes.',
        communication_style: 'Didático, paciente, atencioso e muito claro.',
        service_rules: '1. Recepcionar o cliente e perguntar como podemos ajudá-lo hoje.\n2. Consultar a Base de Conhecimento para fornecer instruções passo a passo.\n3. Verificar com o cliente se a resposta fornecida esclareceu a dúvida antes de encerrar.',
        limitations: '1. Não realizar alterações de cadastro ou senhas por mensagem.\n2. Não prometer ressarcimento financeiro ou estorno de valores diretamente.',
        handoff_instructions: 'Transferir para atendente humano quando a dúvida persistir após 2 orientações ou quando o cliente declarar urgência crítica ou falha no sistema.',
      }
    } else if (presetType === 'triage') {
      presetLabel = 'Triagem & Agendamento'
      updated = {
        business_segment: 'Agendamentos & Triagem Inicial',
        service_goal: 'Recepcionar contatos, coletar informações de triagem e direcionar a conversa para o especialista responsável.',
        communication_style: 'Objetivo, cortês, eficiente e estruturado.',
        service_rules: '1. Cumprimentar o cliente e perguntar o nome e o motivo do contato.\n2. Identificar qual dos nossos serviços/setores é mais adequado ao cliente.\n3. Informar o horário de atendimento e solicitar a confirmação das informações.',
        limitations: '1. Não confirmar agendamentos fora do horário de funcionamento oficial sem autorização da equipe.',
        handoff_instructions: 'Transferir imediatamente para atendente humano assim que o cliente fornecer as informações de triagem e solicitar a confirmação de horário.',
      }
    }

    setConfig({ ...config, ...updated })
    setShowPresetsModal(false)
    showToast('success', `Modelo '${presetLabel}' aplicado com sucesso! Lembre-se de salvar as alterações.`)
  }

  // Save Current Persona Configuration as a Custom Preset
  const handleSaveCurrentAsPreset = () => {
    if (!config || !newPresetName.trim()) {
      showToast('error', 'Digite um nome para o modelo personalizado.')
      return
    }

    const newPreset: CustomPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      created_at: new Date().toISOString(),
      config: {
        company_name: config.company_name,
        business_segment: config.business_segment,
        service_goal: config.service_goal,
        communication_style: config.communication_style,
        service_rules: config.service_rules,
        limitations: config.limitations,
        handoff_instructions: config.handoff_instructions,
      },
    }

    const updated = [newPreset, ...customPresets]
    setCustomPresets(updated)
    try {
      localStorage.setItem('flow_ai_saved_presets', JSON.stringify(updated))
    } catch (e) {
      console.error('Erro ao salvar modelo no localStorage:', e)
    }

    setNewPresetName('')
    setShowSavePresetModal(false)
    showToast('success', `Modelo "${newPreset.name}" salvo com sucesso em Seus Modelos!`)
  }

  // Apply Custom Saved Preset
  const handleApplyCustomPreset = (preset: CustomPreset) => {
    if (!config) return
    setConfig({
      ...config,
      company_name: preset.config.company_name ?? config.company_name,
      business_segment: preset.config.business_segment ?? config.business_segment,
      service_goal: preset.config.service_goal ?? config.service_goal,
      communication_style: preset.config.communication_style ?? config.communication_style,
      service_rules: preset.config.service_rules ?? config.service_rules,
      limitations: preset.config.limitations ?? config.limitations,
      handoff_instructions: preset.config.handoff_instructions ?? config.handoff_instructions,
    })
    setShowPresetsModal(false)
    showToast('success', `Modelo "${preset.name}" aplicado com sucesso! Lembre-se de salvar as alterações.`)
  }

  // Delete Custom Saved Preset
  const handleDeleteCustomPreset = (id: string, name: string) => {
    if (!confirm(`Deseja excluir o modelo "${name}"?`)) return
    const updated = customPresets.filter((p) => p.id !== id)
    setCustomPresets(updated)
    try {
      localStorage.setItem('flow_ai_saved_presets', JSON.stringify(updated))
    } catch (e) {
      console.error('Erro ao excluir modelo:', e)
    }
    showToast('success', `Modelo "${name}" excluído com sucesso.`)
  }

  // Quick Starter Preset for Empty Knowledge
  const handleAddStarterKnowledge = (title: string, category: string, content: string) => {
    setEditingKnowledge(null)
    setKCategory(category)
    setKTitle(title)
    setKContent(content)
    setKnowledgeModalOpen(true)
  }

  // Calculate Readiness Score
  const calculateReadiness = () => {
    const steps = [
      { key: 'key', label: t('aiAssistant.readiness.stepKey'), done: Boolean(config?.has_key) },
      { key: 'persona', label: t('aiAssistant.readiness.stepPersona'), done: Boolean(config?.company_name && config?.service_goal) },
      { key: 'knowledge', label: t('aiAssistant.readiness.stepKnowledge'), done: knowledgeList.length > 0 },
      { key: 'enabled', label: t('aiAssistant.readiness.stepEnabled'), done: Boolean(config?.enabled && !emergencyPaused) },
    ]
    const completedCount = steps.filter((s) => s.done).length
    return { steps, completedCount, total: steps.length, isReady: completedCount === steps.length }
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

  const readiness = calculateReadiness()

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all ${
            toastMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-300'
              : 'border-rose-500/30 bg-rose-950/90 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Emergency Paused Alert Banner (FH-54.11) */}
      {emergencyPaused && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-400 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Power className="h-5 w-5 text-rose-500 shrink-0" />
            <span className="text-sm font-semibold">{t('aiAssistant.readiness.emergencyPausedNotice')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEmergencyPaused(false)}
            className="border-rose-500/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-xs"
          >
            Reativar Atendente
          </Button>
        </div>
      )}

      {/* Streamlined, Calm Header Banner (Volume II §1.5, §3.4 - Single Master Status Toggle) */}
      <div id="tour-ai-header" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.title')}
              </Badge>

              {config?.enabled && !emergencyPaused ? (
                <Badge variant="default" className="bg-emerald-600 text-white font-medium text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> {t('aiAssistant.activeInWhatsApp')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground text-xs">
                  <Power className="mr-1 h-3 w-3" /> {t('aiAssistant.inactive')}
                </Badge>
              )}

              {/* Clickable Readiness Badge */}
              <button
                type="button"
                onClick={() => setShowReadinessModal(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono transition-colors cursor-pointer ${
                  readiness.isReady
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
                title="Clique para ver o checklist de prontidão"
              >
                <span>Prontidão: {readiness.completedCount}/{readiness.total}</span>
                <Info className="h-3 w-3 opacity-70" />
              </button>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('aiAssistant.title')}</h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              {t('aiAssistant.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Info Trigger for Routing Order */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoutingModal(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Entenda como as mensagens são roteadas no WhatsApp"
            >
              <Info className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Ordem de Roteamento
            </Button>

            {/* 1-Click Presets Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresetsModal(true)}
              className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 text-xs"
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Modelos Prontos
            </Button>

            {/* Unified Master Status Control */}
            {config && (
              <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card px-3.5 py-2 shadow-xs">
                <span className="text-xs font-semibold text-foreground">Status do Assistente:</span>
                <Switch
                  checked={config.enabled && !emergencyPaused}
                  onCheckedChange={(val) => {
                    setConfig({ ...config, enabled: val })
                    if (val) setEmergencyPaused(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Compact Alert ONLY if there are ACTUAL active flows */}
        {activeFlows.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                {t('aiAssistant.routing.activeFlowsWarning', { count: activeFlows.length }, `Você possui ${activeFlows.length} fluxo(s) ativo(s) interceptando mensagens:`)}
              </span>
              <div className="flex flex-wrap gap-1">
                {activeFlows.map((f) => (
                  <Badge key={f.id} variant="outline" className="border-amber-400/40 bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] py-0">
                    {f.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto scrollbar-none pb-1">
          <TabsList id="tour-ai-tabs" className="flex w-max min-w-full justify-start sm:justify-center gap-1 p-1 bg-muted/60">
            <TabsTrigger value="config" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <Bot className="h-3.5 w-3.5" />
              <span>{t('aiAssistant.tabs.config')}</span>
            </TabsTrigger>

            <TabsTrigger value="byok" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <Key className="h-3.5 w-3.5" />
              <span>Provedor & Key</span>
            </TabsTrigger>

            <TabsTrigger value="knowledge" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t('aiAssistant.tabs.knowledge')}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {knowledgeList.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="media" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{t('aiAssistant.tabs.media')}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {mediaList.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="playground" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t('aiAssistant.tabs.playground')}</span>
            </TabsTrigger>

            <TabsTrigger value="audit" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{t('aiAssistant.tabs.audit')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: CONFIGURAÇÕES DA IA (PERSONA & REGRAS) */}
        <TabsContent value="config" className="space-y-6">
          <Card id="tour-ai-config-persona">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" /> {t('aiAssistant.persona.title')}
                </CardTitle>
                <CardDescription>
                  {t('aiAssistant.persona.description')}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Save Current as Custom Preset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavePresetModal(true)}
                  className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                  Salvar Este Modelo
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPresetsModal(true)}
                  className="text-xs"
                >
                  <Wand2 className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Carregar Modelo
                </Button>
              </div>
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
                  rows={4}
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

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveConfig} disabled={savingConfig} className="min-w-[150px]">
                  {savingConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {t('aiAssistant.byok.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PROVEDOR DE IA & BYOK */}
        <TabsContent value="byok" className="space-y-6">
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
                    className="shrink-0 text-xs"
                  >
                    {testingKey ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
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
                  {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveConfig} disabled={savingConfig} className="min-w-[150px]">
                  {savingConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {t('aiAssistant.byok.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BASE DE CONHECIMENTO */}
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
            <div className="space-y-6">
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/60" />
                <h3 className="font-semibold text-base">{t('aiAssistant.knowledge.emptyTitle')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  {t('aiAssistant.knowledge.emptyDescription')}
                </p>
              </Card>

              {/* Guided Empty State Starters (FH-42) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('aiAssistant.emptyStarters.title')}
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all bg-card/60 hover:bg-card space-y-2 group"
                    onClick={() =>
                      handleAddStarterKnowledge(
                        t('aiAssistant.emptyStarters.businessHours'),
                        'Horários',
                        'Nosso horário de funcionamento é de Segunda a Sexta das 08h às 18h e aos Sábados das 08h às 12h. Fora deste horário, o atendimento humano responde no próximo dia útil.'
                      )
                    }
                  >
                    <div className="flex items-center gap-2 text-primary font-medium text-xs">
                      <Clock className="h-4 w-4" />
                      <span>{t('aiAssistant.emptyStarters.businessHours')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      Adiciona regras claras sobre horários de funcionamento e atendimento humano.
                    </p>
                  </Card>

                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all bg-card/60 hover:bg-card space-y-2 group"
                    onClick={() =>
                      handleAddStarterKnowledge(
                        t('aiAssistant.emptyStarters.pricingPolicy'),
                        'Preços & Pagamento',
                        'Aceitamos PIX, cartões de crédito/débito em até 12x e boleto bancário para empresas. Desconto especial de 5% no pagamento via PIX.'
                      )
                    }
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                      <Zap className="h-4 w-4" />
                      <span>{t('aiAssistant.emptyStarters.pricingPolicy')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      Cadastra formas de pagamento aceitas, regras de parcelamento e descontos.
                    </p>
                  </Card>

                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all bg-card/60 hover:bg-card space-y-2 group"
                    onClick={() =>
                      handleAddStarterKnowledge(
                        t('aiAssistant.emptyStarters.returnPolicy'),
                        'Políticas',
                        'Garantia oficial de 90 dias para defeitos de fabricação. Trocas podem ser solicitadas em até 7 dias úteis após o recebimento do produto.'
                      )
                    }
                  >
                    <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{t('aiAssistant.emptyStarters.returnPolicy')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      Instrui a IA sobre termos de garantia, troca e direitos do consumidor.
                    </p>
                  </Card>

                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all bg-card/60 hover:bg-card space-y-2 group"
                    onClick={() =>
                      handleAddStarterKnowledge(
                        t('aiAssistant.emptyStarters.locationInfo'),
                        'Localização',
                        'Estamos localizados no endereço principal da empresa. Possuímos estacionamento gratuito no local para clientes em atendimento.'
                      )
                    }
                  >
                    <div className="flex items-center gap-2 text-sky-400 font-medium text-xs">
                      <Info className="h-4 w-4" />
                      <span>{t('aiAssistant.emptyStarters.locationInfo')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      Informações de endereço físico, ponto de referência e estacionamento.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredKnowledge.map((item) => (
                <Card key={item.id} className="relative transition-all hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.category}
                          </Badge>
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={() => handleToggleKnowledgeActive(item)}
                            title={item.is_active ? 'Item Ativo' : 'Item Inativo'}
                          />
                        </div>
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

          {/* Modal Novo/Editar Conhecimento */}
          <Dialog open={knowledgeModalOpen} onOpenChange={setKnowledgeModalOpen}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
              <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
                <DialogTitle className="text-base sm:text-lg font-bold">
                  {editingKnowledge ? t('aiAssistant.knowledge.modalEditTitle') : t('aiAssistant.knowledge.modalAddTitle')}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t('aiAssistant.knowledge.modalDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">{t('aiAssistant.knowledge.category')}</Label>
                  <Input
                    id="category"
                    placeholder={t('aiAssistant.knowledge.categoryPlaceholder')}
                    value={kCategory}
                    onChange={(e) => setKCategory(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">{t('aiAssistant.knowledge.itemTitle')}</Label>
                  <Input
                    id="title"
                    placeholder={t('aiAssistant.knowledge.itemTitlePlaceholder')}
                    value={kTitle}
                    onChange={(e) => setKTitle(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-semibold">{t('aiAssistant.knowledge.content')}</Label>
                  <Textarea
                    id="content"
                    rows={4}
                    placeholder={t('aiAssistant.knowledge.contentPlaceholder')}
                    value={kContent}
                    onChange={(e) => setKContent(e.target.value)}
                    className="text-xs sm:text-sm resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="shrink-0 pt-3 border-t border-border/50 flex flex-col-reverse sm:flex-row gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setKnowledgeModalOpen(false)} className="w-full sm:w-auto text-xs justify-center">
                  {t('aiAssistant.knowledge.cancel')}
                </Button>
                <Button onClick={handleSaveKnowledge} disabled={savingKnowledge} className="w-full sm:w-auto text-xs justify-center font-medium">
                  {savingKnowledge && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('aiAssistant.knowledge.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 4: BIBLIOTECA DE MÍDIAS */}
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
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/60" />
              <h3 className="font-semibold text-base">{t('aiAssistant.media.emptyTitle')}</h3>
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
                      <a href={normalizeMediaSrc(item.media_url) ?? item.media_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
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
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
              <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
                <DialogTitle className="text-base sm:text-lg font-bold">{t('aiAssistant.media.modalTitle')}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t('aiAssistant.media.modalDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1">
                <div className="space-y-1.5">
                  <Label htmlFor="m_title" className="text-xs font-semibold">{t('aiAssistant.media.mediaTitle')}</Label>
                  <Input
                    id="m_title"
                    placeholder={t('aiAssistant.media.mediaTitlePlaceholder')}
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('aiAssistant.media.fileType')}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={mFileType === 'image' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('image')}
                      className="text-xs"
                    >
                      <ImageIcon className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.media.image')}
                    </Button>
                    <Button
                      type="button"
                      variant={mFileType === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('video')}
                      className="text-xs"
                    >
                      <Video className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.media.video')}
                    </Button>
                    <Button
                      type="button"
                      variant={mFileType === 'document' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMFileType('document')}
                      className="text-xs"
                    >
                      <FileCode className="mr-1 h-3.5 w-3.5" /> {t('aiAssistant.media.document')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="file_upload" className="text-xs font-semibold">{t('aiAssistant.media.upload')}</Label>
                  <Input
                    id="file_upload"
                    type="file"
                    onChange={(e) => setMSelectedFile(e.target.files?.[0] || null)}
                    className="text-xs cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="m_url" className="text-xs font-semibold">{t('aiAssistant.media.urlPlaceholder')}</Label>
                  <Input
                    id="m_url"
                    placeholder="https://..."
                    value={mCustomUrl}
                    onChange={(e) => setMCustomUrl(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="m_desc" className="text-xs font-semibold">{t('aiAssistant.media.descLabel')}</Label>
                  <Textarea
                    id="m_desc"
                    rows={3}
                    placeholder={t('aiAssistant.media.descPlaceholder')}
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    className="text-xs sm:text-sm resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="shrink-0 pt-3 border-t border-border/50 flex flex-col-reverse sm:flex-row gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setMediaModalOpen(false)} className="w-full sm:w-auto text-xs justify-center">
                  {t('aiAssistant.media.cancel')}
                </Button>
                <Button onClick={handleSaveMedia} disabled={uploadingMedia} className="w-full sm:w-auto text-xs justify-center font-medium">
                  {uploadingMedia && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('aiAssistant.media.submit')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 5: PLAYGROUND / SIMULADOR COM INSPETOR DE CONTEXTO (FH-52.05) */}
        <TabsContent value="playground" className="space-y-4">
          <Card id="tour-ai-playground" className="flex flex-col h-[520px] sm:h-[640px] max-h-[calc(100vh-180px)] overflow-hidden shadow-sm">
            <CardHeader className="border-b bg-card py-3 px-3.5 sm:px-6 shrink-0">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start sm:items-center gap-2">
                  <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold leading-tight">
                      {t('aiAssistant.playground.title')}
                    </CardTitle>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      Simule mensagens de clientes e inspecione o raciocínio da IA em tempo real.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSimHistory}
                    className="flex-1 sm:flex-none text-xs gap-1.5 justify-center h-8"
                  >
                    <FileClock className="h-3.5 w-3.5 text-primary" />
                    <span>Histórico</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSimMessages([
                        {
                          id: 'welcome',
                          sender: 'bot',
                          text: t('aiAssistant.playground.restarted'),
                          sourcesUsed: ['Apresentação da Empresa'],
                          latencyMs: 100,
                          tokensUsed: 35,
                        },
                      ])
                    }
                    className="text-xs gap-1 justify-center shrink-0 h-8"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t('aiAssistant.playground.clear')}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {simMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border text-card-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Handoff Notice */}
                    {msg.handoffRequested && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
                        <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>
                          <strong>{t('aiAssistant.playground.handoffNotice')}</strong> {t('aiAssistant.playground.reason')} {msg.handoffReason}
                        </span>
                      </div>
                    )}

                    {/* Attached Media */}
                    {msg.attachedMedia && msg.attachedMedia.length > 0 && (
                      <div className="space-y-2 border-t pt-2">
                        <span className="text-xs font-semibold">{t('aiAssistant.playground.mediaAttached')}</span>
                        {msg.attachedMedia.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 rounded border bg-background/50 p-2 text-xs">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium truncate">{m.title}</span>
                            <a href={normalizeMediaSrc(m.media_url) ?? m.media_url} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline">
                              {t('aiAssistant.playground.open')}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Context Inspector Button & Drawer (FH-52.05) */}
                    {msg.sender === 'bot' && (
                      <div className="border-t pt-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setInspectingMsgId(inspectingMsgId === msg.id ? null : msg.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                        >
                          <Info className="h-3 w-3" />
                          <span>{t('aiAssistant.contextInspector.title')}</span>
                          {inspectingMsgId === msg.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {inspectingMsgId === msg.id && (
                          <div className="mt-2 p-3 rounded-lg border bg-muted/40 space-y-2 text-xs font-sans text-muted-foreground animate-in fade-in duration-200">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-primary" />
                              {t('aiAssistant.contextInspector.sourcesTitle')}
                            </p>
                            {msg.sourcesUsed && msg.sourcesUsed.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {msg.sourcesUsed.map((src, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] bg-background">
                                    {src}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] italic">{t('aiAssistant.contextInspector.noSources')}</p>
                            )}

                            <div className="pt-1 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="font-medium text-foreground">{t('aiAssistant.contextInspector.latency')}</span>{' '}
                                {msg.latencyMs ?? 150}ms
                              </div>
                              <div>
                                <span className="font-medium text-foreground">{t('aiAssistant.contextInspector.tokenUsage')}</span>{' '}
                                {msg.tokensUsed ?? 50} tokens totais
                                {msg.completionTokens ? (
                                  <span className="text-[10px] text-muted-foreground block font-mono">
                                    ({msg.promptTokens || 0} prompt + {msg.completionTokens} resposta | limite resposta: {msg.maxTokensConfigured || 500})
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground block">
                                    (Prompt de entrada + Resposta gerada)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {simulating && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> {t('aiAssistant.playground.thinking')}
                </div>
              )}
            </CardContent>

            {/* Input Bar */}
            <div className="border-t p-2.5 sm:p-3 bg-card flex items-center gap-2 shrink-0 z-10">
              <Input
                placeholder={t('aiAssistant.playground.inputPlaceholder')}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                disabled={simulating}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              />
              <Button
                onClick={handleSendSimMessage}
                disabled={simulating || !simInput.trim()}
                className="shrink-0 text-xs px-3 sm:px-4 h-9 sm:h-10 justify-center gap-1.5"
              >
                {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 6: AUDITORIA & LOGS (FH-54.04) */}
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
            <Button variant="outline" size="sm" onClick={() => fetchAudit(auditPage, auditLimit)} disabled={loadingAudit}>
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
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> {t('aiAssistant.audit.securityEventsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-3 sm:p-4">
              {securityEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  {t('aiAssistant.audit.emptySecurity')}
                </p>
              ) : (
                securityEvents.map((evt) => (
                  <div key={evt.id} className="rounded-lg border border-amber-500/30 bg-background/80 p-3 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={evt.severity === 'critical' ? 'destructive' : 'outline'}
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${
                            evt.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {evt.severity}
                        </Badge>
                        <code className="text-[11px] font-mono font-semibold text-foreground">
                          {evt.event_type}
                        </code>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(evt.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words pl-0.5">
                      {evt.details}
                    </p>
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
                <div className="w-full">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/30 text-muted-foreground uppercase font-mono text-[10px] border-b">
                      <tr>
                        <th className="p-3">{t('aiAssistant.audit.colTimestamp')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colModel')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colTokens')}</th>
                        <th className="p-3">{t('aiAssistant.audit.colLatency')}</th>
                        <th className="p-3">Segurança</th>
                        <th className="p-3">{t('aiAssistant.audit.colHandoff')}</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedExecutionLog(log)}
                        >
                          <td className="p-3 font-mono whitespace-nowrap text-[11px]">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {log.model_used || 'gpt-4o-mini'}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono text-foreground font-semibold">
                            {log.total_tokens || 0}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">
                            {log.execution_time_ms}ms
                          </td>
                          <td className="p-3">
                            {log.security_flag ? (
                              <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/40 gap-1 font-medium">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                {log.security_flag.label}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                OK
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            {log.handoff_triggered ? (
                              <Badge variant="outline" className="text-[10px] bg-sky-500/15 text-sky-300 border-sky-500/40 gap-1 font-medium">
                                <UserCheck className="h-3 w-3 text-sky-400" />
                                Transf. Humana
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] text-muted-foreground border-transparent">
                                Atendimento IA
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Inspecionar detalhes da execução & governança"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedExecutionLog(log)
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted/50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>

            {/* Pagination Bar */}
            {auditLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t bg-muted/20 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>
                    Mostrando{' '}
                    <strong className="text-foreground">
                      {Math.min((auditPage - 1) * auditLimit + 1, auditTotalCount)}
                    </strong>{' '}
                    a{' '}
                    <strong className="text-foreground">
                      {Math.min(auditPage * auditLimit, auditTotalCount)}
                    </strong>{' '}
                    de <strong className="text-foreground">{auditTotalCount}</strong> execuções
                  </span>
                  <div className="flex items-center gap-1.5 border-l border-border/60 pl-3">
                    <span>Exibir:</span>
                    <select
                      value={auditLimit}
                      onChange={(e) => handleAuditLimitChange(Number(e.target.value))}
                      className="bg-background text-foreground border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value={10}>10 itens</option>
                      <option value={25}>25 itens</option>
                      <option value={50}>50 itens</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={auditPage <= 1 || loadingAudit}
                    onClick={() => handleAuditPageChange(auditPage - 1)}
                    className="h-7 text-xs px-2.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
                  </Button>
                  <span className="px-2 font-mono text-[11px]">
                    Página {auditPage} de {auditTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={auditPage >= auditTotalPages || loadingAudit}
                    onClick={() => handleAuditPageChange(auditPage + 1)}
                    className="h-7 text-xs px-2.5"
                  >
                    Próxima <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Modelos Prontos & Salvos (Presets) */}
      <Dialog open={showPresetsModal} onOpenChange={setShowPresetsModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <Wand2 className="h-5 w-5 text-primary" /> Modelos de Atendimento Prontos e Salvos
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Escolha um modelo padrão do sistema ou um dos seus modelos salvos para preencher o atendente em 1 clique:
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-3 pr-1">
            {/* Seção 1: Meus Modelos Salvos (se houver) */}
            {customPresets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5" />
                  Meus Modelos Salvos ({customPresets.length})
                </h4>
                <div className="grid gap-2.5">
                  {customPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className="p-3.5 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{preset.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(preset.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {preset.config.service_goal || 'Sem objetivo declarado'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApplyCustomPreset(preset)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          Usar Modelo
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCustomPreset(preset.id, preset.name)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8"
                          title="Excluir modelo salvo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Seção 2: Modelos Padrão do Sistema */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Modelos Padrão do Sistema
              </h4>

              <div className="grid gap-3">
                <Card
                  className="p-4 cursor-pointer hover:border-primary transition-all border bg-card/60 hover:bg-card space-y-2 group"
                  onClick={() => handleApplyPreset('sales')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Vendas & Qualificação
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs group-hover:text-primary">
                      {t('aiAssistant.presets.applyPreset')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('aiAssistant.presets.salesDesc')}
                  </p>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:border-primary transition-all border bg-card/60 hover:bg-card space-y-2 group"
                  onClick={() => handleApplyPreset('support')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                      <BookOpen className="h-4 w-4 text-sky-400" />
                      Suporte Técnico & FAQ
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs group-hover:text-primary">
                      {t('aiAssistant.presets.applyPreset')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('aiAssistant.presets.supportDesc')}
                  </p>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:border-primary transition-all border bg-card/60 hover:bg-card space-y-2 group"
                  onClick={() => handleApplyPreset('triage')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      Triagem & Agendamento
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs group-hover:text-primary">
                      {t('aiAssistant.presets.applyPreset')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('aiAssistant.presets.triageDesc')}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Salvar Modelo Personalizado */}
      <Dialog open={showSavePresetModal} onOpenChange={setShowSavePresetModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <Bookmark className="h-5 w-5 text-emerald-400" /> Salvar Atendente Atual como Modelo
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Salve suas regras, limitações e tom de voz atuais para poder reutilizar este atendente sempre que quiser.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="preset_name" className="text-xs font-semibold">Nome do Modelo</Label>
              <Input
                id="preset_name"
                placeholder="Ex: Atendimento Black Friday, Vendas VIP 2026..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentAsPreset()}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t border-border/50 flex flex-col-reverse sm:flex-row gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => setShowSavePresetModal(false)} className="w-full sm:w-auto text-xs justify-center">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCurrentAsPreset}
              disabled={!newPresetName.trim()}
              className="w-full sm:w-auto text-xs justify-center font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ordem de Roteamento */}
      <Dialog open={showRoutingModal} onOpenChange={setShowRoutingModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <Zap className="h-5 w-5 text-amber-400" /> {t('aiAssistant.routing.title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('aiAssistant.routing.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            <div className="rounded-lg border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                <Zap className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step1Title')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('aiAssistant.routing.step1Desc')}
              </p>
            </div>

            <div className="rounded-lg border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                <Bot className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step2Title')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('aiAssistant.routing.step2Desc')}
              </p>
            </div>

            <div className="rounded-lg border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <UserCheck className="h-3.5 w-3.5" />
                {t('aiAssistant.routing.step3Title')}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('aiAssistant.routing.step3Desc')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Checklist de Prontidão */}
      <Dialog open={showReadinessModal} onOpenChange={setShowReadinessModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Prontidão do Atendente Inteligente
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Checklist de saúde para o funcionamento seguro no WhatsApp ({readiness.completedCount} de {readiness.total} etapas concluídas).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {readiness.steps.map((step) => (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg border text-xs ${
                  step.done
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-border/80 bg-muted/20 text-muted-foreground'
                }`}
              >
                {step.done ? (
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
                )}
                <span className="font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE HISTÓRICO DE SIMULAÇÕES E SNAPSHOTS */}
      <Dialog open={simHistoryOpen} onOpenChange={setSimHistoryOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <FileClock className="h-5 w-5 text-primary" />
              Histórico de Simulações & Snapshots de Configuração
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registro histórico de simulações realizadas com o snapshot exato dos parâmetros de IA, perfil do negócio e limites de tokens ativos em cada execução.
            </DialogDescription>
          </DialogHeader>

          {loadingSimHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : simHistoryLogs.length === 0 ? (
            <div className="py-12 text-center text-xs sm:text-sm text-muted-foreground">
              Nenhuma simulação salva no histórico ainda. Envie uma mensagem no simulador para registrar.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
              {simHistoryLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {log.model_used || 'gpt-4o-mini'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Latência: {log.latency_ms || 0}ms</span>
                      <span>·</span>
                      <span className="font-semibold text-foreground">
                        {log.total_tokens || 0} tokens totais ({log.prompt_tokens || 0} prompt + {log.completion_tokens || 0} resposta)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded bg-muted/40 font-mono text-[11px] text-foreground">
                      <span className="font-bold text-primary">Cliente: </span>
                      {log.inbound_message_text}
                    </div>
                    <div className="p-2.5 rounded bg-card border border-border text-foreground">
                      <span className="font-bold text-emerald-500">IA: </span>
                      {log.outbound_text}
                    </div>
                  </div>

                  {log.handoff_requested && (
                    <div className="text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                      <strong>Hand-off solicitado:</strong> {log.handoff_reason || 'Condição de transferência ativada'}
                    </div>
                  )}

                  {/* Config Snapshot Accordion */}
                  <details className="mt-2 text-[11px]">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium flex items-center gap-1">
                      <Sliders className="h-3 w-3" /> Configurações Ativas na Época da Simulação
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-md bg-muted/30 border border-border/60">
                      <div>
                        <span className="font-semibold text-foreground">Empresa / Assistente:</span>{' '}
                        {log.config_snapshot?.company_name || log.config_snapshot?.assistant_name || 'N/D'}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Segmento de Atuação:</span>{' '}
                        {log.config_snapshot?.business_segment || log.config_snapshot?.business_niche || 'N/D'}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Tom de Voz & Estilo:</span>{' '}
                        {log.config_snapshot?.communication_style || log.config_snapshot?.tone_of_voice || 'N/D'}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Objetivo:</span>{' '}
                        {log.config_snapshot?.service_goal || 'N/D'}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Temperatura:</span>{' '}
                        {log.config_snapshot?.temperature ?? log.temperature ?? 0.3}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Limite Tokens Resposta:</span>{' '}
                        {log.config_snapshot?.max_tokens ?? log.max_tokens ?? 500}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Itens de Conhecimento Ativos:</span>{' '}
                        {log.config_snapshot?.knowledge_items_count ?? 0}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* MODAL DE INSPEÇÃO E GOVERNANÇA DE EXECUÇÃO */}
      <Dialog open={Boolean(selectedExecutionLog)} onOpenChange={(open) => !open && setSelectedExecutionLog(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 bg-card text-card-foreground border border-border shadow-xl z-50 rounded-2xl">
          <DialogHeader className="shrink-0 pr-6 pb-2 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Inspeção de Execução & Governança
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detalhamento auditado de tokens, latência, mensagens integrais e conformidade operacional da IA nesta execução.
            </DialogDescription>
          </DialogHeader>

          {selectedExecutionLog && (
            <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-muted/30 border border-border/60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {new Date(selectedExecutionLog.created_at).toLocaleString('pt-BR')}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {selectedExecutionLog.model_used || 'gpt-4o-mini'}
                  </Badge>
                </div>
                {selectedExecutionLog.security_flag ? (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {selectedExecutionLog.security_flag.label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1">
                    <Check className="h-3 w-3 text-emerald-400" />
                    Segurança OK
                  </Badge>
                )}
              </div>

              {/* Mensagem do Cliente */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Mensagem do Cliente
                </Label>
                <div className="p-3 rounded-lg bg-muted/40 font-mono text-xs text-foreground whitespace-pre-wrap break-words border border-border/40">
                  {selectedExecutionLog.inbound_message_text || '(Mensagem vazia)'}
                </div>
              </div>

              {/* Resposta do Atendimento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Resposta do Atendimento Inteligente
                </Label>
                <div className="p-3 rounded-lg bg-card text-xs text-foreground whitespace-pre-wrap break-words border border-border">
                  {selectedExecutionLog.outbound_text || '(Sem resposta textual)'}
                </div>
              </div>

              {/* Detalhamento Metrificado de Tokens */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Detalhamento de Consumo de Tokens & Performance</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tokens Prompt (Entrada)</span>
                    <strong className="text-foreground text-xs font-mono">{selectedExecutionLog.prompt_tokens || 0} tokens</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tokens Resposta (Saída)</span>
                    <strong className="text-foreground text-xs font-mono">{selectedExecutionLog.completion_tokens || 0} tokens</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Total Consumido</span>
                    <strong className="text-primary text-xs font-mono">{selectedExecutionLog.total_tokens || 0} tokens</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Latência Total</span>
                    <strong className="text-foreground text-xs font-mono">{selectedExecutionLog.execution_time_ms || 0} ms</strong>
                  </div>
                </div>
              </div>

              {/* Governança de Segurança em Alto Nível */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Governança & Análise de Conformidade</Label>
                {selectedExecutionLog.security_flag ? (
                  <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      {selectedExecutionLog.security_flag.label}
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      {selectedExecutionLog.security_flag.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs">
                      Execução analisada e validada. Nenhuma violação de segurança ou tentativa de alteração de diretrizes identificada nesta resposta.
                    </span>
                  </div>
                )}
              </div>

              {/* Handoff */}
              {selectedExecutionLog.handoff_triggered && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-0.5">
                  <strong>Transferência Humana Ativada:</strong>{' '}
                  <span>{selectedExecutionLog.handoff_reason || 'Condição de transição para atendente solicitada'}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
