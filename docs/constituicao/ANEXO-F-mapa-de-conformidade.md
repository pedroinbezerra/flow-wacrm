# Anexo F — Mapa de Conformidade

> **Artefato vivo.** Inventário de onde o produto atual contradiz a Constituição
> (`FH-66.09`). Divergência aqui é **dívida**, nunca precedente (`FH-01.06`).

| Campo | Valor |
| --- | --- |
| Versão | 1.2.0 |
| Estado | **Em auditoria — cobertura parcial declarada** |
| Dívidas registradas | 9 — **3 corrigidas**, 1 parcial, 5 abertas |
| Críticas abertas | **0** |
| Áreas auditadas | 1 de 10 (Inbox — auditoria estática) |

---

## 1. Método e limites desta passagem

**O que foi feito.** Verificação dirigida por busca no código, sobre cinco
verificações binárias de alta detectabilidade automática. Nenhuma tela foi
percorrida em uso real; nenhuma verificação de teclado, leitor de tela ou contexto
adverso foi executada.

**O que NÃO foi feito** — e por isso **não** pode ser lido como conformidade
(`FH-68.11`):

| Não verificado | Artigos correspondentes |
| --- | --- |
| Acessibilidade em uso real (teclado, leitor de tela) | `FH-38.11` |
| Estados aplicáveis por tela | `FH-41.02` |
| Estados vazios por tipo | `FH-42.01` |
| Anatomia de erros e confirmações | `FH-44.02`, `FH-45.03` |
| Retomada de contexto e preservação de rascunho | `FH-14.01`, `FH-10.01` |
| Contraste em todos os modos e acentos | `FH-29.05` |
| Comportamento sob volume alto e rede degradada | `FH-27.07`, `FH-14.10` |
| Textos fixos em componentes | `FH-60.01` |
| Vocabulário frente ao Anexo A | `FH-59.01` |

**Consequência.** Este anexo está em **primeira passagem**. A auditoria completa
exige percorrer tarefas reais com as checklists C-A a C-H (`FH-63`) — trabalho que
não é substituível por busca em código.

---

## 2. Dívidas registradas

### DIV-0001 — Cores de gráfico fora do sistema de tokens

- **Gravidade:** estrutural
- **Artigos violados:** `FH-29.01`, `FH-29.08`, `FH-28.09`
- **Onde:** `src/components/dashboard/conversations-chart.tsx`
- **Evidência:** valores de cor escritos diretamente nas séries e nos elementos de
  legenda, em vez dos tokens `--chart-*`.
- **Efeito:** as séries não acompanham modo e acento (`FH-29.03`); a estabilidade
  de cor entre gráficos não é garantida pelo sistema (`FH-29.08`); o contraste não
  é verificável por token em modo claro e escuro (`FH-29.05`).
- **Correção esperada:** substituir por `--chart-1`…`--chart-5`, na ordem fixa de
  série.
- **Contenção (`FH-66.04`):** nenhuma nova visualização pode usar cor literal.
- **Prazo:** a definir na priorização — **dívida estrutural não pode ficar sem
  prazo** (`FH-66.08`).

### DIV-0002 — Paleta de etiquetas com valores literais

- **Gravidade:** pontual
- **Artigos violados:** `FH-29.01` (a examinar), `FH-28.09`
- **Onde:** `src/components/settings/tag-manager.tsx`
- **Evidência:** lista de cores oferecidas ao usuário definida com valores
  literais.
- **Ressalva honesta:** a cor da etiqueta é **dado do usuário** — ele escolhe e ela
  passa a pertencer a ele (`FH-59.07`). O que está em dívida não é a cor escolhida,
  e sim **a paleta oferecida pelo produto**, que é decisão de design e deveria
  derivar do sistema.
- **Correção esperada:** derivar a paleta oferecida de tokens, preservando
  integralmente as cores já escolhidas pelos usuários.
- **Prazo:** a definir.

### DIV-0003 — Cor de fallback literal em cartão de negócio

- **Gravidade:** pontual
- **Artigos violados:** `FH-29.01`
- **Onde:** `src/components/pipelines/deal-card.tsx`
- **Evidência:** valor literal usado como cor de fallback quando a etapa não tem
  cor definida.
- **Correção esperada:** usar token neutro do sistema como fallback.
- **Prazo:** a definir.

### DIV-0004 — Ausência de auditoria de conformidade

