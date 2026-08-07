# Capítulo 64 — Métricas de Experiência

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 11, 17, 25, 46, 55, 56 |
| É pré-requisito de | Capítulos 66, 67 |
| Artigos | `FH-64.01` a `FH-64.10` |

---

## 0. Núcleo Normativo

**`FH-64.01`** — As métricas primárias de experiência são de **esforço e tempo até
valor** (§5), nunca de engajamento (`FH-25.10`).
> **Verificação:** a métrica mede esforço ou tempo até valor? → SIM = cumpre | NÃO = viola.

**`FH-64.02`** — As **anti-métricas** (§6) **NUNCA** são objetivo de produto: tempo
de tela, frequência de acesso, cliques por sessão, tempo de sessão.
> **Verificação:** alguma anti-métrica foi adotada como objetivo? → NÃO = cumpre | SIM = viola.

**`FH-64.03`** — Toda métrica adotada **DEVE** declarar qual **princípio ou artigo**
ela protege.
> **Verificação:** a métrica declara o princípio que protege? → SIM = cumpre | NÃO = viola.

**`FH-64.04`** — Nenhuma métrica **PODE** virar meta que corrompa o comportamento
que ela mede. Detectada a corrupção, a meta é removida.
> **Verificação:** a métrica está sendo otimizada em detrimento do que deveria proteger? → NÃO = cumpre | SIM = viola.

**`FH-64.05`** — A medição respeita **privacidade e minimização**: coleta apenas o
necessário, com finalidade declarada (`FH-11.04`, `FH-11.11`).
> **Verificação:** cada dado coletado para medição tem finalidade declarada? → SIM = cumpre | NÃO = viola.

**`FH-64.06`** — Métrica de equipe **NUNCA** é convertida em avaliação individual
punitiva (`FH-11.07`, `FH-50.09`, `FH-56.07`).
> **Verificação:** a métrica é usada para coordenar, e não para julgar pessoas? → SIM = cumpre | NÃO = viola.

**`FH-64.07`** — Degradação detectada em métrica primária **DEVE** gerar dívida
registrada com prazo (`FH-66`).
> **Verificação:** a degradação virou dívida com prazo? → SIM = cumpre | NÃO = viola.

**`FH-64.08`** — Toda métrica **DEVE** declarar **base de cálculo, período e
limitações** (`FH-56.02`, `FH-56.06`).
> **Verificação:** base, período e limitações estão declarados? → SIM = cumpre | NÃO = viola.

**`FH-64.09`** — Nenhuma decisão de produto se apoia **apenas** em métrica
quantitativa. Evidência qualitativa é obrigatória para mudanças de experiência
(`FH-67.01`).
> **Verificação:** a decisão tem evidência qualitativa além do número? → SIM = cumpre | NÃO = viola.

**`FH-64.10`** — Métricas são revisadas periodicamente. Métrica que não influencia
decisão **DEVE** ser removida.
> **Verificação:** cada métrica ativa influenciou alguma decisão no último ciclo? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **como se mede se a Constituição está sendo cumprida na
prática** — e, tão importante, quais medições são proibidas porque corrompem o
produto ao serem perseguidas.

---

## 2. Perguntas que este capítulo responde

- O que medir?
- Como sei que a experiência piorou?
- Que métrica é enganosa?
- Como ligo métrica a princípio?
- Métrica pode virar meta?

---

## 3. Definições

**Métrica primária** — mede diretamente esforço ou tempo até valor.

**Anti-métrica** — número que sobe quando a experiência piora.

**Corrupção de métrica** — otimizar o indicador em detrimento do que ele mede.

**Evidência qualitativa** — observação de uso real, relato ou registro de
dificuldade.

---

## 4. Fundamento

**Por que medir esforço, e não engajamento.** O FlowHub existe para **reduzir**
esforço (`FH-06.01`). Num produto assim, tempo de tela subindo pode significar
exatamente o fracasso: o usuário está demorando mais para fazer o mesmo. Adotar
engajamento como objetivo inverte o incentivo — a equipe passa a ser recompensada
por prender o usuário, que é o oposto da tese.

**Por que anti-métricas são nomeadas.** Elas não são erradas como observação; são
erradas como **objetivo**. Tempo de sessão é informação útil para diagnosticar; é
destrutivo como meta. Nomeá-las explicitamente evita que sejam adotadas por
inércia, já que são as métricas mais fáceis de coletar.

**Por que toda métrica declara o princípio que protege.** Sem essa ligação, métricas
acumulam-se por disponibilidade — mede-se o que é fácil, não o que importa. A
declaração também permite descartar: se nenhum princípio é protegido, a métrica é
ruído.

**Por que meta corrompe medição.** Quando um indicador vira meta, ele deixa de medir
o fenômeno e passa a medir o esforço de otimizá-lo. Em experiência isso é
especialmente rápido: reduzir "tempo até concluir" pode ser obtido removendo
confirmações necessárias — o número melhora e o produto piora.

**Por que número sozinho não decide.** Métricas dizem **o que** mudou, nunca **por
quê**. Uma queda pode significar problema novo, sazonalidade ou mudança de
composição de usuários. Decidir experiência apenas por número produz correções que
tratam o sintoma — e frequentemente pioram a causa.

**Por que remover métricas.** Painéis crescem por acumulação e ninguém remove nada.
Métricas que não influenciam decisão consomem atenção e dão a impressão de
acompanhamento — o mesmo problema de `FH-56.04` aplicado internamente.

