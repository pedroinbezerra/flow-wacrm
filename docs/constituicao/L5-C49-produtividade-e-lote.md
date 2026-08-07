# Capítulo 49 — Produtividade, Lote e Repetição

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 11, 13, 18, 19, 44, 45 |
| É pré-requisito de | Capítulos 54, 55 |
| Artigos | `FH-49.01` a `FH-49.10` |

---

## 0. Núcleo Normativo

**`FH-49.01`** — A seleção **DEVE** ser previsível e persistente: sobrevive a
rolagem, filtro, paginação e navegação de retorno, e é sempre visível em número
(`FH-23.05`).
> **Verificação:** a seleção sobrevive a rolagem, filtro e retorno, com o total visível? → SIM = cumpre | NÃO = viola.

**`FH-49.02`** — Antes de executar, a ação em lote **DEVE** declarar o **alcance
real**: quantos itens, quais serão ignorados e por quê (`FH-17.09`).
> **Verificação:** o alcance exato foi declarado antes da execução? → SIM = cumpre | NÃO = viola.

**`FH-49.03`** — Após executar, **DEVE** haver relatório **por item**, com caminho
para reprocessar apenas os que falharam (`FH-44.08`).
> **Verificação:** o resultado identifica cada item e permite reprocessar seletivamente? → SIM = cumpre | NÃO = viola.

**`FH-49.04`** — Operação em lote reversível **DEVE** oferecer desfazer **do lote
inteiro**, e não item a item (`FH-45.08`).
> **Verificação:** sendo reversível, existe desfazer do lote completo? → SIM = cumpre | NÃO = viola.

**`FH-49.05`** — Repetição detectada **DEVE** gerar oferta de automação, com
pré-visualização do efeito, e **NUNCA** automação silenciosa (`FH-06.11`,
`FH-18.08`).
> **Verificação:** a repetição virou oferta com pré-visualização, e não automação automática? → SIM = cumpre | NÃO = viola.

**`FH-49.06`** — Toda operação em lote **DEVE** ter limite de segurança declarado —
teto de itens, janela de execução ou ambos — para impedir dano em massa acidental.
> **Verificação:** existe limite de segurança declarado para esta operação? → SIM = cumpre | NÃO = viola.

**`FH-49.07`** — A seleção de "todos" **DEVE** declarar o número real, distinguindo
explicitamente os itens visíveis dos itens fora da visão.
> **Verificação:** "todos" declara o total real e distingue o que está fora da visão? → SIM = cumpre | NÃO = viola.

**`FH-49.08`** — Ação em lote que afeta terceiros segue **integralmente** o
tratamento de `FH-45.07`: resumo, confirmação e nenhuma promessa de reversão após
o início.
> **Verificação:** a ação em lote sobre terceiros recebeu o tratamento da categoria própria? → SIM = cumpre | NÃO = viola.

**`FH-49.09`** — O progresso do lote **DEVE** ser honesto (`FH-46.04`) e
interrompível sempre que a interrupção for tecnicamente possível — informando o que
já foi executado.
> **Verificação:** o progresso é medido e a interrupção informa o que já ocorreu? → SIM = cumpre | NÃO = viola.

**`FH-49.10`** — Repetição manual **NUNCA** é o único caminho quando a operação em
lote é possível (`FH-19.09`).
> **Verificação:** existe caminho em lote para esta operação repetitiva? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo otimiza o **trabalho repetitivo de alto volume**, que é o coração da
operação comercial — e simultaneamente o maior vetor de dano acidental do produto,
porque um erro em lote atinge muitos de uma vez.

---

## 2. Perguntas que este capítulo responde

- Quando ofereço ação em lote?
- Como mostro o que será afetado?
- Como trato sucesso parcial?
- Como reduzo trabalho repetido?
- Quando o sistema deve oferecer transformar repetição em automação?

---

## 3. Definições

**Lote** — operação aplicada a vários itens em uma execução.

**Alcance** — conjunto exato de itens que serão afetados.

**Limite de segurança** — teto declarado que impede execução acima de determinada
escala sem etapa adicional.