- **Gravidade:** estrutural
- **Artigos violados:** `FH-66.09`, `FH-62.05`
- **Onde:** processo, não código
- **Evidência:** este anexo cobre 5 verificações de ~40 exigidas pelas checklists
  C-A a C-H. Nenhuma tela foi percorrida em uso real.
- **Correção esperada:** executar a auditoria por tarefas reais, área por área,
  registrando dívidas encontradas.
- **Prazo:** a definir.

---

---

## 2.1 Auditoria da área de Inbox

**Escopo:** `src/components/inbox/` (13 arquivos, 4.875 linhas) e
`src/app/(dashboard)/inbox/page.tsx` (634 linhas).
**Método:** leitura dirigida e busca no código. **Não** houve verificação em uso
real, teclado, leitor de tela ou contexto adverso.
**Arquétipo afetado:** A1 — Operador, o de maior frequência (`FH-13.02`).

### DIV-0005 — Texto do compositor vaza entre conversas e se perde ao recarregar

- **Status:** ✅ **CORRIGIDA**
- **Correção aplicada:** rascunho persistido **por conversa** em
  `src/lib/inbox/composer-draft.ts`, com restauração na retomada e isolamento na
  troca de conversa. O compositor passou a ter uma única porta de escrita
  (`updateText`) que mantém estado, espelho e rascunho em sincronia, e a limpar o
  rascunho apenas no envio bem-sucedido (`consumeText`).
- **Verificações:** `pnpm typecheck` ✅ · `pnpm lint` ✅
- **Não verificado:** comportamento em uso real (recarregar, alternar conversas,
  expirar sessão) — exige a verificação de contexto adverso de `FH-14.10`.
- **Gravidade original:** 🔴 crítica (dois bloqueios absolutos)
- **Artigos violados:** `FH-10.01`, `FH-14.01`, `FH-14.03`, `FH-14.09`,
  `FH-62.01` (itens 2 e 6)
- **Onde:** `src/components/inbox/message-composer.tsx:129`;
  `src/components/inbox/message-thread.tsx:1716`;
  `src/app/(dashboard)/inbox/page.tsx:605`
- **Evidência:**
  1. O texto vive apenas em estado de componente (`useState("")` na linha 129).
     Não há persistência local — nenhuma ocorrência de armazenamento no arquivo.
  2. `MessageThread` e `MessageComposer` são montados **sem `key` por conversa**,
     e não existe efeito que reinicie o texto quando `conversationId` muda (os
     únicos `setText("")` ocorrem após envio bem-sucedido).
- **Efeito 1 — perda de trabalho.** Recarregar a página, expirar a sessão ou
  fechar o navegador descarta o texto digitado. Viola a promessa de preservação
  (`FH-10.01`) e a retomada (`FH-14.01`, `FH-14.09`).
- **Efeito 2 — mistura de contexto.** Ao alternar de conversa, o texto escrito
  para um contato permanece no compositor da conversa seguinte. É o anti-padrão
  "estado global vazado" nomeado no Capítulo 14, e cria risco concreto de **enviar
  a um destinatário a mensagem escrita para outro** — efeito externo irreversível
  (`FH-45.07`) sobre terceiros (`FH-11.05`).
- **Correção esperada:** rascunho persistido **por conversa**, restaurado na
  retomada e isolado entre conversas.
- **Contenção (`FH-66.05`):** nenhuma funcionalidade nova na área de Inbox
  enquanto esta dívida estiver aberta.
- **Prazo:** imediato — dívida crítica.

### DIV-0006 — Texto fixo em componentes do Inbox

- **Status:** ✅ **CORRIGIDA**
- **Correção aplicada:** 27 textos extraídos para `src/i18n/messages/pt-BR.json`
  sob `inbox.notes`, `inbox.collaboration` e `inbox.help`. Os rótulos foram
  reescritos conforme o Capítulo 58 no mesmo passo — sem exclamação em
  resultado (`FH-57.07`), sem maiúscula desnecessária (`FH-58.06`) e com
  mensagens de erro que dizem o que fazer (`FH-44.02`).
- **Ganho adicional:** a lista de setores em `help-request-modal.tsx` passou a
  separar **valor persistido** de **rótulo exibido** — o dado gravado não muda
  com o idioma (`FH-60.07`).
- **Verificações:** `node audit-translations.js` → **0 chaves ausentes** ✅ ·
  `pnpm typecheck` ✅ · `pnpm lint` ✅
