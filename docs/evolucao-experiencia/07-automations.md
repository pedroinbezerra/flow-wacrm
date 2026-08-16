# Mapa de Evolução de Experiência — Automações (`/automations`)

| Campo | Valor |
| --- | --- |
| Área | Item 7 da navegação principal — `navigation.automations` |
| Rota atual | `/automations`, `/automations/new`, `/automations/[id]/edit`, `/automations/[id]/logs` |
| Arquivos hoje envolvidos | `src/app/(dashboard)/automations/page.tsx`, `src/components/automations/automation-builder.tsx`, `src/app/(dashboard)/automations/[id]/logs/page.tsx`, `src/lib/automations/*` |
| Status | Rascunho — mapa de evolução de experiência (RFC Modelo D2), não autoriza implementação direta por si só |
| Arquétipo declarado pela Constituição | **Operacional de Alta Densidade / Automações & Regras de Ação** (`PRINCIPIO-FUNDADOR.md`; Volume II, cap. 4.4; `L6-C54-automacoes-e-flows.md`) |
| Diretriz de Origem | **Liberdade de Solução** (`docs/LIBERDADE-DE-SOLUCAO.md`) — a lista estática de cards de automação é compreendida como um *hábito de implementação*, não como um limite da experiência |

---

## 1. O Problema Atual (Diagnóstico de Poluição, Carga Cognitiva e Hábito de Layout)

A funcionalidade de **Automações** é o motor de execução em escala do FlowHub. Conforme postulado no Capítulo 54 da Constituição (`L6-C54`), ela representa *"a funcionalidade de maior poder e maior risco do produto: age sozinha, em escala, sobre pessoas que não usam o sistema"*.

Apesar da consistência técnica dos endpoints e do motor de execução, a interface atual padece de limitações ergonômicas e visuais decorrentes de um hábito de implementação tradicional:

1. **Ausência de Consciência Global de Saúde (Zero Observabilidade de Topo):**
   - A lista de automações exibe apenas cards individuais com o contador bruto de execuções acumuladas.
   - Não há visão sintetizada de quantas automações rodaram nas últimas 24 horas, quantas falharam, qual a taxa de sucesso global ou se existem disparos retidos por erros de integração (ex: WhatsApp desconectado ou API offline).

2. **Dificuldade de Leitura Humana das Regras (Violação em Potencial de `FH-54.01`):**
   - Os cards da listagem mostram o nome da automação, a tag do gatilho (ex: `keyword_match`) e a data da última execução.
   - Para entender *o que a automação realmente faz*, o operador é obrigado a clicar em editar e inspecionar o builder. Não há um **Resumo Narrativo em Linguagem Natural** que explique a regra em português claro (ex: *"Quando o cliente enviar 'ORÇAMENTO', envia o modelo de apresentação e adiciona a tag 'Vendas'"*).

3. **Falta de Pausa de Emergência Global Visível (`FH-54.11`):**
   - O botão de alternar estado (`Switch`) existe apenas de forma individual dentro de cada card. Em caso de disparos indesejados em massa (ex: um looping de mensagens), o operador precisa desativar card por card manualmente, aumentando o risco de danos.

4. **Histórico de Logs Passivo e Sem Ação de Reprocessamento (`FH-54.04`, `FH-54.05`):**
   - A tela de logs (`/automations/[id]/logs`) lista os eventos em accordion simples. Contudo, quando uma etapa falha (ex: mensagem não enviada por falta de saldo ou falha de rede), o operador visualiza o erro em texto mas **não possui um botão para reprocessar a etapa que falhou**, violando a garantia de reprocessamento seletivo exigida em `FH-54.05`.

5. **Interface de Construção (Builder) Fragmentada:**
   - O construtor de automações utiliza um formulário extenso na mesma coluna com dropdowns técnicos. Falta uma pré-visualização fluida em estilo de fluxo (Flow canvas) com validação dinâmica de limites de segurança antes da ativação (`FH-54.02`, `FH-54.06`).

---

## 2. Três Leituras (Aplicação da Liberdade de Solução)

**Como funciona hoje (Leitura 1).** Uma lista vertical de cards com visual plano de fundo escuro, onde cada card exibe apenas nome, badge do tipo de gatilho, contador de execuções e botões de ação isolados. A criação é feita via formulário com etapas empilhadas.

**Como poderia melhorar mantendo a estrutura (Leitura 2).** Ajustar margens, trocar o ícone do gatilho e formatar melhor a data da última execução. Essa abordagem é superficial: não resolve a falta de observabilidade de saúde global nem adiciona a pausa de emergência universal.

**Como seria reconstruído do zero (Leitura 3 — A Visão Alvo Reinventada).** 
A experiência é reconstruída sob o arquétipo de **Central de Comando e Automação Consciente (Conscious Automation Command Center)**:
- **Painel Superior de Observabilidade em Tempo Real (Automation Health Bar):** Métrica de execuções nas últimas 24h, taxa de entrega com sucesso (%), automações ativas vs. pausadas e indicador imediato de qualquer falha de disparo.
- **Botão Universal de Pausa de Emergência em 1 Clique (FH-54.11):** Presente no cabeçalho da página de automações, permitindo suspender temporariamente todas as automações com um clique acompanhado de confirmação de segurança.
- **Cards com Resumo Narrativo em Linguagem Natural (FH-54.01):** Cada card de automação exibe uma frase humana fluida que traduz sua lógica lógica sem jargões técnicos.
- **Logs Inteligentes com Reprocessamento Seletivo (FH-54.05):** Central de auditoria onde execuções parciais ou com falha apresentam um botão direto de *"Tentar Novamente"* para a etapa afetada.
- **Builder Guiado com Simulação de Impacto (FH-54.02, FH-54.06):** Editor com suporte visual de fluxo, pré-visualização do impacto estimado na base de contatos e definição explícita de limites de segurança (ex: máximo de 50 disparos por hora por contato).

