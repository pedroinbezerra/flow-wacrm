# Capítulo 4 — Emenda, Versionamento e Memória de Decisões

| Campo | Valor |
| --- | --- |
| Livro | 0 — A Constituição |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Volume 0 (§0.6, §0.9, §0.14), Capítulos 1, 2 e 3 |
| É pré-requisito de | Capítulos 65, 66, 67, 68 |
| Artigos | `FH-04.01` a `FH-04.12` |

---

## 0. Núcleo Normativo

**`FH-04.01`** — A Constituição usa versionamento semântico `MAIOR.MENOR.CORREÇÃO`:
**MAIOR** para mudança de identidade, princípio fundamental ou estrutura;
**MENOR** para novo capítulo, novo artigo ou nova obrigação; **CORREÇÃO** para
clareza, exemplo, redação e Aterrissagem, sem alteração de obrigação.
> **Verificação:** o tipo de versão aplicado corresponde à natureza da mudança? → SIM = cumpre | NÃO = viola.

**`FH-04.02`** — Toda emenda **DEVE** conter, sem exceção: o que muda; por que
muda; qual evidência a motivou; o que passa a ser proibido; o que deixa de ser
proibido; qual o impacto sobre o produto existente. Emenda sem esses seis itens é
inválida e não entra em vigor.
> **Verificação:** os seis itens estão presentes e preenchidos? → SIM = cumpre | NÃO = viola.

**`FH-04.03`** — Toda emenda **DEVE** citar a evidência que a motivou: caso real,
métrica, resultado de pesquisa, incidente ou lacuna registrada. Emenda motivada
apenas por preferência é inválida.
> **Verificação:** a emenda cita evidência verificável? → SIM = cumpre | NÃO = viola.

**`FH-04.04`** — Artigo revogado **NUNCA** é apagado. Permanece no capítulo,
marcado `[REVOGADO em vX.Y.Z]`, com o motivo e a indicação do artigo que o
substituiu, se houver.
> **Verificação:** o texto revogado permanece legível com marcação, motivo e substituto? → SIM = cumpre | NÃO = viola.

**`FH-04.05`** — Identificador `FH-XX.NN` **NUNCA** é reutilizado, nem após
revogação. Artigo novo recebe sempre o próximo número livre do capítulo.
> **Verificação:** o identificador atribuído já existiu alguma vez neste capítulo? → NÃO = cumpre | SIM = viola.

**`FH-04.06`** — Exceção a um **DEVERIA** **DEVE** ter responsável nomeado, motivo
escrito e prazo de revisão de no máximo 90 dias. Exceção sem prazo é proibida.
Vencido o prazo sem revisão, a exceção caduca e a regra volta a valer integralmente.
> **Verificação:** a exceção tem responsável, motivo e prazo ≤ 90 dias? → SIM = cumpre | NÃO = viola.

**`FH-04.07`** — Emenda MAIOR **DEVE** ser acompanhada de análise de impacto sobre
o produto existente, listando o que passa a estar em desconformidade e gerando os
registros de dívida correspondentes (Capítulo 66).
> **Verificação:** existe análise de impacto com a lista de desconformidades criadas pela emenda? → SIM = cumpre | NÃO = viola.

**`FH-04.08`** — Emenda que altere um capítulo **DEVE** atualizar, no mesmo ciclo,
todos os artefatos vivos afetados: Anexo B, Anexo A e Anexo F (§0.14). Emenda que
os deixe desatualizados é entrega incompleta.
> **Verificação:** os artefatos vivos refletem a emenda? → SIM = cumpre | NÃO = viola.

**`FH-04.09`** — É proibido emendar para legitimar retroativamente algo já
entregue em desconformidade. Emenda decide o futuro; o passado em
desconformidade vira dívida registrada.
> **Verificação:** a emenda foi proposta após uma entrega em desconformidade e tem como efeito principal validá-la? → NÃO = cumpre | SIM = viola.

**`FH-04.10`** — A Constituição **NUNCA** contém duas verdades simultâneas. Se uma
emenda contradiz capítulo já escrito, esse capítulo **DEVE** ser corrigido no
mesmo ciclo. É proibido entregar emenda deixando contradição para depois.
> **Verificação:** após a emenda, existe algum capítulo vigente que a contradiz? → NÃO = cumpre | SIM = viola.

