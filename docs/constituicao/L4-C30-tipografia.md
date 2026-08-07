# Capítulo 30 — Tipografia

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 15, 24, 28, 29, 38 |
| É pré-requisito de | Capítulos 31, 35, 36, 58, 60 |
| Artigos | `FH-30.01` a `FH-30.10` |

---

## 0. Núcleo Normativo

**`FH-30.01`** — A escala tipográfica é **fechada**. Tamanho fora da escala é
proibido (`FH-28.09`).
> **Verificação:** todos os tamanhos usados pertencem à escala? → SIM = cumpre | NÃO = viola.

**`FH-30.02`** — A hierarquia textual é construída primeiro por **peso e cor**, e só
então por tamanho (`FH-24.05`). Aumentar o tamanho é o último recurso.
> **Verificação:** a hierarquia foi obtida por peso e cor antes de recorrer a tamanho? → SIM = cumpre | NÃO = viola.

**`FH-30.03`** — Todo bloco de leitura contínua **DEVE** respeitar largura máxima de
linha. Texto que atravessa a tela inteira é proibido.
> **Verificação:** blocos de leitura respeitam a largura máxima? → SIM = cumpre | NÃO = viola.

**`FH-30.04`** — A altura de linha **DEVE** variar por função: maior em leitura
contínua, menor em rótulos e dados tabulares.
> **Verificação:** a altura de linha corresponde à função do texto? → SIM = cumpre | NÃO = viola.

**`FH-30.05`** — Truncamento é permitido **apenas** com acesso ao conteúdo completo
no mesmo contexto — sem exigir navegação.
> **Verificação:** todo texto truncado tem acesso ao conteúdo completo ali mesmo? → SIM = cumpre | NÃO = viola.

**`FH-30.06`** — Texto produzido pelo usuário **NUNCA** é reescrito, corrigido,
reformatado nem alterado pelo sistema sem solicitação explícita.
> **Verificação:** o sistema altera o texto do usuário sem pedido? → NÃO = cumpre | SIM = viola.

**`FH-30.07`** — Números em colunas comparáveis **DEVEM** usar algarismos de largura
uniforme e alinhamento que permita comparação visual direta.
> **Verificação:** números comparáveis estão alinhados e com largura uniforme? → SIM = cumpre | NÃO = viola.

**`FH-30.08`** — Fonte monoespaçada é reservada a **dado técnico copiável** —
identificadores, códigos, trechos literais. **NUNCA** é usada por estilo.
> **Verificação:** o uso de monoespaçada corresponde a dado técnico copiável? → SIM = cumpre | NÃO = viola.

**`FH-30.09`** — Nenhum texto **PODE** ficar abaixo do tamanho mínimo legível da
escala, inclusive em rótulos, indicadores e legendas.
> **Verificação:** existe texto abaixo do tamanho mínimo da escala? → NÃO = cumpre | SIM = viola.

**`FH-30.10`** — O comportamento com **texto longo** **DEVE** ser verificado: nomes
extensos, palavras sem espaço e expansão por tradução (`FH-60`).
> **Verificação:** o layout foi verificado com texto longo e traduzido? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define a **voz visual do texto** — que carrega quase toda a
informação do produto. Ele estabelece a escala, as regras de hierarquia e o
tratamento do conteúdo produzido por pessoas.

---

## 2. Perguntas que este capítulo responde

- Quantos tamanhos existem?
- Quando uso peso em vez de tamanho?
- Qual a largura máxima de leitura?
- Como trato número, código, nome próprio e texto do usuário?
- O que fazer quando o texto é longo demais?

---

## 3. Definições

**Escala tipográfica** — conjunto fechado de tamanhos disponíveis.

**Leitura contínua** — texto de mais de uma linha destinado a ser lido inteiro.

**Rótulo** — texto curto que identifica um elemento.

**Dado tabular** — valores dispostos para comparação.

**Truncamento** — corte visual de texto que não cabe.

**Expansão por tradução** — crescimento do texto ao ser traduzido.

---

## 4. Fundamento

**Por que a escala é fechada.** Tamanhos livres produzem hierarquias que só existem
na intenção de quem desenhou: duas telas com valores ligeiramente diferentes
comunicam a mesma importância de formas diferentes, e o usuário deixa de conseguir
inferir prioridade pela aparência. Uma escala fechada torna a hierarquia legível
entre telas.

**Por que peso antes de tamanho.** Aumentar tamanho consome espaço, altera o ritmo
vertical e força reflow em telas densas. Peso e cor distinguem sem custo espacial —
o que é decisivo em telas operacionais (`FH-24.07`), onde a densidade é o próprio
requisito.

**Por que limitar a largura de linha.** Linhas muito longas fazem o olho perder o
retorno: a leitura salta linhas e o esforço aumenta. É um efeito mecânico, não
estético, e ele piora exatamente onde as telas são mais largas.

**Por que o texto do usuário é intocável.** O conteúdo que ele escreveu vai para um
cliente dele. Reformatação automática — corrigir acentuação, alterar
capitalização, normalizar espaços — muda o que ele quis dizer e quebra a promessa
de preservação (`FH-10.01`). Se o sistema tem uma sugestão, ela é oferta
(`FH-18.01`, nível 2), nunca alteração.

**Por que números precisam de largura uniforme.** Com algarismos de larguras
diferentes, colunas de números perdem o alinhamento vertical e a comparação visual
deixa de funcionar — o usuário precisa ler cada valor em vez de comparar formas. Em
telas analíticas, isso anula o propósito da tabela.

**Por que verificar texto longo.** Nomes reais são longos, e traduções expandem de
forma imprevisível. Layouts verificados apenas com conteúdo curto quebram em
produção, e quebram justamente nos registros mais importantes — que tendem a ter
nomes compostos e completos.

