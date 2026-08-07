# Capítulo 62 — Critérios de Qualidade e Definição de Pronto

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 14, 38, 41, 44, 45, 51, 60, 61, 68 |
| É pré-requisito de | Capítulos 63, 65, 66 |
| Artigos | `FH-62.01` a `FH-62.10` |

---

## 0. Núcleo Normativo

**`FH-62.01`** — Existem **oito bloqueios absolutos** (§5). Qualquer um deles
impede a entrega, sem exceção e sem conversão em dívida.
> **Verificação:** algum bloqueio absoluto está presente? → NÃO = cumpre | SIM = entrega bloqueada.

**`FH-62.02`** — "Pronto" tem definição declarada (§6). Nada é considerado pronto
por acordo tácito.
> **Verificação:** todos os itens da definição de pronto foram cumpridos? → SIM = cumpre | NÃO = viola.

**`FH-62.03`** — Todo item adiado **DEVE** virar dívida registrada com **prazo e
responsável** (`FH-66.08`).
> **Verificação:** o adiamento tem registro, prazo e responsável? → SIM = cumpre | NÃO = viola.

**`FH-62.04`** — Quem declara pronto é **identificável** e responde pela declaração
(`FH-65.02`).
> **Verificação:** é possível identificar quem declarou pronto? → SIM = cumpre | NÃO = viola.

**`FH-62.05`** — As **verificações obrigatórias** (§6) precedem a entrega: contexto
adverso, acessibilidade, modos e acentos, superfície pequena, volume alto.
> **Verificação:** as cinco verificações foram realizadas? → SIM = cumpre | NÃO = viola.

**`FH-62.06`** — Toda entrega com efeito perceptível **DEVE** conter o **Bloco de
Conformidade** (`FH-68.02`, `FH-01.08`).
> **Verificação:** o Bloco de Conformidade está presente e completo? → SIM = cumpre | NÃO = viola.

**`FH-62.07`** — Bloqueio absoluto **NUNCA** vira dívida. Se não pode ser corrigido,
a entrega não acontece.
> **Verificação:** algum bloqueio absoluto foi registrado como dívida? → NÃO = cumpre | SIM = viola.

**`FH-62.08`** — "Pronto" inclui **estados, textos, traduções, permissões e
verificações** — não apenas o caminho principal funcionando.
> **Verificação:** estados, textos, i18n e permissões estão completos? → SIM = cumpre | NÃO = viola.

**`FH-62.09`** — Diante de um bloqueio descoberto tarde, **reverter é preferível a
entregar**. Entrega parcial que viola bloqueio é proibida.
> **Verificação:** houve entrega com bloqueio conhecido? → NÃO = cumpre | SIM = viola.

**`FH-62.10`** — Qualidade **NUNCA** é fase posterior. É critério de aceite aplicado
durante a construção.
> **Verificação:** a conformidade foi verificada durante a construção, e não apenas ao final? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **objetivamente quando algo pode ser entregue**. Ele existe
para que "pronto" deixe de ser uma avaliação subjetiva negociada sob pressão de
prazo.

---

## 2. Perguntas que este capítulo responde

- O que é "pronto"?
- O que bloqueia a entrega?
- O que é aceitável adiar?
- Quem declara pronto?
- Como registro o que foi adiado?

---

## 3. Definições

**Bloqueio absoluto** — violação que impede a entrega em qualquer circunstância.

**Definição de pronto** — conjunto de condições que precisam ser verdadeiras.

**Dívida** — item conforme adiado, com prazo e responsável (`FH-66`).

**Verificação obrigatória** — teste que precede a entrega.

**Bloco de Conformidade** — declaração final da entrega (`FH-68.02`).

---

## 4. Fundamento

**Por que bloqueios absolutos não negociam.** Todos os oito representam danos
irreversíveis ou exclusão de usuários — categorias que, por `FH-03.02`, não competem
com ganhos graduais. Permitir que virem dívida cria o mecanismo pelo qual eles se
tornam permanentes: a dívida é registrada, o prazo passa, e o defeito vira o estado
normal do produto.

**Por que "pronto" precisa ser declarado.** Sem definição, "pronto" significa "o
caminho principal funciona na minha máquina". Todos os estados, textos, traduções e
permissões ficam para depois — e "depois" chega em produção, para o usuário.
`FH-62.08` torna explícito o que sempre esteve implícito e nunca foi cumprido.

**Por que quem declara é identificável.** Não para punir: para que exista alguém a
quem perguntar. Entregas anônimas tornam impossível reconstruir o raciocínio meses
depois, e a informação some junto com a memória de quem participou.

**Por que reverter é preferível a entregar.** Descobrir um bloqueio perto do prazo
cria pressão real para entregar assim mesmo. `FH-62.09` remove a decisão da mesa:
o custo de reverter é conhecido e limitado; o custo de um bloqueio em produção não
é — pode incluir perda de dado, exclusão de usuários ou vazamento entre contas.

**Por que qualidade não é fase.** Verificação ao final encontra defeitos quando a
correção é mais cara e quando já não há tempo — o que garante que ela seja
negociada. Verificar durante a construção é mais barato em todas as medidas.

---

## 5. Os oito bloqueios absolutos

