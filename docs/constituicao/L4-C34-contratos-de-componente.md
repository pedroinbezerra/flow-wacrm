# Capítulo 34 — Contratos de Componente

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 28, 41, 43, 44, 48, 51 |
| É pré-requisito de | Capítulos 35, 36, 37, 38 |
| Artigos | `FH-34.01` a `FH-34.10` |

---

## 0. Núcleo Normativo

**`FH-34.01`** — Todo componente interativo **DEVE** implementar os **oito estados
obrigatórios** (§5): padrão, apontado, focado, ativo, desabilitado, carregando,
erro e somente leitura — quando aplicáveis.
> **Verificação:** todos os estados aplicáveis estão implementados? → SIM = cumpre | NÃO = viola.

**`FH-34.02`** — Todo componente **DEVE** ser operável integralmente por teclado,
com o mesmo resultado do ponteiro (`FH-48.02`).
> **Verificação:** o componente é operável só por teclado, com resultado idêntico? → SIM = cumpre | NÃO = viola.

**`FH-34.03`** — Todo componente **DEVE** ser verificado com conteúdo **mínimo,
típico e extremo** — vazio, curto, longo, muitos itens (`FH-24.09`, `FH-30.10`).
> **Verificação:** os três volumes foram verificados? → SIM = cumpre | NÃO = viola.

**`FH-34.04`** — Nenhum componente decide **regra de negócio** (`FH-28.07`). Ele
recebe o estado já decidido e o apresenta.
> **Verificação:** o componente consulta regra de negócio para decidir o que exibir? → NÃO = cumpre | SIM = viola.

**`FH-34.05`** — A **interface do componente** — nomes de propriedades, variantes e
eventos — **DEVE** ser consistente com a dos demais componentes da mesma família.
> **Verificação:** os nomes seguem a convenção usada pelos componentes equivalentes? → SIM = cumpre | NÃO = viola.

**`FH-34.06`** — Todo componente **DEVE** declarar se é controlado, não controlado
ou ambos. Comportamento ambíguo quanto à posse do estado é proibido.
> **Verificação:** a posse do estado está declarada? → SIM = cumpre | NÃO = viola.

**`FH-34.07`** — Todo componente **DEVE** aceitar rótulo acessível, e **NUNCA**
depender exclusivamente de conteúdo visual para ser identificado (`FH-38.05`).
> **Verificação:** o componente aceita e expõe rótulo acessível? → SIM = cumpre | NÃO = viola.

**`FH-34.08`** — Nenhum componente **PODE** suprimir o indicador de foco
(`FH-48.07`, `FH-38.02`).
> **Verificação:** o foco permanece visível em todos os caminhos deste componente? → SIM = cumpre | NÃO = viola.

**`FH-34.09`** — Elemento desabilitado **DEVE** expor o **motivo** de forma
acessível (`FH-51.01`). Desabilitado mudo é proibido.
> **Verificação:** o motivo do desabilitado é alcançável, inclusive por tecnologia assistiva? → SIM = cumpre | NÃO = viola.

**`FH-34.10`** — Componente **estável** **NUNCA** altera seu contrato sem ciclo de
depreciação (`FH-28.03`, `FH-28.10`).
> **Verificação:** houve mudança de contrato em componente estável sem depreciação? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **o que todo componente do FlowHub garante**, qualquer que
seja ele. Ele existe para que a conformidade constitucional seja herdada: quem
compõe com peças conformes produz telas conformes por construção.

---

## 2. Perguntas que este capítulo responde

- O que um componente é obrigado a fazer?
- Como ele se comporta em foco, erro, carregamento, desabilitado?
- Como responde ao teclado?
- Como se comporta com conteúdo extremo?
- Componente pode conter lógica de permissão?

---

## 3. Definições

**Contrato** — conjunto de garantias que todo componente oferece.

**Componente controlado** — o estado vive fora dele.

**Componente não controlado** — o estado vive dentro dele.

**Conteúdo extremo** — o maior volume ou o texto mais longo que o componente
realisticamente receberá.

**Rótulo acessível** — nome exposto a tecnologia assistiva.

---

## 4. Fundamento

**Por que contratos em vez de recomendações.** Sem garantias uniformes, cada uso de
cada componente precisa ser auditado individualmente contra dezenas de artigos.
Com contratos, a conformidade sobe um nível: garantida a peça, garantido o uso. É a
única forma de a Constituição escalar para centenas de telas sem revisão manual
exaustiva.

**Por que oito estados.** Eles cobrem o ciclo completo de interação e mapeiam
diretamente o catálogo do Capítulo 41 no nível do componente. Os mais esquecidos —
carregando, erro e somente leitura — são justamente os que aparecem em produção e
produzem estados indefinidos (`FH-41.03`).

**Por que conteúdo extremo é obrigatório.** Componentes são construídos com conteúdo
de exemplo bem-comportado. Nomes longos, listas grandes e textos traduzidos
quebram layouts que pareciam corretos — e quebram nas contas maiores, que são as
mais valiosas (`FH-27.07`).

**Por que a posse do estado é declarada.** Ambiguidade entre controlado e não
controlado produz a classe de defeito mais difícil de diagnosticar: o componente
funciona em um uso e falha em outro, sem erro visível. Declarar remove a
adivinhação.

**Por que desabilitado precisa explicar.** Um controle inativo sem motivo é uma
recusa muda — proibida por `FH-51.01`. E, como o motivo costuma ser exibido apenas
visualmente, `FH-34.09` exige que ele seja alcançável também por tecnologia
assistiva, onde a informação normalmente se perde.

