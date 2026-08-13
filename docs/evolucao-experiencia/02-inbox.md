# Mapa de Evolução — Caixa de Entrada (hoje "Inbox")

| Campo | Valor |
| --- | --- |
| Área | Item 2 da navegação principal — `navigation.inbox` |
| Rota atual | `/inbox` — centro de atendimento conversacional |
| Arquivos hoje envolvidos | `src/app/(dashboard)/inbox/page.tsx`, `src/components/inbox/*`, `src/lib/inbox/*` |
| Status | Rascunho — mapa de evolução de experiência (RFC Modelo D2), não autoriza implementação direta por si só |
| Arquétipo declarado pela Constituição | **Operacional de Alta Densidade / Atendimento Conversacional** (`PRINCIPIO-FUNDADOR.md`, §"Inbox"; Volume II, cap. 4.3, 4.6) |
| Diretriz de Origem | **Liberdade de Solução** (`docs/LIBERDADE-DE-SOLUCAO.md`) — a estrutura atual de 3 colunas fixas é compreendida como um *hábito de implementação*, não como um limite da experiência |

---

## O problema atual (Diagnóstico de Poluição, Carga Cognitiva e Hábito de Layout)

A tela atual da Caixa de Entrada possui todas as capacidades funcionais necessárias para o atendimento (atribuição, controle de status, notas internas, participantes, tags, visualização de negócios e linha do tempo). No entanto, o layout atual é prisioneiro de um **hábito tradicional de implementação**: 3 colunas rígidas fixas (Fila | Chat | Detalhes do Cliente) ocupando 100% da tela o tempo todo, sem flexibilidade de foco.

Somado a esse hábito de layout, identificam-se quatro eixos principais de poluição e ruído visual na tela real:

1. **Cabeçalho do Chat Hipertrofiado em 3 Linhas Concorrentes:**
   - **Linha 1:** Avatar, Nome, Telefone, Ação "Devolver para IA", Dropdown de Status ("Aberto"), Dropdown de Atribuição ("Pedro"), Recarregar, Expandir.
   - **Linha 2:** Badges coloridas de alta saturação ("Expirado" em vermelho, "Humano" em laranja), Botão "Adicionar ao board", Checkbox "Aguardando retorno", "Prioridade", Botão "Solicitar ajuda" (em amarelo vibrante).
   - **Linha 3:** Lista de Participantes ("Participantes: Pedro, Katarina Mariano") e botão "+ Adicionar".
   *Impacto:* O topo do chat consome mais de 150px de altura útil da tela com uma colcha de retalhos de botões e badges. O operador gasta esforço cognitivo para filtrar o topo antes de conseguir ler a mensagem do cliente.

2. **Redundância Informativa e Desperdício Espacial no Painel Direito:**
   - O painel lateral do cliente repete exatamente a mesma informação que já está no cabeçalho do chat: Avatar grande, Nome ("Pedro") e Telefone ("558586701595").
   - As seções (TAGS, NEGÓCIOS ATIVOS, NOTAS, LINHA DO TEMPO) aparecem empilhadas verticalmente com o mesmo peso visual de 300px fixos, forçando rolagem, comprimindo a largura útil da conversa e dividindo a atenção.

3. **Competição de Peso Visual e Falta de Profundidade:**
   - A Fila de Conversas (esquerda), a Thread de Mensagens (centro) e o Painel do Contato (direita) possuem tons escuros idênticos e divisórias marcadas de borda dura. Não há uma clara hierarquia de profundidade que diga ao olho do operador: *"aqui está o seu foco primário (mensagens), e aqui estão os apoios secundários"*.
   - O fundo da área de mensagens utiliza um padrão de marca d'água com ícones repetidos que adiciona ruído visual por trás do texto.

4. **Composer Fragmentado com Banners e Modos:**
   - O composer de mensagem acumula abas ("Resposta ao Cliente" / "Nota Interna"), aviso de 24 horas ("A janela de 24 horas expirou. Use um modelo..."), botões soltos de anexo/modelo e campo de texto com estados desativados escuros.