- **Gravidade original:** 🔴 crítica (bloqueio absoluto, item 7)
- **Artigos violados:** `FH-60.01`, `FH-62.01` (item 7)
- **Onde:** `help-request-modal.tsx:99,132,148,166`;
  `message-thread.tsx:1312,1317,1482`; `participant-bar.tsx:128,130,132,149,154`
- **Evidência:** títulos, rótulos e estados escritos diretamente no JSX, fora do
  dicionário de traduções.
- **Efeito:** os textos são invisíveis para a governança de linguagem — não passam
  por revisão de microcopy (`FH-58`), não são encontrados em renomeação
  (`FH-59.05`) e não existem em nenhum outro idioma.
- **Agravante (`FH-66.04`):** três dos arquivos afetados são **novos e ainda não
  commitados** — o padrão está sendo propagado agora, não herdado.
- **Correção esperada:** extrair para `src/i18n/messages/pt-BR.json`, sob o
  domínio `inbox`.
- **Prazo:** imediato — dívida crítica.

### DIV-0007 — Cores de paleta bruta em vez de tokens semânticos

- **Status:** 🟡 **PARCIAL** — corrigida em `participant-bar.tsx`; **aberta** nos
  demais 7 arquivos.
- **Por que não foi corrigida por inteiro:** os arquivos restantes usam a paleta
  para sustentar uma **categoria visual que o sistema ainda não tem token** — a
  nota interna, distinta da mensagem ao cliente. Resolver isso exige **criar um
  token de superfície**, e `FH-29.06` obriga defini-lo em **todos os modos e
  todos os acentos**. Isso é alteração do design system, não substituição
  mecânica: decisão de **alçada 2** (`FH-65.01`), que um único ciclo de correção
  não pode tomar sozinho (`FH-65.07`).
- **Próximo passo declarado:** propor o token pelo modelo D4/D5 do Anexo D,
  definindo a superfície de nota interna e seus estados.
- **Contenção mantida (`FH-66.04`):** nenhuma nova ocorrência de paleta bruta é
  permitida, inclusive nos arquivos ainda não commitados.
- **Gravidade:** estrutural
- **Artigos violados:** `FH-29.01`, `FH-29.02`, `FH-29.07`, `FH-28.09`
- **Onde:** 8 dos 13 arquivos de `src/components/inbox/` — `message-thread.tsx`
  (28 ocorrências), `internal-notes-stream.tsx` (21), `participant-bar.tsx` (10),
  `template-picker.tsx`, `message-composer.tsx`, `message-bubble.tsx`,
  `conversation-list.tsx`, `help-request-modal.tsx`
- **Evidência:** classes de paleta bruta usadas para comunicar estado — por
  exemplo, presença e atividade em `participant-bar.tsx:128-132`.
- **Efeito:** essas cores **não acompanham modo nem acento** (`FH-29.03`); o
  contraste não é verificável por token nos dois modos (`FH-29.05`); e estados
  passam a ter representação diferente da canônica do produto (`FH-29.07`,
  `FH-33.04`).
- **Correção esperada:** substituir por tokens semânticos; estados devem usar o
  conjunto fechado de cores de estado.
- **Contenção (`FH-66.04`):** nenhuma nova ocorrência é permitida, inclusive nos
  arquivos ainda não commitados.
- **Prazo:** a definir na priorização.

### DIV-0008 — Movimento contínuo em superfície operacional

- **Status:** ✅ **CORRIGIDA**
- **Decisão registrada (`FH-65.02`):** o sinal de atividade permanece — ele
  comunica algo real (`FH-39.02`) —, mas **sem animação contínua**. A pulsação
  permanente violava `FH-39.10` (nada se move enquanto o operador lê) e
  `FH-39.05` (decoração em fluxo de alta frequência). O estado continua
  distinguível por rótulo textual, o que também elimina a dependência de um
  único canal (`FH-38.09`).
- **Gravidade original:** pontual
- **Artigos possivelmente violados:** `FH-39.05`, `FH-39.10`, `FH-15.09`
- **Onde:** `src/components/inbox/participant-bar.tsx:128,130`
- **Evidência:** indicadores de presença com animação de pulsação contínua, em
  tela de uso contínuo.
- **Ressalva honesta:** o movimento **comunica atividade em curso**, o que é
  função legítima (`FH-39.02`). O que está em questão é a **continuidade** — nada
  deve se mover enquanto o Operador lê a conversa (`FH-39.10`), e animação
  permanente em fluxo de alta frequência é proibida (`FH-39.05`).
