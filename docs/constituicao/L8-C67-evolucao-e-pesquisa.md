# Capítulo 67 — Evolução Contínua e Pesquisa

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 4, 11, 12, 25, 64, 65, 66 |
| É pré-requisito de | Capítulo 68, Anexo E |
| Artigos | `FH-67.01` a `FH-67.10` |

---

## 0. Núcleo Normativo

**`FH-67.01`** — As **fontes de evidência** têm peso declarado (§5). Nenhuma decisão
de experiência se apoia em fonte única.
> **Verificação:** a decisão combina mais de uma fonte de evidência? → SIM = cumpre | NÃO = viola.

**`FH-67.02`** — Frequência de pedido **NUNCA** é justificativa suficiente
(`FH-12.02`). Pedido indica problema; a solução é decidida pela Constituição.
> **Verificação:** a justificativa se apoia principalmente em volume de pedidos? → NÃO = cumpre | SIM = viola.

**`FH-67.03`** — Experimentação **NUNCA** degrada acessibilidade, isolamento de
dados, reversibilidade ou compreensão (`FH-03.02`, `FH-04.12`).
> **Verificação:** o experimento afeta algum dos quatro desempates transversais? → NÃO = cumpre | SIM = viola.

**`FH-67.04`** — A Constituição é **filtro obrigatório** de qualquer ideia, antes de
qualquer construção (`FH-12.01`).
> **Verificação:** a ideia passou pelos quatro testes de `FH-12.01`? → SIM = cumpre | NÃO = viola.

**`FH-67.05`** — Toda mudança relevante **DEVE** declarar o **efeito esperado** e
como ele será verificado (`FH-64.03`).
> **Verificação:** o efeito esperado e a forma de verificação estão declarados? → SIM = cumpre | NÃO = viola.

**`FH-67.06`** — Resultado contrário ao esperado **DEVE** levar à reversão ou à
correção declarada — **NUNCA** à normalização silenciosa.
> **Verificação:** o resultado negativo gerou reversão ou correção registrada? → SIM = cumpre | NÃO = viola.

**`FH-67.07`** — Pesquisa e observação de uso respeitam **privacidade e
minimização**, e **NUNCA** usam dados de terceiros para inferência comportamental
(`FH-11.04`, `FH-55.09`).
> **Verificação:** a pesquisa coleta apenas o necessário, sem usar dado de terceiro? → SIM = cumpre | NÃO = viola.

**`FH-67.08`** — Todo aprendizado relevante **DEVE** virar precedente registrado ou
artigo (`FH-65.05`).
> **Verificação:** o aprendizado foi convertido em precedente ou artigo? → SIM = cumpre | NÃO = viola.

**`FH-67.09`** — Experimentos **NUNCA** expõem parte dos usuários a versões que
violem artigos vigentes. Testa-se entre alternativas **conformes**.
> **Verificação:** todas as variantes testadas são conformes? → SIM = cumpre | NÃO = viola.

**`FH-67.10`** — Mudança que exija violar o **Livro I** só ocorre por emenda MAIOR
(`FH-04.01`). Identidade não se altera por experimento.
> **Verificação:** a mudança contraria o Livro I? Se sim, existe emenda MAIOR? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **como o produto aprende com o mundo real sem perder
identidade**. Ele fecha o ciclo da governança: as métricas do Capítulo 64 e as
dívidas do Capítulo 66 alimentam decisões de evolução, filtradas pela Constituição.

---

## 2. Perguntas que este capítulo responde

- Como decido o que construir?
- Como uso feedback sem ser refém dele?
- Como testo sem prejudicar usuário?
- Quando um pedido do cliente deve ser recusado?
- O que faço quando o resultado contraria a expectativa?

---

## 3. Definições

**Fonte de evidência** — origem de informação sobre uso real.

**Experimento** — comparação controlada entre alternativas conformes.

**Efeito esperado** — resultado declarado antes da mudança.

**Normalização silenciosa** — aceitar um resultado ruim sem decisão explícita.

**Filtro constitucional** — os quatro testes de `FH-12.01`.