Essa composição viola o princípio básico de ergonomia cognitiva (`L2-C15`) e a diretriz fundamental do produto (`PRINCIPIO-FUNDADOR.md`): *"O usuário não deve precisar pensar sobre o sistema para conseguir trabalhar. Ele deve simplesmente trabalhar."*

---

## Três leituras (Aplicação da Liberdade de Solução)

**Como funciona hoje (Leitura 1).** Uma interface rígida de 3 colunas de peso plano e um cabeçalho de chat com 3 linhas de botões e badges coloridas expostos simultaneamente. A tela tenta mostrar todos os recursos ao mesmo tempo, criando poluição e exaustão visual após poucas horas de atendimento.

**Como poderia melhorar mantendo a estrutura (Leitura 2).** Ajustar a paleta de cores das badges, esconder um ou dois botões no menu de três pontos e reduzir o padding entre elementos. Essa abordagem é superficial: mantém o layout rígido de 3 colunas e a fragmentação do composer.

**Como seria reconstruído do zero (Leitura 3 — A Visão Alvo Reinventada).** 
Em vez de aceitar o arranjo rígido de 3 colunas como inevitável, a experiência é reconstruída sob o princípio do **Layout Adaptativo de Foco Dinâmico (Dynamic Focus Experience)**:
- **Zero Colisão Visual:** Ao selecionar uma conversa, a tela reorganiza o contraste visual. A Thread de Mensagens ganha o centro absoluto das atenções.
- **Header de Linha Única Minimalista (Single-Row Smart Header):** Apenas o nome do cliente, canal, status principal e atribuição ficam visíveis. Ações secundárias (solicitar ajuda, prioridade, participantes) entram em uma paleta contextual rápida.
- **Painel Contextual Sob Demanda (Dock / Drawer Inteligente):** O painel do cliente deixa de ser uma barra estática pesada de 300px e passa a ser um **Dock Contextual Dobrável**, recolhido por padrão em ícones de relance rápido (Negócio, Tags, Notas, Histórico) e desdobrável com um clique ou atalho `Cmd/Ctrl + .`. Isso devolve 30% de área útil de tela para a leitura da mensagem.
- **Composer Único Baseado em Paleta de Comandos (Smart Command Composer):** A alternância entre "Resposta ao Cliente" e "Nota Interna" é feita com uma troca suave de atmosfera na barra de escrita. Digitar `/` aciona a biblioteca de modelos e IA; digitar `@` faz menção a colegas.
- **Operação Teclado-Primeiro (Zero Mouse Friction):** Atalhos ergonômicos de teclado (`Alt + Up/Down` para navegar entre conversas, `Cmd + K` para comando rápido, `Ctrl + Enter` para enviar) permitem ao operador processar dezenas de atendimentos sem tocar no mouse.

---

## O objetivo da experiência

O operador deve entrar na Caixa de Entrada e sentir **fluência, leveza e controle absoluto**. A sensação deve ser a de um ambiente de escrita e leitura de altíssimo nível, onde o sistema se ajusta dinamicamente ao ritmo de trabalho da pessoa.

O equilíbrio é alcançado quando:
1. **Foco Imediato na Mensagem:** O olhar vai direto para a conversa, sem distrações de badges vibrantes soltas ou ruídos de fundo.
2. **Espaço Dinâmico:** O layout se expande e recolhe dependendo da necessidade (modo foco vs. modo contextualização de dados).
3. **Operação Ultra-Rápida:** Ações de triagem, resposta, nota interna e transferência são executadas com esforço zero.

---

## O que deve ser preservado (Garantias Constitucionais Inegociáveis)

Exercendo a **Liberdade de Solução** sobre a forma, as garantias da Constituição continuam intocáveis (`docs/LIBERDADE-DE-SOLUCAO.md`, §2):