---

## 3. O Objetivo da Experiência

O operador deve acessar a área de automações e sentir **segurança absoluta, clareza operacional e controle total**. O sistema deve comunicar com precisão o que está rodando, a integridade dos disparos e oferecer ferramentas imediatas de contenção e correção.

O sucesso da experiência é atingido quando:
1. **Confiança Visual Imediata:** Ao olhar para a tela, fica claro em menos de 2 segundos se o sistema de automação está saudável ou se há falhas pendentes.
2. **Entendimento Sem Esforço:** Qualquer membro da equipe (técnico ou não) ententede a regra exata da automação lendo apenas o card principal.
3. **Contenção e Recuperação sem Frito:** Pausa de emergência acessível em 1 clique e falhas recuperáveis individualmente.

---

## 4. O Que Deve Ser Preservado (Garantias Constitucionais Inegociáveis)

- **Legibilidade Antes de Execução (`FH-54.01`):** Nenhuma automação é ativada sem uma descrição clara e legível em português.
- **Pré-Visualização Obrigatória (`FH-54.02`):** Demonstração do impacto estimado de contatos afetados antes de salvar e ativar.
- **Ativação Consciente (`FH-54.03`):** Novas automações iniciam desligadas (`is_active = false`) por padrão.
- **Histórico Legível por Não-Técnicos (`FH-54.04`):** Detalhamento dos disparos usando nomes de contatos e mensagens legíveis.
- **Falha Visível e Recuperável (`FH-54.05`):** Indicação clara do motivo de erro com botão de reprocessamento.
- **Limites de Segurança Declarados (`FH-54.06`):** Travas de proteção contra loops e envios massivos não intencionais.
- **Versionamento de Alterações (`FH-54.07`):** Edições em automações ativas mantêm o histórico da versão anterior.
- **Isolamento Multi-tenant (`FH-54.08`, `FH-10.06`):** Consultas e execuções estritamente presas ao `account_id`.
- **Respeito ao Opt-Out (`FH-54.09`):** Respeito incondicional à recusa do destinatário.
- **Responsável Identificável (`FH-54.10`):** Registro de quem criou, quem ativou e quem editou por último.
- **Pausa de Emergência Global (`FH-54.11`):** Ação de 1 passo disponível em lugar visível.

---

## 5. O Que Deve Ser Descartado ou Ressignificado

1. **Card de Automação Rígido e Apenas Técnico:** Descartado. Substituído por Card Narrativo com linguagem natural e métricas contextuais de disparo.
2. **Ausência de Métricas Globais:** Descartada. Adicionada a barra superior de saúde das automações (KPI Header).
3. **Logs Estáticos e Passivos:** Ressignificados como **Central Ativa de Auditoria e Reprocessamento**.
4. **Acionamento de Templates sem Atalho de Início:** Ressignificado em uma galeria superior compacta de modelos recomendados (Welcome Message, Qualificador de Lead, Lembrete, Fora do Expediente).

---

## 6. O Que Deve Ser Reinventado

### A. Painel de Saúde e Observabilidade (KPI Header)
- **4 Cartões Indicadores:**
  1. *Automações Ativas:* Total de regras rodando / total cadastradas.
  2. *Execuções (24h):* Volume de gatilhos acionados nas últimas 24 horas.
  3. *Taxa de Sucesso:* Percentual de conclusões sem erro com indicador de tendência.
  4. *Falhas Retidas:* Alerta em tom âmbar/vermelho se houver falhas aguardando atenção.

### B. Botão de Pausa de Emergência Global (FH-54.11)
- Botão no cabeçalho principal: `Pausa de Emergência` com ícone de alerta.
- Em 1 clique, exibe modal de confirmação rápida para suspender o motor de automação da conta, garantindo segurança operacional em imprevistos.

### C. Cards de Automação com Resumo em Linguagem Natural (FH-54.01)
- Cada item da lista apresenta:
  - Título da Automação + Switch de ativação imediata.
  - Frase explicativa gerada dinamicamente: *"Se **[Gatilho]**, então **[Ação 1]** e **[Ação 2]**"*.
  - Rodapé com estatísticas daquela automação (execuções totais, taxa de sucesso, data do último disparo, responsável).
  - Menu de ações (`Editar`, `Duplicar`, `Ver Logs`, `Excluir`).

### D. Central de Logs de Execução com Reprocessamento Seletivo (FH-54.05)
- Visualização cronológica detalhada com badges de status (`Sucesso`, `Parcial`, `Falha`).
- Para execuções com falha: detalhamento amigável da razão (ex: *"Mensagem retida por janela de 24h exaurida"*) e botão acionável **"Reprocessar Etapa"**.

### E. Builder Interativo com Pré-visualização e Travas de Limite (FH-54.02, FH-54.06)
- Interface de criação dividida em etapas claras: **1. Gatilho & Condições** → **2. Ações Encadeadas** → **3. Travas de Segurança & Pré-visualização**.
- Exibição da contagem estimada de disparos/dia antes de ativar.
