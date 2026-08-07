# Capítulo 66 — Dívida de Experiência e Depreciação

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 1, 12, 16, 28, 61, 62, 65 |
| É pré-requisito de | Capítulo 67, Anexo F |
| Artigos | `FH-66.01` a `FH-66.10` |

---

## 0. Núcleo Normativo

**`FH-66.01`** — Toda dívida **DEVE** ser classificada em três gravidades (§5):
**crítica**, **estrutural** ou **pontual**.
> **Verificação:** a dívida está classificada? → SIM = cumpre | NÃO = viola.

**`FH-66.02`** — Toda desconformidade encontrada **DEVE** ser registrada no momento
em que é descoberta, mesmo quando não for corrigida (`FH-61.09`).
> **Verificação:** a desconformidade encontrada foi registrada? → SIM = cumpre | NÃO = viola.

**`FH-66.03`** — **Regra do escoteiro com limite de escopo.** Corrigir o que está no
caminho é permitido; ampliar o escopo da entrega para corrigir dívida alheia é
proibido (`FH-68.10`). O que não se corrige, registra-se.
> **Verificação:** a correção ficou dentro do escopo, com o restante registrado? → SIM = cumpre | NÃO = viola.

**`FH-66.04`** — É proibido **propagar padrão não conforme** por consistência local.
O produto atual nunca é precedente (`FH-01.06`).
> **Verificação:** a solução repete padrão não conforme por consistência com o entorno? → NÃO = cumpre | SIM = viola.

**`FH-66.05`** — Dívida **crítica** tem prioridade sobre funcionalidade nova.
Nenhuma funcionalidade entra enquanto houver dívida crítica aberta na mesma área.
> **Verificação:** existe dívida crítica aberta na área desta entrega? → NÃO = cumpre | SIM = viola.

**`FH-66.06`** — Depreciação exige **substituto declarado, prazo e caminho de
migração** (`FH-28.10`).
> **Verificação:** a depreciação declara substituto, prazo e migração? → SIM = cumpre | NÃO = viola.

**`FH-66.07`** — Mudança perceptível decorrente de correção de dívida **DEVE** ser
comunicada ao usuário, com transição (`FH-16.09`).
> **Verificação:** a mudança perceptível foi comunicada com transição? → SIM = cumpre | NÃO = viola.

**`FH-66.08`** — **Dívida sem prazo é proibida.** Vencido o prazo sem correção, a
dívida **DEVE** ser reclassificada ou repriorizada — nunca renovada em silêncio.
> **Verificação:** toda dívida tem prazo válido? → SIM = cumpre | NÃO = viola.

**`FH-66.09`** — O inventário de dívidas é mantido no **Anexo F** e atualizado a
cada descoberta e a cada correção.
> **Verificação:** o Anexo F reflete o estado atual das dívidas? → SIM = cumpre | NÃO = viola.

**`FH-66.10`** — Remoção de funcionalidade segue o **ciclo de depreciação**, nunca
exclusão abrupta (`FH-12.09`).
> **Verificação:** a remoção seguiu o ciclo de depreciação? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo trata as partes do produto que **contradizem a Constituição**. Ele
existe porque todo produto real tem desconformidades, e a diferença entre um
produto que converge e um que diverge está em como elas são tratadas.

---

## 2. Perguntas que este capítulo responde

- O que faço quando encontro algo fora do padrão?
- Corrijo agora ou registro?
- Como deprecio um padrão antigo sem quebrar o hábito do usuário?
- Dívida pode ficar aberta para sempre?

---

## 3. Definições

**Dívida de experiência** — parte do produto que contradiz a Constituição e ainda
não foi corrigida.

**Dívida crítica** — viola bloqueio absoluto (`FH-62.01`).

**Dívida estrutural** — viola padrão que se propaga: modelo, navegação, componente,
vocabulário.

**Dívida pontual** — viola artigo em um local isolado, sem propagação.

**Depreciação** — retirada planejada de um padrão ou funcionalidade.

---

## 4. Fundamento

**Por que registrar mesmo sem corrigir.** Desconformidade não registrada é
desconformidade que será redescoberta — e, na segunda descoberta, provavelmente
imitada, porque parecerá padrão. O registro converte um defeito silencioso em item
gerenciável e impede que ele vire precedente (`FH-01.06`).

**Por que limitar o escopo da correção.** A tentação de corrigir tudo que se
encontra produz entregas imprevisíveis, difíceis de revisar e arriscadas. O limite
de escopo protege a revisibilidade; o registro garante que o achado não se perca.
Os dois juntos resolvem a tensão entre "não deixe pior" e "não amplie o escopo"
(`FH-68.10`).

**Por que padrão não conforme não se propaga.** É o mecanismo pelo qual dívidas se
multiplicam: alguém encontra um padrão errado e o repete "por consistência". Em
poucos ciclos, a desconformidade vira maioria e a correção passa a parecer a
exceção. `FH-66.04` corta isso na origem — consistência é com a Constituição, não
com o entorno.

**Por que dívida crítica bloqueia funcionalidade nova.** Bloqueios absolutos
representam dano irreversível ou exclusão de usuários. Construir sobre uma área com
dívida crítica aumenta a superfície do problema e adia a correção indefinidamente,
porque nunca haverá um momento mais conveniente.

**Por que dívida sem prazo é proibida.** Sem prazo, a dívida some do radar e vira
estado permanente. O prazo não garante a correção — garante a **revisita**, que é o
mínimo para que a decisão de adiar continue sendo uma decisão, e não um
esquecimento.