**`FH-04.11`** — Toda emenda **DEVE** declarar seu **efeito sobre o trabalho em
andamento**: se vale apenas para o que começar depois dela, ou se exige revisão do
que já está em execução.
> **Verificação:** a emenda declara vigência sobre trabalho em andamento? → SIM = cumpre | NÃO = viola.

**`FH-04.12`** — Nenhuma emenda pode remover ou enfraquecer os quatro desempates
transversais de `FH-03.02` — isolamento de dados, acessibilidade, reversibilidade
e compreensão. São cláusulas pétreas: só podem ser **fortalecidas**.
> **Verificação:** a emenda reduz a proteção de algum dos quatro desempates? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Uma constituição imutável é abandonada; uma constituição facilmente mutável não
governa nada. Este capítulo define o único caminho legítimo de mudança, e o
calibra: **caro o suficiente para não ser feito por impulso, barato o suficiente
para não ser evitado por preguiça**.

Ele também define a memória: por que uma regra existe, o que já foi tentado, o
que foi descartado e por quê. Sem essa memória, equipes futuras revogam regras
cujo motivo desconhecem, reintroduzem problemas já resolvidos e refazem
discussões já encerradas.

---

## 2. Perguntas que este capítulo responde

- Como mudo uma regra da qual discordo?
- Quanto custa mudar? Quem aprova?
- Como registro uma exceção pontual?
- Uma regra antiga parece sem sentido. Posso removê-la?
- Já entreguei algo fora do padrão. Posso emendar para regularizar?
- A emenda vale para o que já está em desenvolvimento?
- Existe alguma regra que não pode ser mudada nunca?
- Como sei por que uma regra existe, anos depois?

---

## 3. Definições

**Emenda** — alteração formal do texto vigente: inclusão, modificação ou
revogação de artigo, princípio ou estrutura.

**Exceção** — permissão pontual e temporária de não cumprir um **DEVERIA**, sem
alterar o texto. Nunca se aplica a **DEVE** ou **NUNCA**.

**Cláusula pétrea** — proteção que só pode ser fortalecida, nunca reduzida.
Definidas em `FH-04.12`.

**Caducidade** — perda automática de validade de uma exceção pelo decurso do
prazo, sem necessidade de ato de ninguém.

**Legitimação retroativa** — uso da emenda para validar o que já foi feito fora do
padrão. Proibida por `FH-04.09`.

**Memória de decisão** — registro permanente do raciocínio: o problema, as
alternativas consideradas, a escolha e o motivo do descarte das demais.

---

## 4. Fundamento

**Por que a emenda precisa ser possível.** Toda regra escrita é uma aposta feita
com a informação disponível no momento. Parte das apostas estará errada. Uma
constituição que trata seus artigos como verdades eternas força as pessoas a
escolherem entre obedecer ao que é evidentemente pior e desobedecer em silêncio.
Elas escolhem o silêncio — e o silêncio é o fim do documento, porque uma vez que
desobedecer sem custo se torna aceitável, tudo é negociável.

**Por que a emenda precisa custar.** Se emendar fosse tão fácil quanto discordar,
a Constituição acompanharia o humor de quem estivesse decidindo naquela semana.
O custo é calibrado em três exigências: evidência (`FH-04.03`), análise de impacto
(`FH-04.07`) e consistência total (`FH-04.10`). Nenhuma delas é burocracia: são
exatamente as três coisas que quem propõe mudança precisa ter pensado para que a
mudança seja boa.

**Por que a evidência é obrigatória.** `FH-04.03` é o filtro contra o modo de
falha mais comum em times de produto: a reescrita de padrões por preferência
estética a cada troca de liderança. Preferência não é evidência. Um caso real de
usuário que se perdeu, uma métrica que caiu, um incidente, uma lacuna que
apareceu três vezes — isso é evidência. A exigência não impede mudança; impede
mudança sem aprendizado.

**Por que o revogado permanece.** `FH-04.04` transforma a Constituição em memória
institucional, e essa é uma de suas funções mais valiosas a longo prazo. Sem o
histórico, uma equipe futura removerá uma regra "estranha" sem saber que ela
existe porque, em 2027, sua ausência causou um incidente. O texto revogado custa
espaço; sua ausência custa a repetição do erro original.

**Por que a legitimação retroativa é proibida.** `FH-04.09` protege contra a forma
mais sedutora de corrupção normativa. Alguém entrega fora do padrão — por pressa,
por desconhecimento, por discordância. Refazer custa caro. Surge a proposta:
"talvez a regra devesse ser assim mesmo". Se aceita, a Constituição passa a ser
determinada pelo que já foi construído, e não o contrário. A regra inverte o
incentivo: violar não abre caminho para mudar a regra; violar gera dívida
registrada. Quem quiser mudar a regra pode — antes de construir, não depois.