- **Isolamento Multi-tenant e RLS (`FH-10.06`, `FH-03.02`):** Todas as chamadas de conversas, contatos e mensagens permanecem estritamente isoladas por conta (`account_id`).
- **Preservação de Rascunhos (`L1-C10`, `composer-draft`):** O rascunho de texto e notas internas é salvo automaticamente e restaurado ao alternar entre conversas.
- **Sincronização em Tempo Real (`L5-C50`):** Atualizações de mensagens, digitação, presença e alteração de status/atribuição continuam instantâneas via WebSockets / Realtime.
- **Regras de Negócio de Canais e 24h:** O controle de expiração da janela de 24h do WhatsApp e obrigatoriedade de modelos continua valendo.

---

## O que deve ser descartado ou ressignificado

1. **A marca d'água com padrão de ícones no fundo do chat:** Descartada. Fundo sólido, limpo e com contraste calibrado segundo o design system.
2. **O topo rígido de 3 linhas:** Descartado. Substituído por um cabeçalho único, compacto (52px) e inteligente.
3. **A repetição de Avatar/Nome/Telefone no painel direito:** Descartada. O painel lateral foca exclusivamente em contexto acionável (Negócio, Tags, Notas, Histórico).
4. **Painel lateral fixo consumindo tela permanentemente:** Ressignificado como **Dock Contextual Dobrável** (Pode ficar colapsado em barra de ícones rápidos ou expandido sob demanda).
5. **Badges de saturação cor-de-alerta soltas:** Badges secundárias são harmonizadas em tons suaves (`muted`, `primary-soft`) e integradas ao menu de contexto.

---

## O que deve ser reinventado

### 1. Cabeçalho de Linha Única Inteligente (Single-Row Smart Header)
- **Design:** Uma única barra de 52px com alinhamento impecável.
- **Esquerda:** Nome do cliente, telefone atenuado e status de canal discreto.
- **Centro/Direita:** Atendente atribuído (seletor compacto), Status ("Aberto" / "Fechado"), Ação de Transferência e Botão `(...)` com menu limpo contendo: *Adicionar ao Board, Marcar Prioridade, Solicitar Ajuda, Gerenciar Participantes*.

### 2. Layout Adaptativo: Dock Contextual do Cliente (Painel Direito Dobrável)
- **Modo Compacto (Padrão de Foco):** Uma faixa vertical minimalista de 48px na direita contendo atalhos rápidos de relance (Negócio, Tags, Notas, Histórico). Passar o cursor ou clicar abre o card em popover ou expande o painel.
- **Modo Expandido:** Painel lateral de 280px focado apenas no contexto acionável:
  - **Negócio Ativo:** Card visual com etapa do funil e valor.
  - **Tags & Anotações Internas:** Edição rápida com menção `@`.
  - **Linha do Tempo de Atividades:** Histórico conciso de eventos.

### 3. Composer Inteligente de Comandos (Smart Command Composer)
- **Atmospheric Toggle (Decisão PRE-0001):** Alternar entre "Mensagem ao Cliente" e "Nota Interna" altera a borda e o foco da barra de escrita (tom neutro/primary para cliente, tom amber para nota interna) e a cor do botão principal de envio.
- **Invariância Estrutural e Mínima Carga Cognitiva:** A posição do campo de texto, os botões de ação e a iconografia principal (ícone `Send`) permanecem **rigorosamente idênticos em ambos os modos**. O interior do input (`bg-muted`) e o fundo do container (`bg-card/90`) permanecem neutros. Isso permite associação cognitiva instantânea sem releitura de tela ou reconstrução de mapa mental pelo operador.
- **Barra de Modelo & Janela de 24h:** Integradas como uma pílula discreta de contexto dentro do próprio composer com atalho de clique *"Escolher Modelo (`/`)"*.
- **Slash Commands (`/`):** Digitar `/` na caixa abre instantaneamente a busca rápida por respostas prontas, modelos aprovados e sugestões da IA.