**Reprocessamento seletivo** — repetir a operação apenas sobre os itens que
falharam.

**Repetição detectada** — sequência de ações idênticas identificada pelo sistema.

---

## 4. Fundamento

**Por que lote é ergonomia antes de produtividade.** Repetir o mesmo movimento
dezenas de vezes não é apenas lento: a repetição adormece a verificação, e o
usuário passa a executar sem conferir. O erro por desatenção em trabalho manual
repetitivo é mais provável que o erro em uma operação em lote bem declarada.

**Por que o alcance precisa ser declarado antes.** É a diferença entre uma
ferramenta poderosa e uma armadilha. O usuário seleciona com filtro aplicado, o
filtro muda, a seleção permanece — e a ação atinge itens que ele não pretendia.
`FH-49.02` e `FH-49.07` fecham as duas portas: o número real e a distinção entre o
visível e o invisível.

**Por que "todos" é perigoso.** "Selecionar todos" quase sempre significa "todos os
visíveis" na cabeça do usuário e "todos os existentes" na implementação. A
diferença entre 50 e 12.000 itens aparece só na execução. Declarar explicitamente
resolve, e o custo é uma linha de texto.

**Por que o relatório é por item.** "Alguns itens falharam" transfere ao usuário o
trabalho de descobrir quais — em uma operação que ele executou justamente para não
trabalhar item a item. O relatório por item com reprocessamento seletivo é o que
torna a falha parcial administrável.

**Por que limite de segurança é obrigatório.** Operações em lote são o vetor de dano
em massa: um erro de seleção pode atingir a base inteira, e no caso de envio
alcança terceiros de forma irreversível (`FH-11`). O limite não impede o uso
legítimo — impede que ele aconteça por acidente, sem etapa de consciência.

**Por que repetição vira oferta, nunca automação.** Detectar padrão e automatizar
sozinho seria a violação mais direta de `FH-18.11` e de P2. A oferta com
pré-visualização preserva o valor da detecção e devolve a decisão a quem responde
por ela.

---

## 5. Princípios

**Repetição manual adormece a verificação.**

**Declare o alcance antes; relate por item depois.**

**"Todos" é a palavra mais perigosa da interface.**

**Detectar repetição é inteligência; automatizar sozinho é abuso.**

---

## 6. Regras normativas

### Ciclo obrigatório da operação em lote

| Etapa | Obrigação | Artigo |
| --- | --- | --- |
| 1. Seleção | Previsível, persistente, com total visível | `FH-49.01` |
| 2. Declaração | Alcance real, exceções e motivo | `FH-49.02`, `FH-49.07` |
| 3. Autorização | Conforme matriz do Capítulo 45; terceiros = categoria própria | `FH-49.08` |
| 4. Execução | Progresso honesto, interrompível quando possível | `FH-49.09` |
| 5. Relatório | Por item, com reprocessamento seletivo | `FH-49.03` |
| 6. Reversão | Desfazer do lote inteiro, quando reversível | `FH-49.04` |

Pular qualquer etapa aplicável é violação.

### `FH-49.02` — Declaração de alcance

**Certo.** "Aplicar etiqueta a 312 contatos. 4 serão ignorados por já possuírem
esta etiqueta."

**Errado.** "Aplicar a itens selecionados." Não diz quantos nem o que será
ignorado.

### `FH-49.07` — O caso de "todos"

**Certo.** "Selecionados: 50 nesta página. **Selecionar todos os 12.480 contatos do
filtro atual.**" — distinção explícita, ação separada.

**Errado.** Uma caixa "selecionar tudo" que, sem aviso, passa de 50 para 12.480.

### `FH-49.06` — Limite de segurança

**Quando NÃO aplicar.** Operações internas, reversíveis e sem efeito sobre
terceiros podem ter limite alto — mas ainda declarado.

**Certo.** Acima de determinado volume, a operação exige etapa adicional de
confirmação com digitação (`FH-45.05`) ou é distribuída em janelas.

---

## 7. Anti-padrões