**Por que existem cláusulas pétreas.** Os quatro desempates de `FH-03.02`
protegem valores cuja violação é irreversível. Pressão de curto prazo é
justamente a condição na qual valores de longo prazo são sacrificados. `FH-04.12`
remove essa possibilidade da mesa — não porque futuras equipes serão menos
sábias, mas porque nenhuma equipe, por mais sábia, decide bem sob pressão sobre
algo que não poderá desfazer.

---

## 5. Princípios

**Mudança é normal; mudança silenciosa é fatal.**

**Toda regra deve poder explicar por que existe** — anos depois, para quem não
estava lá.

**O passado gera dívida, nunca licença.**

**O que protege contra dano irreversível não se negocia sob pressão.**

---

## 6. Regras normativas — o rito da emenda

O rito tem cinco etapas obrigatórias e nesta ordem:

**1. Registro da motivação.** Descrever o caso real, com evidência (`FH-04.03`).
Sem esta etapa, a proposta não avança.

**2. Análise do existente.** Ler o capítulo inteiro, incluindo seções 7 (anti-
padrões) e 9 (riscos). Muitas propostas de emenda são resolvidas aqui: o
trade-off já havia sido considerado e descartado, com motivo escrito.

**3. Redação da emenda.** Texto novo com os seis itens de `FH-04.02`, artigos com
verificação binária (§0.10) e classificação de versão (`FH-04.01`).

**4. Análise de impacto.** Obrigatória em MAIOR (`FH-04.07`), recomendada em
MENOR. Lista o que passa a estar em desconformidade e gera as dívidas.

**5. Aplicação em cadeia.** Correção de todos os capítulos contraditórios
(`FH-04.10`) e atualização dos artefatos vivos (`FH-04.08`), no mesmo ciclo.

**Quando NÃO usar o rito de emenda.** Quatro situações são frequentemente
confundidas com emenda e não são:

- **Correção de Aterrissagem** — caminho de arquivo mudou. É versão de CORREÇÃO,
  sem rito.
- **Erro de redação sem efeito normativo** — CORREÇÃO, sem rito.
- **Caso não previsto** — não é emenda, é fallback (§0.11) seguido de registro de
  lacuna. A emenda pode vir depois, se o caso se repetir.
- **Discordância pontual em uma entrega** — não é emenda, é exceção (`FH-04.06`)
  ou é cumprimento. Emendar a Constituição para resolver uma entrega é sinal de
  que a emenda é retroativa (`FH-04.09`).

**Certo.** "Nas últimas três entregas, `FH-45.04` gerou confirmação em ação
reversível de baixo impacto e os usuários passaram a confirmar sem ler. Evidência:
três casos registrados no Anexo E. Proposta: restringir o escopo do artigo. Versão:
MENOR. Impacto: quatro telas atuais passam a estar em desconformidade — dívidas
registradas."

**Errado.** "Este artigo atrapalhou minha entrega desta semana, então proponho
removê-lo." Sem evidência acumulada e com efeito retroativo: viola `FH-04.03` e
`FH-04.09`.

---

## 7. Anti-padrões

**Emenda de conveniência.** Proposta para desbloquear uma entrega específica.
Sintoma: a emenda beneficia exatamente quem a propõe, exatamente agora.

**Revogação por desconhecimento.** Remover regra cujo motivo não se entende.
Correção: `FH-04.04` mantém o motivo legível. Se o motivo não estiver escrito, o
defeito está no registro, e a regra não deve ser removida antes de investigado.

**Exceção perpétua.** Exceção renovada indefinidamente. Mitigado pela caducidade
automática de `FH-04.06`: a exceção morre sozinha, e quem quiser mantê-la precisa
propor emenda.

**Emenda parcial.** Alterar um capítulo e deixar outro contradizendo. Viola
`FH-04.10` e produz o pior estado possível: duas regras vigentes e opostas, cada
uma citável por um lado da discussão.

**Deriva por acúmulo de CORREÇÃO.** Sucessivas "melhorias de redação" que alteram
obrigação sem passar pelo rito. Verificação: se o conjunto de comportamentos
permitidos mudou, não era CORREÇÃO.

---

## 8. Impactos