| # | Bloqueio | Artigo | Por que é absoluto |
| --- | --- | --- | --- |
| 1 | **Violação de acessibilidade** | `FH-38.01` | Perda binária: a pessoa consegue ou não usa |
| 2 | **Perda de trabalho do usuário** | `FH-10.01`, `FH-44.05` | Irreversível e destrói confiança de forma permanente |
| 3 | **Quebra de isolamento por conta** | `FH-10.06`, `FH-51.10` | Dano a terceiros e responsabilidade legal |
| 4 | **Estado aplicável não tratado** | `FH-41.02`, `FH-41.03` | Produz comportamento indefinido em produção |
| 5 | **Ação destrutiva sem saída** | `FH-44.07`, `FH-45.01` | Dano irreversível por desenho |
| 6 | **Efeito externo sem autorização** | `FH-07.03`, `FH-10.03`, `FH-52.03` | Alcança terceiros e não pode ser desfeito |
| 7 | **Texto fora do sistema de traduções** | `FH-60.01` | Invisível para governança de linguagem |
| 8 | **Estado exibido falso** | `FH-07.10`, `FH-41.11` | Mentira de estado corrompe todas as decisões |

**Regra.** Nenhum destes vira dívida (`FH-62.07`). Se não é corrigível agora, a
entrega não acontece.

---

## 6. Definição de pronto

| Dimensão | Condição |
| --- | --- |
| **Funcional** | A tarefa dominante é concluível do início ao fim |
| **Estados** | Todos os estados aplicáveis tratados (`FH-41.02`) |
| **Adversidade** | Verificado com rede degradada, interrupção, volume alto |
| **Acessibilidade** | Verificado só com teclado e com leitor de tela (`FH-38.11`) |
| **Visual** | Verificado em todos os modos e acentos (`FH-29.10`) |
| **Superfície** | Verificado em superfície pequena com toque (`FH-37.10`) |
| **Texto** | Todos os textos no dicionário, revisados (`FH-58`, `FH-60.10`) |
| **Permissões** | Recusas explicadas; autorização no servidor (`FH-51`) |
| **Conformidade** | Bloco de Conformidade completo (`FH-68.02`) |
| **Dívidas** | Adiamentos registrados com prazo e responsável |

**Verificações obrigatórias (`FH-62.05`):** contexto adverso · acessibilidade ·
modos e acentos · superfície pequena · volume máximo previsto.

---

## 7. Anti-padrões

**Pronto tácito.** Ninguém sabe dizer o que faltava.

**Bloqueio adiado.** Violação absoluta registrada como dívida.

**Caminho principal.** Entregar só o que funciona no cenário ideal.

**Qualidade no fim.** Verificação como etapa final, negociada sob prazo.

**Adiamento sem prazo.** Dívida que vira permanente por omissão.

**Declaração anônima.** Ninguém responde pelo pronto.

**Entrega sob pressão.** Bloqueio conhecido enviado por causa de data.

---

## 8. Impactos

**Cognitivo.** Definição declarada elimina a negociação recorrente sobre o que
falta — a lista responde.

**Emocional.** Critérios objetivos protegem quem constrói: "não está pronto" deixa
de ser julgamento e passa a ser verificação.

**Produtividade.** Verificar durante a construção é várias vezes mais barato que
corrigir depois da entrega.

**Percepção de qualidade.** Os oito bloqueios cobrem exatamente as falhas que
destroem confiança de forma permanente.

**Curva de aprendizagem.** Para quem chega, a definição de pronto é o resumo
operacional da Constituição inteira.

---

## 9. Riscos e trade-offs

**Risco: entregas mais lentas.** Dez dimensões de pronto atrasam. Trade-off
assumido: o atraso é previsível; o defeito em produção não.

**Risco: dívida acumulada.** Registrar em vez de corrigir pode virar hábito.
Mitigação: `FH-66.08` proíbe dívida sem prazo, e bloqueios não podem ser adiados.

**Risco: burocracia de declaração.** O Bloco de Conformidade custa tempo.
Mitigação: ele é curto e substitui a auditoria manual da revisão.

**Trade-off central.** Trocamos velocidade de entrega por previsibilidade de
qualidade. Menos coisas saem por semana; menos coisas voltam.

---

## 10. Critérios de verificação

1. Nenhum bloqueio absoluto está presente.
2. Todos os itens da definição de pronto foram cumpridos.
3. Todo adiamento tem registro, prazo e responsável.
4. Quem declarou pronto é identificável.
5. As cinco verificações obrigatórias foram realizadas.
6. O Bloco de Conformidade está completo.
7. Nenhum bloqueio absoluto foi convertido em dívida.
8. Estados, textos, traduções e permissões estão completos.
9. Nenhuma entrega ocorreu com bloqueio conhecido.
10. A conformidade foi verificada durante a construção.

---

## 11. Checklist do capítulo

- [ ] Verifiquei os oito bloqueios absolutos.
- [ ] Percorri a definição de pronto inteira.
- [ ] Fiz as cinco verificações obrigatórias.
- [ ] Textos estão no dicionário e revisados.
- [ ] Recusas explicam e a autorização está no servidor.
- [ ] Escrevi o Bloco de Conformidade.
- [ ] Tudo que adiei tem prazo e responsável.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10, 14, 38, 41, 44, 45, 51, 60, 61 (heurísticas), 68
(bloco de conformidade).

**É pré-requisito de.** Capítulos 63 (checklists), 65 (governança), 66 (dívida).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Verificações automatizadas | `pnpm lint`, `pnpm typecheck`, `pnpm test` |
| Integração contínua | `.github/workflows/ci.yml` |
| Auditoria de textos | `audit-translations.js` |
| Registro de dívidas | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
| Convenções de implementação | `AGENTS.md`, seções 14 e 15 |