- **Correção esperada:** decidir explicitamente entre sinal estático e animação
  limitada; registrar a decisão.
- **Prazo:** a definir.

### DIV-0009 — Chave de tradução ausente é exibida ao usuário

- **Gravidade:** estrutural — **descoberta durante a correção**, alcança o
  produto inteiro
- **Artigos violados:** `FH-60.08`, `FH-08.08`
- **Onde:** `src/hooks/use-translation.ts` — o parâmetro `defaultValue` tem a
  própria chave como padrão, então uma chave inexistente é **renderizada como
  texto** para o usuário.
- **Evidência:** `t('common.required')` em
  `src/app/(dashboard)/ai-assistant/page.tsx:390,442` exibia literalmente
  `common.required` em uma mensagem de erro.
- **Status:** 🟡 **PARCIAL** — a instância concreta foi corrigida (chave
  `common.required` criada; auditoria agora acusa **0 chaves ausentes**). O
  **mecanismo** permanece aberto.
- **Por que o mecanismo não foi alterado agora:** decidir o que renderizar no
  lugar da chave é escolha de produto com alcance total — texto vazio esconde
  informação, texto genérico inventa conteúdo. `FH-60.08` exige que a ausência
  seja **detectável em verificação**, o que hoje já ocorre por
  `audit-translations.js`. A mudança do fallback é **alçada 2** (`FH-65.01`).
- **Próximo passo declarado:** propor pelo modelo D2 do Anexo D, incluindo a
  detecção em tempo de construção para que a ausência nunca chegue à execução.

---

## 3. Verificações realizadas com resultado conforme

| Verificação | Artigo | Resultado |
| --- | --- | --- |
| Textos de erro sem exclamação | `FH-57.07` | ✅ Conforme — nenhuma ocorrência |
| Textos de erro sem culpabilização aparente | `FH-17.04` | ✅ Conforme na amostra inspecionada |
| Nome de canal na navegação principal | `FH-05.06` | ✅ Conforme — a única ocorrência é uma aba de configuração, onde o canal **é** a informação (exceção prevista) |
| Foco visível nas primitivas de ação | `FH-38.02`, `FH-34.08` | ⚠️ Parcial — a primitiva de botão pareia supressão de contorno com foco visível; **29 arquivos** usam supressão e não foram inspecionados individualmente |
| Tokens de cor bidimensionais (modo × acento) | `FH-29.03` | ✅ Conforme — os conjuntos são disjuntos por construção |

---

## 4. Áreas não auditadas

| Área | Rotas / módulos | Estado |
| --- | --- | --- |
| Inbox | `src/app/(dashboard)/inbox/`, `src/components/inbox/` | 🟡 Auditoria estática feita (§2.1); 3 dívidas corrigidas; falta verificação em uso real |
| Contatos | `contacts/` | ⬜ |
| Funis e negócios | `pipelines/` | ⬜ |
| Disparos | `broadcasts/` | ⬜ |
| Automações e flows | `automations/`, `flows/` | ⬜ |
| Quadros | `boards/` | ⬜ |
| IA | `ai-assistant/`, `src/lib/ai-service/` | ⬜ |
| Configurações e conta | `settings/` | ⬜ |
| Administração | `admin/` | ⬜ |
| Autenticação e entrada | `src/app/(auth)/`, `welcome/` | ⬜ |

---

## 5. Como continuar a auditoria

1. Escolha uma área e uma **tarefa real** dela (`FH-61.07`).
2. Percorra a tarefa do início ao fim, incluindo **estados adversos**
   (`FH-61.08`).
3. Aplique a checklist correspondente (C-A a C-G) e as **dez heurísticas**.
4. Verifique os **oito bloqueios absolutos** (`FH-62.01`) — se algum aparecer, é
   **dívida crítica** e bloqueia funcionalidade nova na área (`FH-66.05`).
5. Registre cada achado como dívida, com gravidade, artigos, evidência e prazo.
6. Atualize a tabela de áreas e o contador no topo deste anexo.

> **Regra que vale desde já:** enquanto uma dívida existir, **nenhuma nova
> ocorrência do mesmo padrão é permitida** (`FH-66.04`) — independentemente de a
> auditoria estar completa.

---

*Anexo F v1.2.0 — Inbox auditado; DIV-0005, DIV-0006 e DIV-0008 corrigidas.
Atualização obrigatória a cada descoberta e a cada correção (`FH-66.09`).*