**Por que depreciação, não remoção abrupta.** O usuário construiu hábito e processo
sobre o que existe. Remover sem substituto, prazo e comunicação quebra trabalho
real dele — e o custo recai sobre quem menos participou da decisão (`FH-16.09`).

---

## 5. Classificação de dívidas

| Gravidade | Critério | Prazo máximo | Consequência |
| --- | --- | --- | --- |
| **Crítica** | Viola bloqueio absoluto (`FH-62.01`) | Imediato | Bloqueia funcionalidade nova na área (`FH-66.05`) |
| **Estrutural** | Viola padrão que se propaga: modelo, navegação, componente, vocabulário | Ciclo declarado | Impede novas ocorrências; correção planejada |
| **Pontual** | Viola artigo em local isolado | Prazo declarado | Correção quando a área for tocada |

**Regra de propagação.** Enquanto a dívida existir, **nenhuma nova ocorrência do
mesmo padrão é permitida** (`FH-66.04`) — independentemente da gravidade.

---

## 6. Ciclo de depreciação (`FH-66.06`)

| Etapa | Obrigação |
| --- | --- |
| 1. Declaração | Substituto identificado e disponível |
| 2. Marcação | O padrão antigo é marcado como depreciado, com prazo |
| 3. Contenção | Nenhuma nova ocorrência é permitida |
| 4. Migração | Caminho de migração declarado para o que existe |
| 5. Comunicação | Mudança perceptível comunicada ao usuário (`FH-66.07`) |
| 6. Remoção | Retirada após o prazo, sem coexistência permanente (`FH-05.10`) |

**Nunca:** remover antes de existir substituto; manter as duas formas
indefinidamente; comunicar depois da remoção.

### `FH-66.03` — Escopo da correção

| Situação | Ação |
| --- | --- |
| A desconformidade está no código que estou alterando | Corrigir |
| Está adjacente, correção trivial e sem risco | Corrigir e declarar |
| Está fora do escopo ou exige mudança ampla | **Registrar**, não corrigir |
| É dívida crítica em qualquer lugar | Escalar imediatamente (`FH-65.04`) |

---

## 7. Anti-padrões

**Dívida invisível.** Encontrada e não registrada.

**Escopo elástico.** Entrega que cresce corrigindo tudo pelo caminho.

**Propagação por consistência.** Repetir o errado para "não destoar".

**Dívida perpétua.** Sem prazo, renovada em silêncio.

**Construção sobre crítico.** Funcionalidade nova em área com bloqueio aberto.

**Remoção abrupta.** Funcionalidade retirada sem substituto nem aviso.

**Coexistência eterna.** Padrão antigo e novo convivendo indefinidamente.

---

## 8. Impactos

**Cognitivo.** O inventário torna visível a distância entre o produto e a
Constituição — informação que, sem registro, ninguém consegue estimar.

**Emocional.** Registrar em vez de ignorar reduz a frustração de quem encontra o
problema e não pode corrigir agora.

**Produtividade.** O limite de escopo mantém entregas revisáveis; a contenção
impede que a correção futura cresça.

**Percepção de qualidade.** É o mecanismo que faz o produto convergir para a
Constituição em vez de divergir dela ao longo do tempo.

**Curva de aprendizagem.** Sem contenção, quem chega aprende o padrão errado por
imitação — e o ensina adiante.

---

## 9. Riscos e trade-offs

**Risco: inventário paralisante.** Muitas dívidas registradas podem desmotivar.
Mitigação: a classificação separa o que bloqueia do que espera.

**Risco: registro sem correção.** Registrar vira desculpa para nunca corrigir.
Mitigação: `FH-66.08` (prazo obrigatório) e `FH-66.05` (crítica bloqueia).

**Risco: depreciação lenta.** O ciclo completo demora. Trade-off assumido: o custo
da transição é menor que o custo de quebrar o trabalho do usuário.

**Trade-off central.** Trocamos velocidade de correção por previsibilidade de
entrega. Corrige-se menos por vez — e o que se corrige não introduz risco novo.

---

## 10. Critérios de verificação

1. Toda dívida está classificada por gravidade.
2. Toda desconformidade encontrada foi registrada.
3. Correções ficaram dentro do escopo, com o restante registrado.
4. Nenhum padrão não conforme foi propagado.
5. Nenhuma funcionalidade nova entrou em área com dívida crítica aberta.
6. Toda depreciação declara substituto, prazo e migração.
7. Mudanças perceptíveis foram comunicadas com transição.
8. Nenhuma dívida está sem prazo válido.
9. O Anexo F reflete o estado atual.
10. Nenhuma remoção ocorreu fora do ciclo de depreciação.

---

## 11. Checklist do capítulo

- [ ] Registrei tudo que encontrei fora do padrão.
- [ ] Classifiquei por gravidade.
- [ ] Corrigi o que estava no meu caminho; registrei o resto.
- [ ] Não repeti nenhum padrão não conforme.
- [ ] Verifiquei se há dívida crítica aberta nesta área.
- [ ] Toda dívida tem prazo.
- [ ] Depreciações têm substituto, prazo e comunicação.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 1 (`FH-01.06`), 12 (`FH-12.09`), 16 (`FH-16.09`), 28
(`FH-28.10`), 61 (achados), 62 (bloqueios), 65 (alçadas).

**É pré-requisito de.** Capítulo 67 (evolução) e Anexo F (mapa de conformidade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Inventário de dívidas | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
| Registro de decisões e exceções | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Comunicação de mudança | `CHANGELOG.md` |
| Componentes depreciados | `src/components/ui/` (estágio declarado) |
