# Mapa de Evolução de Experiência — Fluxos de Atendimento (`/flows`)

| Campo | Valor |
| --- | --- |
| Área | Item 9 da navegação principal — `navigation.flows` |
| Rota | `/flows`, `/flows/[id]`, `/flows/[id]/runs` |
| Arquivos hoje envolvidos | `src/app/(dashboard)/flows/page.tsx`, `src/app/(dashboard)/flows/[id]/page.tsx`, `src/app/(dashboard)/flows/[id]/runs/page.tsx`, `src/components/flows/*`, `src/lib/flows/*` |
| Status | Implementado — mapa de evolução de experiência (RFC Modelo D2) |
| Arquétipo declarado pela Constituição | **Operacional de Alta Densidade / Construtor de Processos & Visual Workflow** (`PRINCIPIO-FUNDADOR.md`; Volume II, cap. 4.4; `L6-C54-automacoes-e-flows.md`) |
| Diretriz de Origem | **Liberdade de Solução** (`docs/LIBERDADE-DE-SOLUCAO.md`) — o canvas e a lista de fluxos são refinados para entregar controle absoluto, previsibilidade e clareza visual |

---

## 1. Contexto e Diagnóstico de Experiência

A funcionalidade de **Fluxos** (Flows) é o construtor visual de conversas e triagem interativa do FlowHub. Governada pelo Capítulo 54 da Constituição (`L6-C54`), ela permite desenhar jornadas encadeadas acionadas por palavras-chave, primeira mensagem ou disparo manual.

Apesar da sólida infraestrutura de execução, a experiência visual anterior apresentava lacunas operacionais:

1. **Ausência de Observabilidade de Saúde no Topo:**
   - A listagem de fluxos era exibida em um grid básico de cards sem visão sintetizada de uso global (total de fluxos ativos, execuções acumuladas, taxa de sucesso e gatilhos configurados).

2. **Dificuldade de Diagnóstico Rápido (`FH-54.01`):**
   - Os cards da listagem dependiam de descrições manuais ou exibições simples de palavras-chave. Faltava um **Resumo Narrativo em Linguagem Natural** do fluxo para entender o comportamento da conversa em um relance.

3. **Pausa de Emergência Global Ausente (`FH-54.11`):**
   - O desligamento de fluxos era feito individualmente card a card. Em casos de imprevistos ou disparos indesejados, o operador necessitava de um mecanismo global de suspensão rápida.

4. **Filtragem e Ergonomia da Lista:**
   - Ausência de pílulas de filtro rápido (`Todos`, `Ativos`, `Rascunhos`, `Arquivados`) e de busca instantânea no topo da lista.

5. **Clareza de Auditoria e Logs (`FH-54.04`, `FH-54.05`):**
   - A visualização de execuções (`/flows/[id]/runs`) necessitava de maior densidade visual, com histórico de eventos legível por humanos e rápida identificação de erros de execução.

---

## 2. Três Leituras (Aplicação da Liberdade de Solução)

**Como funciona hoje (Leitura 1).** Uma lista de cards simples com busca e criação básica, levando a um editor visual canvas com painel de propriedades e página de histórico de execuções.

**Como poderia melhorar mantendo a estrutura (Leitura 2).** Apenas estilizar os botões e ajustar o espaçamento entre cards, mantendo a falta de observabilidade global e filtros.

**Como é reconstruído (Leitura 3 — A Visão Alvo).**
A área é elevada para um **Painel de Comando e Construção de Fluxos Conscientes (Conscious Flow Command & Builder)**:
- **Barra de Saúde e Métricas Globais (Flow Health Bar):** 4 indicadores executivos no topo (Fluxos Ativos, Execuções Totais, Taxa de Sucesso e Gatilhos de Palavra-Chave).
- **Botão Universal de Pausa de Emergência em 1 Clique (`FH-54.11`):** Ação no cabeçalho com modal de confirmação para desativar/pausar fluxos ativados em lote no momento de necessidade.
- **Pílulas de Filtro Rápido e Busca Instantânea:** Alternância fluida entre `Todos`, `Ativos`, `Rascunhos` e `Arquivados` com contadores dinâmicos.
- **Cards com Resumo Narrativo em Linguagem Natural (`FH-54.01`):** Tradução legível do gatilho e das etapas do fluxo.
- **Histórico e Auditoria de Execuções Refinados (`FH-54.04`, `FH-54.05`):** Linha do tempo visual com badges coloridas por status de execução (`Ativo`, `Concluído`, `Encaminhado`, `Expirado`, `Falha`).

---

## 3. Garantias Constitucionais Preservadas

- **Legibilidade Antes de Execução (`FH-54.01`)**: Todos os fluxos e etapas possuem representação textual clara.
- **Pré-Visualização e Validação (`FH-54.02`)**: Painel de validação antes de permitir a ativação de um fluxo.
- **Ativação Consciente (`FH-54.03`)**: Novos fluxos nascem em modo `draft` e exigem ativação explícita.
- **Histórico Legível (`FH-54.04`)**: Execuções vinculadas ao contato e aos nós da conversa em português.
- **Pausa de Emergência (`FH-54.11`)**: Ação em 1 clique presente na interface.
- **Isolamento Multi-tenant (`FH-54.08`, `FH-10.06`)**: Todas as queries e mutações filtradas rigorosamente por `account_id`.
- **i18n Nativo (`pt-BR`)**: Mensagens e chaves de tradução padronizadas via `useTranslation()`.

---

## 4. Estrutura de Componentes e Telas

1. **Painel Principal de Fluxos (`/flows`):**
   - Cabeçalho com título, descrição, Pausa de Emergência e Novo Fluxo (`GatedButton`).
   - `FlowsHealthBar`: Cartões de métricas (Ativos, Execuções, Taxa de Sucesso, Gatilhos).
   - Filtros por pílulas + busca por texto.
   - Grid responsivo de `FlowCard` com resumo narrativo e atalhos de ativação/edição/logs/exclusão.

2. **Editor e Builder de Fluxo (`/flows/[id]`):**
   - Editor de fluxo interativo com canvas visual, suporte a atalhos de teclado (`Ctrl+S` / `⌘S`) e validação em tempo real.

3. **Central de Execuções e Auditoria (`/flows/[id]/runs`):**
   - Linha do tempo de execuções com expansão de detalhes, histórico de eventos (`flow_run_events`) e variáveis capturadas.