**Cognitivo.** Reduz a carga de "posso mudar isto?", que é uma das dúvidas mais
paralisantes em times de produto. O caminho está escrito, e saber que existe
caminho legítimo reduz a tentação do atalho.

**Emocional.** Diminui o ressentimento com regras herdadas. Discordar deixa de
ser frustração privada e passa a ser proposta com rito. Isso protege
especialmente quem chegou depois: a pessoa nova não precisa aceitar tudo em
silêncio nem violar em silêncio.

**Produtividade.** Custo local (o rito custa horas), ganho global (evita
retrabalho em cascata e rediscussão perpétua). A caducidade automática de
exceções elimina o trabalho de auditar exceções antigas — elas morrem sozinhas.

**Percepção de qualidade.** Indireto. Emendas com análise de impacto evitam
mudanças de padrão que deixam o produto meio antigo e meio novo por meses — o
estado que o usuário percebe como desleixo, mesmo sem saber nomear.

**Curva de aprendizagem.** O rito é o processo mais complexo da Constituição.
Mitigado pelo fato de ser raro: a maioria das pessoas nunca proporá emenda. Quem
propõe está, por definição, profundamente engajado com o documento.

---

## 9. Riscos e trade-offs

**Risco: rigidez excessiva.** O rito pode desencorajar melhorias legítimas.
Mitigação: correções de Aterrissagem e de redação ficam fora do rito, e a maior
parte das dúvidas se resolve por fallback, sem emenda.

**Risco: acúmulo de texto revogado.** Capítulos ficam longos com o histórico.
Mitigação: revogados vão para o fim do capítulo, fora do Núcleo Normativo, sem
custo de leitura para quem só quer cumprir.

**Risco: cláusulas pétreas erradas.** Se um dos quatro desempates estiver mal
calibrado, ele é permanente. É um risco assumido conscientemente. A escolha
recai sobre quatro valores cuja violação é irreversível — e entre errar por
proteger demais o usuário e errar por proteger de menos, escolhemos o primeiro.

**Trade-off central.** Trocamos agilidade normativa por estabilidade de
identidade. O FlowHub evoluirá mais devagar em suas regras do que evoluiria sob
decisão livre. Em troca, ele continuará reconhecível daqui a dez anos — que é
exatamente o objetivo declarado deste documento.

---

## 10. Critérios de verificação

1. Toda emenda vigente contém os seis itens de `FH-04.02`.
2. Toda emenda cita evidência verificável.
3. Nenhum identificador foi reutilizado.
4. Todo artigo revogado permanece legível, com motivo e substituto.
5. Nenhuma exceção vigente está sem prazo ou com prazo vencido.
6. Nenhum capítulo vigente contradiz outro.
7. Os artefatos vivos refletem todas as emendas aplicadas.
8. Nenhuma emenda vigente teve como efeito principal validar entrega anterior.

---

## 11. Checklist do capítulo

- [ ] Li o capítulo inteiro, incluindo riscos e anti-padrões, antes de propor.
- [ ] Tenho evidência, não preferência.
- [ ] Classifiquei corretamente MAIOR / MENOR / CORREÇÃO.
- [ ] Escrevi os seis itens obrigatórios.
- [ ] Fiz a análise de impacto e registrei as dívidas criadas.
- [ ] Corrigi todos os capítulos que a emenda contradiz.
- [ ] Atualizei Anexo B, Anexo A e Anexo F.
- [ ] Declarei o efeito sobre o trabalho em andamento.
- [ ] Confirmei que não estou enfraquecendo cláusula pétrea.
- [ ] Confirmei que não estou legitimando algo já entregue.

---

## 12. Referências cruzadas

**Depende de.** Volume 0 (§0.6, §0.9, §0.14); Capítulos 1, 2 e 3 (as cláusulas
pétreas derivam de `FH-03.02`).

**É pré-requisito de.** Capítulo 65 (governança), 66 (dívida), 67 (evolução), 68
(agentes: um agente pode propor emenda, nunca aplicá-la sozinho).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Histórico de emendas do Volume 0 | `docs/constituicao/00-INDICE-E-ARQUITETURA.md`, seção final |
| Histórico de emendas de capítulo | Seção final do próprio arquivo do capítulo |
| Exceções vigentes e prazos | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Dívidas geradas por emenda | `docs/constituicao/ANEXO-F-mapa-de-conformidade.md` |
| Versionamento e autoria | Histórico do repositório Git |