---

## 5. Princípios

**Escala fechada torna a hierarquia comparável entre telas.**

**Peso distingue sem consumir espaço.**

**O texto do usuário pertence ao usuário.**

**Número que não se alinha não se compara.**

---

## 6. Regras normativas

### Funções tipográficas e tratamento

| Função | Peso | Altura de linha | Observação |
| --- | --- | --- | --- |
| **Título de tela** | Alto | Compacta | Identidade da tela (`FH-24.01`) |
| **Título de seção** | Médio-alto | Compacta | Agrupamento |
| **Corpo de leitura** | Normal | Ampla | Sujeito à largura máxima (`FH-30.03`) |
| **Rótulo** | Médio | Compacta | Nunca abaixo do mínimo legível |
| **Dado tabular** | Normal | Compacta | Largura de algarismo uniforme |
| **Texto atenuado** | Normal | Herda | Cor atenuada, nunca abaixo do contraste mínimo |
| **Dado técnico** | Normal | Compacta | Monoespaçada, copiável |

### `FH-30.05` — Truncamento

**Certo.** Nome longo truncado na lista, com o conteúdo completo acessível no
próprio contexto — sem navegar para outra tela.

**Errado.** Truncar sem qualquer acesso ao restante. A informação existe e ficou
inalcançável, o que viola `FH-08.07` (não esconder estado) e `FH-15.02`.

### `FH-30.06` — Texto do usuário

**Certo.** Oferecer correção como sugestão editável (`FH-18.01`, nível 2).

**Errado.** Corrigir automaticamente ao salvar. O sistema alterou uma comunicação
que será lida por um cliente do usuário.

### `FH-30.10` — Verificação com texto longo

Cenários mínimos: nome pessoal completo; razão social extensa; palavra única sem
espaços; texto traduzido com expansão significativa.

---

## 7. Anti-padrões

**Escala aberta.** Tamanhos ad hoc por tela.

**Hierarquia por tamanho.** Tudo resolvido aumentando fonte.

**Linha infinita.** Texto atravessando a largura total.

**Truncamento cego.** Corte sem acesso ao conteúdo.

**Correção automática.** Sistema alterando texto do usuário.

**Coluna desalinhada.** Números que não permitem comparação visual.

**Monoespaçada decorativa.** Fonte técnica usada por estilo.

**Layout de vitrine.** Verificado apenas com nomes curtos.

---

## 8. Impactos

**Cognitivo.** Hierarquia tipográfica consistente permite localizar informação sem
ler — o olho identifica prioridade pela forma.

**Emocional.** Alteração de texto do usuário produz sensação de perda de controle,
uma das mais corrosivas para a confiança (Capítulo 18).

**Produtividade.** Alinhamento numérico e altura de linha compacta em dados
tabulares reduzem o tempo de leitura em telas analíticas.

**Percepção de qualidade.** Tipografia é o elemento visual mais presente; sua
inconsistência é percebida antes de qualquer outra.

**Curva de aprendizagem.** Funções tipográficas estáveis permitem inferir a
importância de um elemento em tela nunca vista.

---

## 9. Riscos e trade-offs

**Risco: rigidez expressiva.** A escala fechada limita composições. Trade-off
assumido — comparabilidade entre telas vale mais que expressividade local.

**Risco: densidade excessiva.** Alturas compactas podem prejudicar leitura.
Mitigação: a altura varia por função (`FH-30.04`), não por tela.

**Risco: truncamento onipresente.** Limitar largura em telas densas gera muitos
cortes. Mitigação: `FH-30.05` exige acesso ao conteúdo completo — e a decisão de
prioridade de coluna pertence ao Capítulo 36.

**Trade-off central.** Trocamos liberdade tipográfica por legibilidade
comparável. Nenhuma tela é tipograficamente ótima; todas são previsíveis.

---

## 10. Critérios de verificação

1. Todos os tamanhos pertencem à escala fechada.
2. A hierarquia usa peso e cor antes de tamanho.
3. Blocos de leitura respeitam a largura máxima.
4. A altura de linha corresponde à função.
5. Todo truncamento dá acesso ao conteúdo completo no contexto.
6. Nenhum texto do usuário é alterado sem solicitação.
7. Números comparáveis têm largura uniforme e alinhamento.
8. Monoespaçada aparece apenas em dado técnico copiável.
9. Nenhum texto está abaixo do tamanho mínimo.
10. O layout foi verificado com texto longo e traduzido.

---

## 11. Checklist do capítulo

- [ ] Usei apenas tamanhos da escala.
- [ ] Tentei peso e cor antes de aumentar o tamanho.
- [ ] Limitei a largura dos blocos de leitura.
- [ ] Truncamento tem acesso ao texto completo aqui mesmo.
- [ ] Não alterei nada que o usuário escreveu.
- [ ] Números comparáveis estão alinhados.
- [ ] Testei com nome longo e com tradução expandida.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 15 (leitura), 24 (`FH-24.05`), 28, 29 (contraste), 38.

**É pré-requisito de.** Capítulos 31 (ritmo), 35 (componentes), 36 (tabelas), 58
(microcopy), 60 (i18n).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Fontes e famílias | `--font-sans`, `--font-mono`, `--font-heading` em `src/app/globals.css` |
| Escala e utilitários | Classes de tamanho do Tailwind aplicadas via `cn` |
| Texto do usuário | `src/components/inbox/message-thread.tsx` |
| Dados tabulares | `src/components/ui/table.tsx`, `src/components/tremor/` |
| Textos traduzidos | `src/i18n/messages/pt-BR.json` |
