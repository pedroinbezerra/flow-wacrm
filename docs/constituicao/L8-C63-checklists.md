# Capítulo 63 — Checklists de Validação

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 2, 61, 62, 68 |
| É pré-requisito de | Capítulos 65, 66 |
| Artigos | `FH-63.01` a `FH-63.10` |

---

## 0. Núcleo Normativo

**`FH-63.01`** — A checklist correspondente ao tipo de tarefa é **obrigatória**
antes da entrega (§5).
> **Verificação:** a checklist do tipo de tarefa foi percorrida? → SIM = cumpre | NÃO = viola.

**`FH-63.02`** — Checklist **NUNCA** substitui a leitura dos artigos aplicáveis
(`FH-02.01`). Ela verifica; não ensina.
> **Verificação:** os capítulos exigidos pelo tipo de tarefa foram consultados? → SIM = cumpre | NÃO = viola.

**`FH-63.03`** — Todo item de checklist **DEVE** remeter a um artigo. Item sem
artigo é preferência e **NUNCA** bloqueia.
> **Verificação:** todo item da checklist cita artigo? → SIM = cumpre | NÃO = viola.

**`FH-63.04`** — Marcar item sem ter verificado é **falsidade de conformidade** e
viola `FH-68.11`. Item não verificável no ambiente **DEVE** ser declarado como não
verificado.
> **Verificação:** todo item marcado foi efetivamente verificado? → SIM = cumpre | NÃO = viola.

**`FH-63.05`** — Toda emenda **DEVE** atualizar as checklists afetadas no mesmo
ciclo (`FH-04.08`).
> **Verificação:** as checklists refletem os artigos vigentes? → SIM = cumpre | NÃO = viola.

**`FH-63.06`** — A revisão por terceiros usa **a mesma checklist** da autoavaliação
(`FH-61.10`).
> **Verificação:** revisor e autor usaram a mesma lista? → SIM = cumpre | NÃO = viola.

**`FH-63.07`** — Nenhuma checklist nova existe sem artigos que a sustentem.
> **Verificação:** todos os itens derivam de artigos vigentes? → SIM = cumpre | NÃO = viola.

**`FH-63.08`** — Cada checklist tem **limite de tamanho** que a torne aplicável em
minutos. Lista longa demais não é usada.
> **Verificação:** a checklist é percorrível em minutos? → SIM = cumpre | NÃO = viola.

**`FH-63.09`** — Item que falha de forma recorrente **DEVE** gerar correção de
prevenção — automação, componente ou padrão —, não apenas repetição da verificação
(`FH-44.11`).
> **Verificação:** falhas recorrentes geraram prevenção? → SIM = cumpre | NÃO = viola.

**`FH-63.10`** — Agentes de IA usam **as mesmas checklists** que pessoas
(`FH-01.05`, `FH-68.01`).
> **Verificação:** o agente percorreu a checklist do tipo de tarefa? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo **operacionaliza a Constituição** em listas usáveis no dia a dia. Ele
existe porque conhecimento não aplicado no momento certo é equivalente a
desconhecimento.

---

## 2. Perguntas que este capítulo responde

- O que verifico antes de começar? Durante? Antes de entregar?
- Como reviso o trabalho de outra pessoa ou de um agente?
- Checklist substitui ler a Constituição?

---

## 3. Definições

**Checklist** — lista curta de verificações obrigatórias por tipo de tarefa.

**Item verificável** — verificação com resposta binária, derivada de artigo.

**Falsidade de conformidade** — marcar item não verificado.

**Prevenção** — mudança que torna a falha impossível, dispensando a verificação.

---

## 4. Fundamento

**Por que checklists.** Sob pressão, o conhecimento disponível não é o conhecimento
aplicado: as pessoas lembram do que usaram por último, não do que é relevante. A
checklist externaliza a memória e torna a verificação independente do estado mental
de quem executa — que é exatamente o ponto em áreas onde o erro é caro.

**Por que ela não substitui os artigos.** Checklist verifica o previsto; artigo
decide o novo. Quem só conhece a lista cumpre os itens e erra em tudo que ela não
cobre — e a lista, por ser curta, cobre pouco por desenho (`FH-63.08`).

**Por que todo item cita artigo.** Sem o artigo, o item vira convenção sem
fundamento, e o primeiro questionamento razoável o derruba. Com o artigo, o item é
vinculante e explicável.

**Por que marcar sem verificar é grave.** Produz não conformidade **com atestado**:
o revisor confia na marcação, não checa, e o defeito passa. É pior que não ter
checklist, porque cria confiança injustificada — o mesmo raciocínio de `FH-68.11`.

