# Capítulo 61 — Heurísticas do FlowHub

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Todos os livros anteriores |
| É pré-requisito de | Capítulos 62, 63, 65, 66 |
| Artigos | `FH-61.01` a `FH-61.10` |

---

## 0. Núcleo Normativo

**`FH-61.01`** — As **dez heurísticas** (§5) são o instrumento padrão de avaliação
rápida de qualquer tela ou fluxo.
> **Verificação:** a avaliação percorreu as dez heurísticas? → SIM = cumpre | NÃO = viola.

**`FH-61.02`** — Toda avaliação **DEVE** declarar a heurística violada **e** o artigo
correspondente (`FH-02.07`).
> **Verificação:** cada achado cita heurística e artigo? → SIM = cumpre | NÃO = viola.

**`FH-61.03`** — Heurística **NUNCA** substitui artigo. A ordem é: artigo aplicável
primeiro; heurística quando não houver artigo direto.
> **Verificação:** existindo artigo aplicável, ele foi citado? → SIM = cumpre | NÃO = viola.

**`FH-61.04`** — Todo achado **DEVE** ser classificado em: **bloqueio**, **correção
obrigatória** ou **melhoria** (§6).
> **Verificação:** o achado está classificado? → SIM = cumpre | NÃO = viola.

**`FH-61.05`** — Achado sem **evidência observável** não é válido. Impressão sem
sinal verificável é sugestão, não bloqueio.
> **Verificação:** o achado descreve um sinal observável? → SIM = cumpre | NÃO = viola.

**`FH-61.06`** — Nenhuma heurística nova entra sem emenda a este capítulo.
> **Verificação:** a heurística usada pertence às dez? → SIM = cumpre | NÃO = viola.

**`FH-61.07`** — A avaliação é feita sobre **tarefa real completa**, nunca sobre
tela isolada.
> **Verificação:** a avaliação percorreu uma tarefa do início ao fim? → SIM = cumpre | NÃO = viola.

**`FH-61.08`** — A avaliação **DEVE** incluir os **estados adversos**: erro, vazio,
sem permissão, rede degradada, volume alto (`FH-14.10`, `FH-41.02`).
> **Verificação:** os estados adversos foram avaliados? → SIM = cumpre | NÃO = viola.

**`FH-61.09`** — Todo achado não corrigido na mesma entrega **DEVE** virar dívida
registrada com prazo (`FH-66`).
> **Verificação:** achados não corrigidos viraram dívida com prazo? → SIM = cumpre | NÃO = viola.

**`FH-61.10`** — Autoavaliação é obrigatória **antes** de submeter a revisão de
terceiros.
> **Verificação:** houve autoavaliação registrada antes da revisão? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo fornece o **conjunto de testes rápidos** para avaliar qualquer tela ou
fluxo em minutos. Ele existe porque a Constituição inteira é grande demais para ser
percorrida a cada revisão — as heurísticas são a porta de entrada que aponta para
os artigos.

---

## 2. Perguntas que este capítulo responde

- Como avalio algo rapidamente?
- Que perguntas sempre faço?
- Como transformo uma impressão ruim em diagnóstico objetivo?
- O que bloqueia e o que é melhoria?

---

## 3. Definições

**Heurística** — pergunta curta que revela violação provável.

**Sinal observável** — evidência concreta de violação, verificável por qualquer
pessoa.

**Achado** — resultado de uma avaliação: heurística + artigo + evidência +
gravidade.

**Autoavaliação** — aplicação das heurísticas pelo próprio autor antes da revisão.

---

## 4. Fundamento

**Por que heurísticas existem se há 600 artigos.** Artigos respondem "isto está
certo?"; heurísticas respondem "onde devo olhar?". Sem elas, a revisão depende de
alguém lembrar quais dos artigos se aplicam — e a memória falha justamente nos
capítulos menos usados. As dez perguntas cobrem as classes de violação mais
frequentes e apontam para os artigos corretos.

**Por que cada achado cita heurística e artigo.** A heurística torna o achado
comunicável; o artigo o torna vinculante. Um achado só com heurística vira
discussão de opinião; um achado só com artigo perde a explicação de por que ele
importa.

**Por que evidência observável é obrigatória.** "Está confuso" não é acionável e não
é verificável. "Três dos quatro testes hesitaram antes de clicar em X" é ambas as
coisas. `FH-61.05` transforma impressão em diagnóstico — e protege quem constrói de
objeções por gosto (`FH-02.07`).

**Por que avaliar tarefa, não tela.** Telas isoladas quase sempre parecem
corretas; os defeitos aparecem nas transições — contexto perdido, estado
descartado, filtro reiniciado. A maior parte das violações de `FH-10.05`,
`FH-23.05` e `FH-14.01` é invisível em avaliação estática.

**Por que estados adversos são obrigatórios.** É onde vivem os defeitos que chegam
ao usuário. Avaliar só o caminho feliz reproduz exatamente o viés que produziu o
problema (`FH-41.02`).

**Por que autoavaliação antes.** Ela desloca a correção para o momento mais barato e
transforma a revisão de terceiro em verificação, não em descoberta. Também reduz o
custo emocional: o autor encontra os próprios achados antes de alguém apontá-los.

---

## 5. As dez heurísticas

