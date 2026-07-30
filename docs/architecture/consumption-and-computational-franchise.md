# Arquitetura de Consumo, Franquia Computacional e Evolução da Cobrança (Flow Hub)

## 1. Visão Geral

O módulo de Planos e Assinaturas do Flow Hub estabelece **quem pode utilizar quais funcionalidades e quais limites administrativos possui**. No entanto, limites administrativos (como máximo de usuários ou de contatos) não medem diretamente o custo operacional que cada cliente gera na infraestrutura.

Para garantir escalabilidade, sustentabilidade financeira e preparação para billing flexível baseado em consumo, a arquitetura do Flow Hub separa definitivamente duas dimensões:

1. **Dimensão Administrativa (Motor de Configuração Efetiva)**: Controla permissões e limites de recursos administrativos (usuários, contatos, fluxos, funis, boards).
2. **Dimensão Operacional (Motor de Consumo Computacional)**: Mede a infraestrutura realmente utilizada (IA, automações, mensagens, webhooks, áudio, documentos), sem interferir diretamente no bloqueio imediato do usuário.

```
+-----------------------------------------------------------------------------+
|                               FLOW HUB HUB                                  |
+------------------------------------+----------------------------------------+
|       DIMENSÃO ADMINISTRATIVA      |          DIMENSÃO OPERACIONAL          |
|   (Motor de Configuração Efetiva)  |    (Motor de Consumo Computacional)    |
+------------------------------------+----------------------------------------+
| Plano Base + Add-ons = Config.    | Telemetria Centralizada (usage_events) |
| Efetiva (Usuários, Contatos...)    | Tabela de Pesos de Créditos            |
| Responde: "O que pode usar?"       | Franquia Mensal Computacional          |
|                                    | Responde: "Quanto consumiu?"           |
+------------------------------------+----------------------------------------+
```

---

## 2. Conceitos Fundamentais

### 2.1. Crédito Computacional
Ao invés de contabilizar custos monetários em tempo real ou unidades isoladas, o sistema utiliza uma unidade abstrata chamada **Crédito Computacional**. Cada recurso da infraestrutura possui um peso parametrizado na tabela `credit_weights`.

| Tipo de Recurso (`resource_type`) | Peso Padrão em Créditos | Descrição |
| :--- | :--- | :--- |
| `whatsapp_message` | 1 crédito | Processamento / envio de mensagem de WhatsApp |
| `ai_execution` | 5 créditos | Chamada ou resposta gerada por Inteligência Artificial |
| `audio_transcription` | 10 créditos | Transcrição de áudio via IA/Whisper |
| `automation_execution` | 2 créditos | Execução de nós de automação e gatilhos |
| `webhook_dispatch` | 1 crédito | Disparo ou recepção de webhook |
| `pdf_generation` | 2 créditos | Geração de documento PDF/relatório em background |
| `ocr_scan` | 8 créditos | Processamento de OCR (extensão de recurso) |

### 2.2. Franquia Mensal Computacional
Cada plano comercial possui uma cota mensal de Créditos Computacionais (`monthly_compute_credits`).
- **Starter**: 25.000 créditos / mês
- **Pro**: 100.000 créditos / mês
- **Enterprise**: 500.000 créditos / mês

Enquanto o consumo em créditos permanecer dentro da franquia mensal, nenhuma cobrança excedente ocorre.

---

## 3. Modelo de Dados e Telemetria

Toda operação computacional relevante emite um evento de consumo via RPC `record_usage_event`. Os eventos são gravados na tabela `usage_events`:

```sql
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  compute_credits NUMERIC NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Agregação e Telemetria
Os eventos são agregados em janelas diárias (`usage_aggregates_daily`) e mensais (`usage_aggregates_monthly`) para rápido consumo de dados analíticos sem necessidade de scan na tabela bruta de telemetria.

---

## 4. Análise de Fair Use e IA Pricing Insights

A plataforma inclui um mecanismo de detecção de uso atípico (*Fair Use*) que identifica clientes cujo consumo em créditos desvia significativamente da média da sua categoria de plano (Z-Score > 2.0).

Além disso, o painel de Super Admin conta com o assistente **AI Pricing & Quota Insights** (`src/lib/consumption/ai-pricing-insights.ts`), que analisa a telemetria agregada e gera recomendações estratégicas com IA sobre:
1. Reajuste de pesos de crédito e cotas de franquia.
2. Identificação de planos subprecificados ou com alto custo operacional.
3. Recomendações de migração para o plano Enterprise e aplicação de políticas de Fair Use.

---

## 5. Diretrizes de Desenvolvimento

- **Desacoplamento Rigoroso**: O Motor de Consumo NUNCA deve bloquear síncronamente o fluxo de execução principal do usuário. Falhas na telemetria devem ser registradas silenciosamente sem interromper a operação.
- **Tenancy Segura**: Todas as consultas e eventos de consumo exigem `account_id` estritamente validado via RLS no Supabase.
- **Sem Modificação sem RLS**: Apenas RPCs com verificação de papéis ou chamadas do Service Role podem inserir e modificar configurações de consumo.