---

## 4. Fundamento

**Por que fonte única não decide.** Cada fonte tem viés próprio: métricas mostram o
quê sem o porquê; pedidos vêm de quem tem voz; suporte concentra os casos ruins;
observação direta é rica e pouco representativa. Uma decisão apoiada em fonte única
herda integralmente o viés dela. Combinar fontes não elimina o viés — expõe as
contradições, que é onde está a informação útil.

**Por que pedido não é solução.** Já estabelecido em `FH-12.02`: usuários descrevem
soluções a partir do que conhecem, tipicamente do produto anterior que usavam.
Atender ao pedido literal costuma importar junto as premissas daquele produto — o
mecanismo exato que `FH-05.03` proíbe.

**Por que experimento não pode degradar.** Testar uma variante que viola
acessibilidade significa excluir deliberadamente parte dos usuários para medir o
efeito — o que é inaceitável independentemente do resultado. `FH-67.09` limita a
comparação a alternativas conformes, o que também melhora o experimento: a
diferença medida passa a ser a hipótese, não a conformidade.

**Por que declarar o efeito esperado antes.** Sem declaração prévia, qualquer
resultado é interpretado como sucesso — encontra-se um número que subiu e a
narrativa se ajusta. A declaração antecipada torna a refutação possível, que é o
que separa aprendizado de justificação.

**Por que resultado negativo exige ação.** Normalizar um resultado ruim é o modo
mais comum de o produto piorar sem que ninguém decida piorá-lo: a mudança fica, a
métrica cai, e em três meses a queda é o novo normal. `FH-67.06` obriga a decisão
explícita — reverter ou corrigir, com registro.

**Por que identidade não se testa.** Experimentos medem efeitos de curto prazo;
identidade se manifesta em anos. Uma variante que viole o Livro I pode até
apresentar números melhores no trimestre — e estar destruindo exatamente o que
diferencia o produto. Por isso a mudança de identidade é emenda MAIOR, com
evidência e análise de impacto, nunca experimento.

---

## 5. Fontes de evidência e seus pesos

| Fonte | O que revela bem | Viés | Peso |
| --- | --- | --- | --- |
| **Observação de uso real** | Onde o usuário trava, hesita, contorna | Amostra pequena | Alto para diagnóstico |
| **Métricas de esforço** (`FH-64`) | O quê e quanto | Não revela o porquê | Alto para detecção |
| **Registros de suporte** | Falhas concretas e recorrentes | Concentra casos ruins | Alto para prevenção |
| **Dívidas registradas** (`FH-66`) | Distância entre produto e Constituição | Depende do registro | Alto para prioridade |
| **Pedidos de clientes** | Existência de um problema | Descreve solução, não problema | Baixo para solução |
| **Comparação com concorrentes** | Convenções de mercado | Importa premissas alheias | Nenhum como fundamento (`FH-12.07`) |

**Regra de combinação.** Detecção por métrica + diagnóstico por observação +
priorização por dívida. Pedido isolado nunca fundamenta solução.

---

## 6. Regras normativas

### Filtro obrigatório antes de construir (`FH-67.04`)

Aplicam-se os quatro testes de `FH-12.01`, nesta ordem: **Pertencimento →
Direção → Princípios → Custo Permanente**. A primeira reprovação encerra a
análise.

### Ciclo de evolução

| Etapa | Obrigação | Artigo |
| --- | --- | --- |
| 1. Evidência | Mais de uma fonte, com pesos | `FH-67.01` |
| 2. Filtro | Quatro testes constitucionais | `FH-67.04` |
| 3. Declaração | Efeito esperado e forma de verificação | `FH-67.05` |
| 4. Construção | Conformidade durante, não depois | `FH-62.10` |
| 5. Verificação | Comparação com o efeito declarado | `FH-64` |
| 6. Decisão | Manter, corrigir ou reverter — explicitamente | `FH-67.06` |
| 7. Aprendizado | Precedente ou artigo | `FH-67.08` |

### `FH-67.09` — Limites do experimento