**Por que falha recorrente vira prevenção.** Se um item falha sempre, o problema não
é falta de atenção — é o desenho permitir a falha. Continuar verificando é tratar o
sintoma e pagar o custo para sempre (`FH-44.01`).

**Por que agentes usam as mesmas listas.** Duas listas divergem. Além disso, a
uniformidade permite que revisão humana e revisão automatizada produzam resultados
comparáveis, o que é condição para confiar em qualquer uma delas.

---

## 5. Checklists por tipo de tarefa

> Cada item remete ao artigo que o sustenta. As listas completas de cada capítulo
> permanecem na seção 11 dos respectivos arquivos; estas são as **listas de
> entrega**.

### C-A — Nova tela ou fluxo

- [ ] Posição no eixo declarada — `FH-20.01`
- [ ] Tarefa dominante nomeável em uma frase — `FH-08.09`
- [ ] Ordem identidade → estado → conteúdo → ação — `FH-24.01`
- [ ] Uma única ação primária — `FH-24.02`
- [ ] ≤3 decisões e ≤7 blocos — `FH-08.02`, `FH-15.01`
- [ ] Todos os estados aplicáveis tratados — `FH-41.02`
- [ ] Vazio tratado pelo tipo correto — `FH-42.01`
- [ ] Erros com anatomia completa — `FH-44.02`
- [ ] Retomada preserva contexto — `FH-14.01`, `FH-23.05`
- [ ] Verificado: teclado, leitor de tela, modos, tela pequena, volume alto —
      `FH-62.05`

### C-B — Novo componente

- [ ] Reutilização e composição esgotadas — `FH-28.02`, `FH-28.06`
- [ ] Estágio declarado — `FH-28.03`
- [ ] Oito estados implementados — `FH-34.01`
- [ ] Operável por teclado, foco visível — `FH-34.02`, `FH-34.08`
- [ ] Verificado com conteúdo mínimo, típico e extremo — `FH-34.03`
- [ ] Sem regra de negócio — `FH-34.04`
- [ ] Apenas tokens do sistema — `FH-28.09`
- [ ] Desabilitado expõe motivo acessível — `FH-34.09`

### C-C — Texto de interface

- [ ] Rótulo descreve o resultado — `FH-58.01`
- [ ] Dentro do limite de extensão — `FH-58.02`
- [ ] Sem jargão técnico — `FH-58.03`
- [ ] Campo com rótulo visível — `FH-58.04`
- [ ] Formatos do sistema — `FH-58.05`
- [ ] Perspectiva do usuário — `FH-57.03`
- [ ] Sem exclamação/emoji em contexto adverso — `FH-57.06`, `FH-57.07`
- [ ] No dicionário, com termos canônicos — `FH-60.01`, `FH-59.01`

### C-D — Ação destrutiva ou irreversível

- [ ] Localizada na matriz — `FH-45.01`
- [ ] Desfazer preferido a confirmar — `FH-45.02`
- [ ] Consequência, alcance e reversibilidade declarados — `FH-45.03`
- [ ] Afeta terceiros? Tratamento próprio aplicado — `FH-45.07`
- [ ] Afastada de ações frequentes — `FH-19.03`
- [ ] Mesma proteção no atalho — `FH-16.07`

### C-E — Funcionalidade de IA

- [ ] No ponto de uso, não em área separada — `FH-52.01`
- [ ] Nível de autonomia declarado; padrão sugerir — `FH-52.02`
- [ ] Revisão humana antes de efeito externo — `FH-52.03`
- [ ] Afirmações factuais rastreáveis — `FH-52.04`
- [ ] Contexto lido consultável — `FH-52.05`
- [ ] Produto funciona sem IA — `FH-52.07`
- [ ] Sugestão com as três perguntas — `FH-53.01`
- [ ] Recusa em um passo, sem insistência — `FH-53.03`

### C-F — Automação

- [ ] Legível por não técnico — `FH-54.01`
- [ ] Pré-visualização antes de ativar — `FH-54.02`
- [ ] Entra desligada — `FH-54.03`
- [ ] Histórico compreensível — `FH-54.04`
- [ ] Falha reprocessável por item — `FH-54.05`
- [ ] Limite de segurança declarado — `FH-54.06`
- [ ] Escopo restrito à conta — `FH-54.08`
- [ ] Pausa em um passo — `FH-54.11`

### C-G — Lista, tabela ou volume alto