---

## 5. Métricas primárias

| Métrica | O que mede | Princípio protegido |
| --- | --- | --- |
| **Tempo até o Primeiro Valor Real** | Quanto demora até o primeiro resultado útil | `FH-25.01` |
| **Passos por tarefa dominante** | Custo de execução do fluxo principal | `FH-07.04`, `FH-19.02` |
| **Trocas de dispositivo por fluxo** | Custo físico e quebra de ritmo | `FH-19.06` |
| **Taxa de retomada bem-sucedida** | Se o contexto sobrevive à interrupção | `FH-14.01`, `FH-10.05` |
| **Erros evitados por prevenção** | Efeito das mudanças de desenho | `FH-44.01` |
| **Trabalho preservado em falha** | Cumprimento da promessa de preservação | `FH-10.01` |
| **Adoção de caminho fluente** | Se a profundidade é descoberta | `FH-16.08`, `FH-48` |
| **Conformidade de acessibilidade** | Cobertura das verificações obrigatórias | `FH-38.11` |
| **Dívidas abertas por gravidade** | Distância entre produto e Constituição | `FH-66` |

---

## 6. Anti-métricas proibidas como objetivo (`FH-64.02`)

| Anti-métrica | Por que é proibida como objetivo |
| --- | --- |
| Tempo de tela | Sobe quando o produto fica mais lento ou mais confuso |
| Frequência de acesso | Incentiva mecânicas de retorno compulsivo (`FH-17.07`) |
| Cliques por sessão | Sobe quando o fluxo exige mais passos |
| Duração de sessão | Confunde permanência com valor |
| Número de funcionalidades usadas | Incentiva dispersão, não resultado |
| Volume de notificações abertas | Incentiva interrupção (`FH-40.02`) |

**Uso permitido.** Todas podem ser observadas como **diagnóstico**. Nenhuma pode
ser adotada como **meta**.

---

## 7. Anti-padrões

**Métrica de vaidade.** Número que sobe sem relação com resultado do usuário.

**Meta corruptora.** Indicador perseguido às custas do que ele mede.

**Painel-museu.** Métricas que ninguém usa para decidir.

**Decisão por número.** Mudança de experiência sem evidência qualitativa.

**Vigilância disfarçada.** Métrica de equipe usada como avaliação individual.

**Coleta oportunista.** Medir porque é fácil, sem finalidade declarada.

**Degradação normalizada.** Piora detectada e não registrada.

---

## 8. Impactos

**Cognitivo.** Poucas métricas com propósito declarado reduzem a carga de
interpretação nas decisões de produto.

**Emocional.** Ausência de métricas individuais punitivas preserva a relação da
equipe com a ferramenta (`FH-11.07`).

**Produtividade.** Métricas de esforço apontam exatamente onde o ganho está — e
onde as mudanças recentes custaram.

**Percepção de qualidade.** Medir esforço mantém o produto alinhado com a tese;
medir engajamento o afasta dela lentamente e sem alarme.

**Curva de aprendizagem.** Tempo até o Primeiro Valor Real é a métrica que melhor
resume a saúde da curva inteira.

---

## 9. Riscos e trade-offs

**Risco: medição insuficiente.** Proibir anti-métricas pode reduzir visibilidade.
Mitigação: elas continuam permitidas como diagnóstico.

**Risco: métricas difíceis.** Esforço e retomada são mais caros de medir que
cliques. Custo assumido: medir o fácil e errado é pior que medir pouco e certo.

**Risco: excesso de qualitativo.** Exigir evidência qualitativa desacelera
decisões. Mitigação: aplica-se a mudanças de experiência, não a correções de
defeito.

**Trade-off central.** Trocamos métricas convenientes por métricas fiéis. Os
painéis ficam menos impressionantes e passam a apontar para os problemas certos.

---

## 10. Critérios de verificação

1. As métricas primárias medem esforço ou tempo até valor.
2. Nenhuma anti-métrica é objetivo de produto.
3. Toda métrica declara o princípio que protege.
4. Nenhuma métrica virou meta corruptora.
5. Toda coleta tem finalidade declarada.
6. Nenhuma métrica de equipe vira avaliação individual.
7. Toda degradação detectada virou dívida com prazo.
8. Toda métrica declara base, período e limitações.
9. Nenhuma decisão de experiência se apoia só em número.
10. Métricas sem uso decisório foram removidas.

---

## 11. Checklist do capítulo

- [ ] A métrica mede esforço ou tempo até valor.
- [ ] Não adotei nenhuma anti-métrica como objetivo.
- [ ] Declarei o princípio que ela protege.
- [ ] Declarei base de cálculo, período e limitações.
- [ ] A coleta respeita minimização e finalidade.
- [ ] Nenhum número virou avaliação de pessoa.
- [ ] Tenho evidência qualitativa além do número.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (tese), 11 (privacidade), 17 (`FH-17.07`), 25
(`FH-25.10`), 46 (desempenho), 55 (adaptação), 56 (apresentação de dados).

**É pré-requisito de.** Capítulos 66 (dívida), 67 (evolução).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Análise de uso | `src/lib/analytics/`, `src/app/(dashboard)/admin/` |
| Métricas de entrada | `src/app/(dashboard)/admin/onboarding-analytics/` |
| Observabilidade técnica | `sentry.client.config.ts`, `sentry.server.config.ts` |
| Retenção e finalidade | `docs/business-rules/`, `docs/legal/` |
| Registro de dívidas | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