### 4. Navegação por Teclado e Triagem "Inbox Zero"
- `Alt + Seta para Baixo / Cima`: Alterna instantaneamente entre conversas na fila.
- `Cmd / Ctrl + K`: Abre a paleta de comandos globais da conversa (Transferir, Fechar, Alterar Board, Solicitar Ajuda).
- `Ctrl + Enter`: Envia mensagem / nota.

---

## Qual experiência deve existir no lugar (Arquitetura Visual Proposta)

```
+-------------------+-----------------------------------------------+---------------+
| FILA (Esquerda)   | THREAD & COMPOSER (Centro - Foco Absoluto)    | DOCK CLIENTE  |
| (280px / Recolhivel) | (Flex 1 - Fundo Limpo, Sem Ruído)          | (48px / 280px)|
+-------------------+-----------------------------------------------+---------------+
| [Buscar conversa] | [Pedro · 558586701595]   [Pedro v] [Aberto v] | [ (S) Negócio]|
|                   +-----------------------------------------------+ [ (T) Tags   ]|
| > Pedro           |                                               | [ (N) Notas  ]|
|   oi? · 6d        |   (Cliente)                                   | [ (H) Hist.  ]|
|                   |   estou com duvidas                           |               |
|   Nat             |   16:48                                       | (Expande sob  |
|   Nenhuma msg...  |                                               |  demanda com  |
|                   |   (IA / Atendente)                            |  Cmd + . ou   |
|   Wëndër          |   Claro! Estou aqui para ajudar.              |  clique)      |
|                   |   16:48                                       |               |
|                   +-----------------------------------------------+               |
|                   | [ Resposta (Cliente) ] [ Nota Interna ]       |               |
|                   | (Janela 24h expirada · Digite / para modelos) |               |
|                   | [ Escreva sua mensagem ou / para comandos... ]|               |
+-------------------+-----------------------------------------------+---------------+
```

---

## Regras e Artigos da Constituição Aplicáveis

| Artigo | Princípio | Aplicação no Inbox |
| --- | --- | --- |
| `FH-13.02` | Prioridade de Papéis | O Operador é a persona primária. O layout é desenhado para uso contínuo de 8h/day sem exaustão. |
| `FH-13.04` | Não degradação do Operador | Proibido empilhar controles gerenciais e botões de topo que degradem a tarefa de alta frequência. |
| `FH-10.06` | Account Tenancy & RLS | Garantia absoluta de isolamento de dados por conta. |
| `FH-50.01` | Tempo Real e Colaboração | Presença, digitação e sincronização em tempo real de mensagens e status. |
| `FH-57.11` | Característica não é Mensagem | Copys da tela devem usar linguagem humana (ex: *"Aguardando resposta"*, *"Enviar modelo"*). |
| `L2-C15` | Ergonomia Cognitiva | Redução drástica de ruído visual, contraste calibrado e foco na mensagem. |
| `L2-C16` | Hábito e Fluência | Atalhos de teclado ergonômicos e previsibilidade de ações. |
| `L4-C30` | Tipografia e Leitura | Escala tipográfica limpa para balões de mensagem e leitura prolongada. |
| `PRE-0001` | Invariância Estrutural e Sinalização Atmosférica | A estrutura e iconografia são mantidas rigorosamente idênticas ao trocar modos, variando apenas os acentos de cor para associação cognitiva instantânea sem curva de aprendizado. |
| `Volume II` | Arquétipo Operacional de Alta Densidade | Densidade alcançada por clareza, ritmo espacial e velocidade, não por acúmulo de caixas rígidas. |

---

## Conformidade Constitucional

- [x] O documento respeita a ordem de prioridade de papéis (`FH-13.02`).
- [x] Aplica a diretriz de **Liberdade de Solução** sobre a forma sem violar garantias da Constituição.
- [x] Não viola isolamento de tenancy (`FH-10.06`).
- [x] Preserva contratos de dados e real-time (`FH-50.01`).
- [x] Mantém os tokens de design do sistema (`Volume II`).