---

## 5. Os oito estados obrigatórios

| Estado | Quando ocorre | Obrigação |
| --- | --- | --- |
| **Padrão** | Disponível, sem interação | Aparência canônica da família |
| **Apontado** | Ponteiro sobre o elemento | Sinal de interatividade; nunca o único (`FH-32.07`) |
| **Focado** | Recebe entrada de teclado | Indicador visível e nunca suprimido (`FH-34.08`) |
| **Ativo** | Durante o acionamento | Reação imediata (`FH-43.01`) |
| **Desabilitado** | Indisponível agora | Motivo acessível (`FH-34.09`) |
| **Carregando** | Aguardando resultado | Sem salto de layout (`FH-41.04`) |
| **Erro** | Entrada ou operação inválida | Mensagem no ponto (`FH-44.03`) |
| **Somente leitura** | Visível, não editável | Distinto de desabilitado |

**Distinção obrigatória.** *Desabilitado* significa "não pode agora"; *somente
leitura* significa "existe, é legível, não é seu para alterar". Tratá-los igual
confunde permissão com estado (`FH-51.02`).

---

## 6. Regras normativas

### `FH-34.03` — Três volumes de verificação

| Volume | O que testar |
| --- | --- |
| **Mínimo** | Vazio, um item, texto de uma palavra |
| **Típico** | Conteúdo representativo do uso comum |
| **Extremo** | Nome muito longo, palavra sem espaços, muitos itens, texto traduzido expandido |

### `FH-34.04` — Fronteira do componente

**Certo.** O componente recebe `desabilitado` e `motivo`; a decisão veio do
domínio.

**Errado.** O componente consulta plano ou papel para decidir se aparece — regra de
negócio dentro da peça, e regra que só existe no cliente (`FH-51.10`).

### `FH-34.05` — Consistência de interface

**Errado.** Componentes equivalentes com nomes divergentes para a mesma
propriedade. Quem constrói precisa consultar cada peça em vez de generalizar.

---

## 7. Anti-padrões

**Componente de caminho feliz.** Só padrão e apontado implementados.

**Foco suprimido.** Indicador removido por estética.

**Desabilitado mudo.** Controle inativo sem motivo.

**Somente leitura como desabilitado.** Confusão entre não editável e indisponível.

**Estado ambíguo.** Controlado e não controlado ao mesmo tempo.

**Peça onisciente.** Componente com regra de negócio.

**Nomenclatura divergente.** Cada componente com sua convenção.

**Quebra silenciosa.** Contrato alterado sem depreciação.

---

## 8. Impactos

**Cognitivo.** Componentes com contrato uniforme comportam-se de forma previsível —
o usuário aprende uma vez e aplica em todo lugar.

**Emocional.** Foco visível e motivo de desabilitação removem a sensação de estar
diante de um sistema que recusa sem explicar.

**Produtividade.** Para quem constrói, contratos eliminam a auditoria peça a peça:
a conformidade é herdada.

**Percepção de qualidade.** Estados completos são o que distingue uma interface
acabada de uma que "funciona".

**Curva de aprendizagem.** Convenções consistentes permitem usar um componente novo
sem consultar documentação.

---

## 9. Riscos e trade-offs

**Risco: custo por componente.** Oito estados e três volumes encarecem cada peça.
Mitigação: o custo é pago uma vez e amortizado em todos os usos.

**Risco: contratos engessados.** Mudanças legítimas ficam caras. Mitigação: o ciclo
de depreciação (`FH-28.03`) existe justamente para isso.

**Risco: componentes anêmicos.** Proibir regra de negócio pode levar a peças que
exigem muito do ponto de uso. Mitigação: `FH-28.06` — a complexidade vai para a
composição, onde é visível.

**Trade-off central.** Trocamos velocidade de criação por conformidade herdada.
Cada componente demora mais; cada tela nasce conforme.

---

## 10. Critérios de verificação

1. Todos os estados aplicáveis estão implementados.
2. Todo componente é operável por teclado com resultado idêntico.
3. Todo componente foi verificado nos três volumes.
4. Nenhum componente contém regra de negócio.
5. Nomes e variantes seguem a convenção da família.
6. A posse do estado está declarada.
7. Todo componente aceita rótulo acessível.
8. Nenhum componente suprime o foco.
9. Todo desabilitado expõe motivo acessível.
10. Nenhum contrato estável mudou sem depreciação.

---

## 11. Checklist do capítulo

- [ ] Implementei os oito estados aplicáveis.
- [ ] Operei o componente só com teclado.
- [ ] Testei vazio, típico e extremo.
- [ ] Nenhuma regra de negócio entrou na peça.
- [ ] Os nomes seguem a convenção da família.
- [ ] Declarei se é controlado ou não.
- [ ] O foco está visível em todos os caminhos.
- [ ] O desabilitado explica o motivo, inclusive para leitor de tela.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 28, 41 (estados), 43 (feedback), 44 (erro), 48
(teclado), 51 (desabilitado).

**É pré-requisito de.** Capítulos 35 (catálogo), 36, 37, 38.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Primitivas e variantes | `src/components/ui/` (`cva` por componente) |
| Estados de foco e inválido | Classes `focus-visible:` e `aria-invalid:` em `button.tsx`, `input.tsx` |
| Desabilitado | `disabled:` nas primitivas; `gated-button.tsx` para motivo |
| Composição de classes | `cn` em `src/lib/utils.ts` |