- [ ] Prioridade de campos declarada — `FH-36.01`
- [ ] Identidade visível ao rolar — `FH-36.02`
- [ ] Filtros visíveis e persistentes — `FH-36.03`
- [ ] Ordenação estável — `FH-36.04`
- [ ] Posição preservada ao carregar mais — `FH-36.05`
- [ ] Totais honestos — `FH-36.06`
- [ ] Ação em lote declara alcance — `FH-49.02`
- [ ] Verificado com volume máximo — `FH-36.07`

### C-H — Revisão (humana ou por agente)

- [ ] Dez heurísticas percorridas — `FH-61.01`
- [ ] Achados com artigo, evidência e gravidade — `FH-61.02`, `FH-61.04`
- [ ] Oito bloqueios absolutos verificados — `FH-62.01`
- [ ] Definição de pronto percorrida — `FH-62.02`
- [ ] Bloco de Conformidade presente — `FH-62.06`
- [ ] Objeções citam artigo ou declaram lacuna — `FH-02.07`
- [ ] Achados não corrigidos viraram dívida com prazo — `FH-61.09`

---

## 6. Regras normativas

### `FH-63.04` — Item não verificável

Quando um item não puder ser verificado no ambiente disponível, ele **DEVE** ser
declarado como **não verificado**, com o motivo, no Bloco de Conformidade
(`FH-68.11`). Marcar como cumprido é violação.

### `FH-63.09` — Da verificação à prevenção

| Sinal | Ação obrigatória |
| --- | --- |
| O mesmo item falha em entregas sucessivas | Corrigir por componente, padrão ou automação |
| O item exige memória de detalhe | Transformar em verificação automatizada |
| O item nunca falha há muito tempo | Avaliar remoção da lista (`FH-63.08`) |

---

## 7. Anti-padrões

**Checklist decorativa.** Marcada sem verificação.

**Checklist como manual.** Usada no lugar dos artigos.

**Item órfão.** Verificação sem artigo que a sustente.

**Lista infinita.** Longa demais para ser aplicada.

**Listas divergentes.** Autor e revisor com critérios diferentes.

**Falha eterna.** Item que falha sempre e nunca vira prevenção.

**Lista de agente separada.** Critérios distintos para humanos e agentes.

---

## 8. Impactos

**Cognitivo.** A lista externaliza a memória no momento em que ela mais falha —
sob pressão de entrega.

**Emocional.** Reduz a ansiedade de "esqueci alguma coisa" e despersonaliza a
revisão.

**Produtividade.** Verificação em minutos, com correção no momento mais barato.

**Percepção de qualidade.** As listas cobrem exatamente as falhas que o usuário
percebe primeiro.

**Curva de aprendizagem.** Para quem chega, as listas ensinam a Constituição pelo
uso — cada item é uma porta para o artigo correspondente.

---

## 9. Riscos e trade-offs

**Risco: conformidade ritual.** Marcar por hábito. Mitigação: `FH-63.04` e
verificação por amostragem na revisão.

**Risco: listas desatualizadas.** Divergência entre lista e artigos vigentes.
Mitigação: `FH-63.05` obriga atualização no mesmo ciclo da emenda.

**Risco: cobertura parcial.** A lista é curta por desenho e não cobre tudo.
Mitigação: `FH-63.02` — a lista não substitui a leitura.

**Trade-off central.** Trocamos completude por aplicabilidade. Uma lista curta que
é usada vale mais que uma lista completa que é ignorada.

---

## 10. Critérios de verificação

1. A checklist do tipo de tarefa foi percorrida.
2. Os capítulos exigidos foram consultados.
3. Todo item cita artigo.
4. Todo item marcado foi verificado.
5. As checklists refletem os artigos vigentes.
6. Autor e revisor usaram a mesma lista.
7. Nenhuma checklist tem item sem artigo.
8. Todas são percorríveis em minutos.
9. Falhas recorrentes geraram prevenção.
10. Agentes usaram as mesmas listas.

---

## 11. Checklist do capítulo

- [ ] Identifiquei o tipo da tarefa e a lista correspondente.
- [ ] Li os capítulos exigidos antes de desenhar.
- [ ] Verifiquei cada item de fato.
- [ ] Declarei o que não pude verificar.
- [ ] O que falhou repetidamente virou prevenção.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 2 (`FH-02.01`), 61 (heurísticas), 62 (pronto), 68
(agentes).

**É pré-requisito de.** Capítulos 65 (governança), 66 (dívida).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Consulta de artigos | `docs/constituicao/ANEXO-B-indice-de-artigos.md` |
| Modelos de revisão | `docs/constituicao/ANEXO-D-modelos.md` |
| Verificações automatizadas | `pnpm lint`, `pnpm typecheck`, `pnpm test` |
| Convenções de implementação | `AGENTS.md`, seção 14 |