**Seleção volátil.** Perdida ao rolar, filtrar ou voltar.

**Alcance implícito.** "Itens selecionados", sem número.

**Todos ambíguo.** Salto silencioso de página para base inteira.

**Falha opaca.** "Alguns itens falharam."

**Lote sem teto.** Nenhum limite de segurança.

**Automação furtiva.** Repetição detectada virando ação sem consentimento.

**Progresso decorativo.** Barra sem medição real.

**Repetição obrigatória.** Ação item a item sem alternativa em lote.

---

## 8. Impactos

**Cognitivo.** A declaração de alcance converte uma decisão de memória ("o que
selecionei mesmo?") em leitura — mais confiável e mais rápida.

**Emocional.** Operações em lote são as de maior ansiedade do produto. Declaração
prévia e desfazer convertem essa ansiedade em confiança.

**Produtividade.** É o capítulo de maior ganho absoluto para o Operador e o
Construtor: substitui dezenas de execuções por uma.

**Percepção de qualidade.** Relatório por item com reprocessamento seletivo é um
dos sinais mais claros de produto maduro — a maioria entrega "alguns falharam".

**Curva de aprendizagem.** `FH-49.05` transforma o próprio uso em caminho para a
automação: o usuário chega às automações pela repetição observada, não por
documentação.

---

## 9. Riscos e trade-offs

**Risco: dano em massa.** É o risco central do capítulo. Mitigado por declaração
prévia, limite de segurança, categoria própria para terceiros e desfazer.

**Risco: fricção excessiva.** Declarações e limites tornam o lote mais lento.
Mitigação: a fricção é proporcional ao alcance — poucos itens quase não sentem.

**Risco: ofertas de automação ruidosas.** Detecção agressiva vira insistência.
Mitigação: `FH-06.11` exige padrão estável e não ambíguo antes de ofertar.

**Trade-off central.** Trocamos velocidade bruta por segurança declarada. O lote
poderia executar em um clique — e é justamente essa versão que apaga bases inteiras
por engano.

---

## 10. Critérios de verificação

1. A seleção sobrevive a rolagem, filtro, paginação e retorno, com total visível.
2. O alcance real é declarado antes da execução.
3. Existe relatório por item com reprocessamento seletivo.
4. Operações reversíveis oferecem desfazer do lote inteiro.
5. Repetição detectada gera oferta com pré-visualização, nunca automação
   silenciosa.
6. Toda operação em lote tem limite de segurança declarado.
7. "Todos" declara o total real e distingue o que está fora da visão.
8. Lote sobre terceiros recebe o tratamento de `FH-45.07`.
9. O progresso é medido e a interrupção informa o já executado.
10. Toda operação repetitiva tem caminho em lote.

---

## 11. Checklist do capítulo

- [ ] A seleção sobrevive a filtro, rolagem e retorno.
- [ ] Declarei quantos itens e o que será ignorado, antes de executar.
- [ ] "Todos" mostra o número real e separa visível de invisível.
- [ ] Há limite de segurança para esta operação.
- [ ] O relatório diz item a item o que aconteceu.
- [ ] Consigo reprocessar só o que falhou.
- [ ] Sendo reversível, desfaço o lote inteiro.
- [ ] Se afeta terceiros, apliquei `FH-45.07` integralmente.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (`FH-06.11`), 11 (terceiros), 13 (Operador), 18
(autonomia), 19 (`FH-19.09`), 44 (`FH-44.08`), 45 (matriz).

**É pré-requisito de.** Capítulos 54 (automações), 55 (personalização).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Seleção e ações em lote | `src/components/contacts/`, `src/components/broadcasts/step2-select-audience.tsx` |
| Importação em massa | Fluxos de importação de contatos em `src/components/contacts/` |
| Disparos e destinatários | `src/lib/broadcast-status.ts`, `src/components/broadcasts/` |
| Limites e cotas | `src/lib/rate-limit.ts`, `src/lib/consumption/`, `src/lib/plans/` |
| Detecção de repetição | `src/lib/automations/`, `src/lib/flows/` |