| # | Heurística | Pergunta | Sinal de violação | Artigos |
| --- | --- | --- | --- | --- |
| **H1** | Orientação | Sei onde estou, como as coisas estão e o que acabou de acontecer? | O usuário procura confirmação em outro lugar | `FH-24.01`, `FH-41`, `FH-43` |
| **H2** | Reversibilidade | Consigo voltar do que fiz? | Hesitação antes de ações comuns | `FH-45`, `FH-10.02` |
| **H3** | Esforço | O sistema pediu algo que já sabe, ou exigiu passos vazios? | Campos preenchíveis por dedução; passos que só confirmam | `FH-06.02`, `FH-07.04` |
| **H4** | Coerência | Isto se parece e se comporta como o resto do produto? | Duas telas resolvendo o mesmo problema de formas diferentes | `FH-05.02`, `FH-07.06` |
| **H5** | Carga | Quantas decisões e blocos esta tela exige? | Usuário relê a tela antes de agir | `FH-08.02`, `FH-15.01` |
| **H6** | Adversidade | O que acontece quando falha, está vazio ou não há permissão? | Tela em branco, erro sem saída, estado indefinido | `FH-41`, `FH-42`, `FH-44` |
| **H7** | Acesso | Consigo fazer tudo sem ponteiro, com foco visível? | Foco invisível, armadilha de foco, ação só por mouse | `FH-38`, `FH-48` |
| **H8** | Silêncio | O sistema interrompeu sem consequência concreta? | Usuário fecha mensagens sem ler | `FH-07.07`, `FH-40.02` |
| **H9** | Honestidade | O que está exibido é verdade — inclusive parcialidade e defasagem? | Usuário confere em outro lugar o que o sistema já mostrou | `FH-07.10`, `FH-41.11`, `FH-56` |
| **H10** | Descoberta | Alguém que nunca viu isto consegue começar? | Necessidade de explicação verbal para usar | `FH-16.08`, `FH-26.05` |

**Como aplicar.** Percorra uma tarefa real do início ao fim, incluindo estados
adversos, e faça as dez perguntas. Cada resposta negativa vira achado com
evidência, artigo e gravidade.

---

## 6. Classificação de gravidade (`FH-61.04`)

| Gravidade | Critério | Consequência |
| --- | --- | --- |
| **Bloqueio** | Viola bloqueio absoluto (`FH-62.01`): acessibilidade, perda de dado, tenancy, estado não tratado, ação destrutiva sem saída | Impede a entrega; **nunca** vira dívida |
| **Correção obrigatória** | Viola **DEVE**/**NUNCA** sem ser bloqueio absoluto | Corrigir na entrega ou registrar dívida com prazo |
| **Melhoria** | Viola **DEVERIA** ou é oportunidade sem artigo | Sugestão; não bloqueia (`FH-02.07`) |

---

## 7. Anti-padrões

**Revisão por gosto.** Objeção sem heurística nem artigo.

**Avaliação estática.** Julgar telas isoladas, fora de tarefa.

**Caminho feliz.** Avaliar sem estados adversos.

**Achado vago.** "Está confuso", sem sinal observável.

**Heurística improvisada.** Critério inventado na hora.

**Achado órfão.** Encontrado, não corrigido, não registrado.

**Revisão como descoberta.** Autor submetendo sem autoavaliar.

---

## 8. Impactos

**Cognitivo.** Dez perguntas cabem na memória; seiscentos artigos não. A heurística
é o índice mental da Constituição.

**Emocional.** Achados fundamentados despersonalizam a crítica — a discussão deixa
de ser sobre competência e passa a ser sobre conformidade.

**Produtividade.** Avaliação em minutos, no momento em que a correção é barata.

**Percepção de qualidade.** As dez heurísticas cobrem exatamente os sinais que
usuários interpretam como "produto bem feito".

**Curva de aprendizagem.** Para quem chega, as heurísticas ensinam a Constituição de
trás para frente: primeiro o sintoma, depois a regra.

---

## 9. Riscos e trade-offs

**Risco: heurística como teto.** Avaliar só as dez e ignorar o resto. Mitigação:
`FH-61.03` — artigo vem primeiro; a heurística é porta de entrada, não limite.

**Risco: excesso de achados.** Avaliações longas travam entregas. Mitigação: a
classificação de gravidade separa o que bloqueia do que registra.

**Risco: autoavaliação superficial.** O autor não vê os próprios defeitos.
Mitigação: `FH-61.10` não substitui a revisão de terceiro; antecipa-a.

**Trade-off central.** Trocamos profundidade por velocidade de diagnóstico. As
heurísticas não encontram tudo — encontram, em minutos, a maior parte do que
importa.

---

## 10. Critérios de verificação

1. Toda avaliação percorreu as dez heurísticas.
2. Todo achado cita heurística e artigo.
3. Existindo artigo aplicável, ele foi citado.
4. Todo achado está classificado por gravidade.
5. Todo achado descreve sinal observável.
6. Nenhuma heurística fora das dez foi usada.
7. A avaliação percorreu tarefa completa.
8. Os estados adversos foram avaliados.
9. Achados não corrigidos viraram dívida com prazo.
10. Houve autoavaliação antes da revisão.

---

## 11. Checklist do capítulo

- [ ] Percorri uma tarefa real do início ao fim.
- [ ] Testei erro, vazio, sem permissão, rede ruim e volume alto.
- [ ] Fiz as dez perguntas.
- [ ] Cada achado tem evidência observável.
- [ ] Cada achado cita artigo e gravidade.
- [ ] O que não corrigi virou dívida com prazo.

---

## 12. Referências cruzadas

**Depende de.** Todos os livros anteriores; especialmente 2 (`FH-02.07`), 41, 42,
44, 45, 38, 48.

**É pré-requisito de.** Capítulos 62 (qualidade), 63 (checklists), 65
(governança), 66 (dívida).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Consulta de artigos | `docs/constituicao/ANEXO-B-indice-de-artigos.md` |
| Registro de achados e dívidas | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Inventário de conformidade | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
| Verificações automatizadas | `pnpm lint`, `pnpm typecheck`, `pnpm test` |