**Permitido.** Comparar duas soluções conformes; variar ordem, texto, densidade ou
padrão dentro do sistema.

**Proibido.** Variante que remova foco visível, esconda estado, dificulte a saída,
introduza padrão escuro ou aumente autonomia sem consentimento — nenhuma dessas é
"apenas um teste".

---

## 7. Anti-padrões

**Roadmap por pedido.** Construir o que mais aparece na lista (`FH-12.02`).

**Fonte única.** Decidir só por métrica ou só por relato.

**Efeito retroativo.** Definir o sucesso depois de ver o resultado.

**Normalização.** Aceitar piora sem decisão explícita.

**Teste de identidade.** Experimentar variantes que violam o Livro I.

**Experimento excludente.** Variante que degrada acessibilidade.

**Aprendizado perdido.** Descoberta relevante sem virar precedente ou artigo.

---

## 8. Impactos

**Cognitivo.** O filtro em quatro testes elimina deliberação recorrente sobre
construir ou não.

**Emocional.** Recusas fundamentadas preservam a relação com clientes melhor que
promessas vagas (`FH-12.10`).

**Produtividade.** Declarar efeito esperado evita construir o que não seria mantido
— o desperdício mais caro do ciclo.

**Percepção de qualidade.** Um produto que evolui sem oscilar de identidade é
percebido como confiável; um que muda de direção a cada trimestre, como instável.

**Curva de aprendizagem.** Aprendizados convertidos em artigo encurtam a curva de
todas as pessoas futuras.

---

## 9. Riscos e trade-offs

**Risco: conservadorismo.** O filtro pode recusar boas ideias novas. Mitigação:
`FH-12.01` exige registro também da recusa — recusar sem fundamento também viola.

**Risco: lentidão.** Declarar efeito e verificar depois alonga o ciclo. Trade-off
assumido: construir sem verificar produz acúmulo de funcionalidades cuja utilidade
ninguém conhece.

**Risco: excesso de reversão.** Reverter sempre que o número piora pode descartar
mudanças que precisavam de tempo. Mitigação: `FH-67.06` admite **corrigir** como
alternativa à reversão — o que é proibido é não decidir.

**Trade-off central.** Trocamos velocidade de resposta ao mercado por integridade
de identidade. O produto responde mais devagar a pedidos — e continua sendo ele
mesmo enquanto responde.

---

## 10. Critérios de verificação

1. Toda decisão combina mais de uma fonte de evidência.
2. Nenhuma justificativa se apoia principalmente em volume de pedidos.
3. Nenhum experimento afeta os quatro desempates transversais.
4. Toda ideia passou pelos quatro testes constitucionais.
5. Todo efeito esperado foi declarado antes da construção.
6. Todo resultado negativo gerou reversão ou correção registrada.
7. Toda pesquisa respeita minimização e não usa dado de terceiro.
8. Todo aprendizado virou precedente ou artigo.
9. Todas as variantes testadas são conformes.
10. Nenhuma mudança contrária ao Livro I ocorreu sem emenda MAIOR.

---

## 11. Checklist do capítulo

- [ ] Combinei métrica, observação e dívida registrada.
- [ ] Não estou construindo por volume de pedidos.
- [ ] Passei pelos quatro testes de `FH-12.01`.
- [ ] Declarei o efeito esperado e como vou verificar.
- [ ] Todas as variantes são conformes.
- [ ] O resultado negativo gerou decisão explícita.
- [ ] O aprendizado virou precedente ou artigo.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 4 (emenda), 11 (privacidade), 12 (fronteiras), 25
(jornada), 64 (métricas), 65 (alçadas), 66 (dívida).

**É pré-requisito de.** Capítulo 68 (agentes) e Anexo E (registro de decisões).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Métricas de uso | `src/lib/analytics/`, `src/app/(dashboard)/admin/` |
| Registro de aprendizados | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Inventário de dívidas | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
| Histórico de mudanças | `CHANGELOG.md` |
| Rito de emenda | `docs/constituicao/L0-C04-emenda-e-memoria.md` |
