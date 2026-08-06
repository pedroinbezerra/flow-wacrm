# Capítulo 17 — Design Emocional

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 10, 11, 15 |
| É pré-requisito de | Capítulos 26, 39, 42, 43, 44, 57 |
| Artigos | `FH-17.01` a `FH-17.10` |

---

## 0. Núcleo Normativo

**`FH-17.01`** — Os estados afetivos-alvo do FlowHub são quatro: **confiança
calma**, **competência percebida**, **alívio** e **orgulho discreto**. Toda decisão
de experiência **DEVE** mover em direção a pelo menos um deles.
> **Verificação:** é possível nomear qual estado afetivo-alvo esta decisão serve? → SIM = cumpre | NÃO = viola.

**`FH-17.02`** — É proibido induzir deliberadamente **culpa, ansiedade, urgência
artificial, inferioridade ou medo de perder** para obter qualquer comportamento do
usuário.
> **Verificação:** esta solução depende de emoção negativa induzida para funcionar? → NÃO = cumpre | SIM = viola.

**`FH-17.03`** — **Regra do momento difícil.** Quando algo dá errado, o sistema
**resolve**; não conforta, não se explica longamente e não pede desculpas
(`FH-09.02`, `FH-09.07`).
> **Verificação:** a resposta ao problema prioriza a solução sobre a expressão? → SIM = cumpre | NÃO = viola.

**`FH-17.04`** — Nenhuma mensagem **PODE** atribuir culpa ao usuário, nem por
redação, nem por tom, nem por implicação. Erro é falha do sistema em prevenir
(`FH-44`).
> **Verificação:** a mensagem atribui ao usuário a responsabilidade pelo problema? → NÃO = cumpre | SIM = viola.

**`FH-17.05`** — Inconsistência visual ou comportamental em ponto crítico —
confirmação, envio, cobrança, exclusão — é **defeito**, não questão estética,
porque reduz a confiança exatamente onde ela é necessária.
> **Verificação:** este ponto crítico segue exatamente os padrões do produto? → SIM = cumpre | NÃO = viola.

**`FH-17.06`** — Reconhecimento é **raro e proporcional**. Celebrar o comum destrói
a escala e infantiliza (`FH-09.04`).
> **Verificação:** este reconhecimento é raro o bastante para significar algo? → SIM = cumpre | NÃO = viola.

**`FH-17.07`** — O produto **NUNCA** usa mecânicas de engajamento que criem
dependência ou compulsão: sequências de dias, contadores de presença, pressão por
retorno, recompensa por frequência de acesso.
> **Verificação:** existe mecânica que incentive uso pelo uso, em vez de por trabalho? → NÃO = cumpre | SIM = viola.

**`FH-17.08`** — Espera, lentidão e falha **NUNCA** são apresentadas como
consequência de algo que o usuário fez. O sistema assume o que é seu.
> **Verificação:** o texto atribui a espera ou a falha a uma ação do usuário? → NÃO = cumpre | SIM = viola.

**`FH-17.09`** — Toda tela de decisão crítica **DEVE** reduzir incerteza antes da
ação: o que vai acontecer, sobre o que, e o que é possível depois.
> **Verificação:** antes de confirmar, o usuário sabe o efeito, o alcance e a reversibilidade? → SIM = cumpre | NÃO = viola.

**`FH-17.10`** — Nenhuma decisão de produto **PODE** usar emoção negativa como
motor de conversão, adoção ou retenção.
> **Verificação:** a adoção desta funcionalidade depende de desconforto induzido? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **o que o usuário deve sentir** e converte isso em decisões
concretas. Emoção não é decoração de produto: ela determina se a pessoa confia,
delega, explora e retorna. Sem regras, o design emocional vira intuição — e
intuição, sob pressão de métrica, escorrega para manipulação.

---

## 2. Perguntas que este capítulo responde

- Como o produto transmite competência?
- Como se comemora sem infantilizar?
- Como acolher um erro sem humilhar?
- O que fazer no pior momento do usuário?
- Podemos usar urgência para aumentar adoção?
- Sequências de uso e recompensas por frequência são aceitáveis?

---

## 3. Definições

**Estado afetivo-alvo** — sensação que o produto busca produzir de forma
sustentada. São quatro (`FH-17.01`).

**Confiança calma** — ausência de vigilância: o usuário não sente necessidade de
conferir o sistema.

**Competência percebida** — sensação de estar dominando o próprio trabalho, e não a
ferramenta.

**Alívio** — sensação produzida quando o sistema absorve algo que o usuário
esperava ter de fazer.

**Orgulho discreto** — reconhecimento silencioso de um resultado real.

**Emoção induzida** — sentimento provocado deliberadamente pelo desenho para obter
comportamento.

---

## 4. Fundamento

**Por que estes quatro estados.** Eles foram escolhidos por serem **sustentáveis**.
Emoções intensas — entusiasmo, euforia, surpresa — não sobrevivem à repetição: o
que encanta na primeira vez irrita na quinquagésima. Uma ferramenta usada oito
horas por dia precisa de estados afetivos que melhorem com a familiaridade, e não
que se desgastem. Confiança e competência crescem com o uso; alívio e orgulho
aparecem em momentos certos e raros.

**Por que emoções negativas são proibidas mesmo funcionando.** Culpa, ansiedade e
urgência artificial produzem resultados mensuráveis e imediatos — é por isso que
são tão comuns. O custo aparece depois e em outro lugar: o usuário associa o
desconforto ao produto, não à decisão que tomou sob desconforto. Com o tempo, usar
o sistema passa a ser experiência levemente aversiva, e ninguém consegue apontar a
causa. `FH-17.02` e `FH-17.10` bloqueiam a porta de entrada, porque essas mecânicas
sempre entram justificadas por um número que subiu.

**Por que o momento difícil define a relação.** As pessoas lembram
desproporcionalmente dos momentos ruins e dos finais. Um sistema que se comporta
bem em condição normal e mal em condição adversa será lembrado pela condição
adversa. Isso torna o tratamento de erro, falha e limite o investimento emocional
de maior retorno do produto inteiro — e é justamente onde a maioria dos produtos
investe menos.

**Por que culpa é proibida.** Quando uma interface diz que o usuário fez algo
errado, ela transfere para ele a responsabilidade por uma falha de prevenção do
sistema. Além de injusto, é ineficaz: uma pessoa que se sente culpada evita a
área onde errou, o que reduz o uso do produto e não reduz o erro.

**Por que consistência é emoção, não estética.** Inconsistência em ponto crítico
gera hesitação — e hesitação, num momento de decisão irreversível, é lida como
risco. O usuário não pensa "esta tela está diferente"; ele pensa "será que estou
fazendo certo?". `FH-17.05` classifica isso como defeito para retirá-lo do
território das preferências visuais.

**Por que mecânicas de engajamento são proibidas.** Elas funcionam otimizando o uso
**pelo uso**, e não pelo trabalho realizado. Num produto de trabalho, isso é
contraditório com toda a tese: o FlowHub existe para reduzir esforço, e um usuário
que abre o sistema por compulsão está gastando tempo que deveria ter economizado.
`FH-17.07` alinha o design emocional com `FH-06.01` e com as anti-métricas do
Capítulo 64.

**Por que reduzir incerteza é o principal ato emocional.** A maior parte da
ansiedade em software vem de não saber o que vai acontecer. `FH-17.09` ataca a
causa diretamente: dizer o efeito, o alcance e a reversibilidade **antes** da ação
elimina a maior fonte de desconforto do produto, e o faz com texto, não com
tranquilização.

---

## 5. Princípios

**Emoção sustentável vence emoção intensa.**

**O pior momento define a relação.**

**Culpa nunca é ferramenta.**

**Reduzir incerteza é o ato emocional mais eficaz que existe.**

---

## 6. Regras normativas

### `FH-17.01` — Estados-alvo

**Quando aplicar.** Em toda decisão de experiência.

**Quando NÃO aplicar.** Não substitui as regras específicas de linguagem
(Capítulo 57) e movimento (Capítulo 39) — orienta o que elas não cobrirem.

### `FH-17.02` — Emoções proibidas

**Quando aplicar.** Em textos, prazos, avisos de limite, comunicação de plano e
qualquer chamada à ação.

**Quando NÃO aplicar.** Informar consequência real não é induzir medo. A distinção
é factual: comunicar que um limite será atingido é informação; adicionar contagem
regressiva a uma decisão que não tem prazo real é manipulação.

**Certo.** "Seu plano cobre até X envios este mês. Você usou Y."

**Errado.** "Restam apenas 2 dias! Não perca seus dados!" — quando não há risco
real nesse prazo.

### `FH-17.03` — Momento difícil

**Certo.** Falha: o que aconteceu, o que foi preservado, o que fazer agora. Três
linhas, sem adjetivos.

**Errado.** Ilustração, título criativo e parágrafo de empatia antes da informação
que resolve.

### `FH-17.04` — Sem culpa

**Certo.** "Este número não pode receber mensagens de modelo. Escolha outro canal."

**Errado.** "Você preencheu o campo incorretamente."

### `FH-17.07` — Sem mecânicas de engajamento

**Quando NÃO aplicar.** Não proíbe informar pendências reais de trabalho — uma
conversa esperando resposta é trabalho, não gamificação. A distinção: informar
**o que existe** é legítimo; recompensar **o ato de voltar** não é.

### `FH-17.09` — Redução de incerteza

**Quando aplicar.** Em toda ação de efeito externo, irreversível ou de alcance
amplo.

**Certo.** "Enviar para 312 contatos. 4 sem telefone válido serão ignorados. Não é
possível cancelar após o início."

**Errado.** "Confirmar envio?" — não diz alcance, exceções nem reversibilidade.

---

## 7. Anti-padrões

**Empatia decorativa.** Texto emocional antes da informação útil.

**Urgência fabricada.** Prazo que não existe fora da interface.

**Culpa por validação.** Mensagens que responsabilizam o usuário pelo erro.

**Festa constante.** Celebração de tudo, até nada significar nada.

**Compulsão de retorno.** Sequências, contadores e recompensas por frequência.

**Confirmação vazia.** "Tem certeza?" sem dizer o que vai acontecer.

**Inconsistência no momento crítico.** Padrão próprio justamente na tela de maior
risco.

---

## 8. Impactos

**Cognitivo.** Reduzir incerteza reduz carga: parte significativa do esforço mental
em software é gasto tentando prever o que o sistema fará.

**Emocional.** É o objeto do capítulo. O efeito mais importante é `FH-17.03`: o
comportamento do sistema no pior momento é o que fica.

**Produtividade.** Emoção negativa consome atenção. Um usuário ansioso confere mais,
delega menos e trabalha mais devagar — mesmo com a mesma interface.

**Percepção de qualidade.** Confiança calma é o que o usuário chama de "sistema
sólido". Não tem manifestação visual própria; é resultado de ausência de sustos.

**Curva de aprendizagem.** Ausência de culpa é pré-requisito para aprendizado por
exploração. Sistemas que constrangem o erro produzem usuários que evitam áreas
inteiras do produto — e nunca as aprendem.

---

## 9. Riscos e trade-offs

**Risco: frieza.** Proibir expressão emocional pode produzir um produto sem calor.
Mitigação: o calor no FlowHub se expressa em utilidade — antecipar, preservar,
resolver. É calor demonstrado, não declarado.

**Risco: perda de conversão.** Sem urgência e sem culpa, alguns números caem.
Trade-off assumido e explícito: são números emprestados do futuro (`FH-11`).

**Risco: subestimar o valor do reconhecimento.** A raridade exigida pode levar a
nunca reconhecer nada. Mitigação: `FH-17.06` exige proporcionalidade, não ausência —
conquistas reais são reconhecidas.

**Trade-off central.** Trocamos intensidade emocional por sustentabilidade
emocional. O produto encanta menos na primeira semana e desgasta menos no terceiro
ano.

---

## 10. Critérios de verificação

1. Toda decisão de experiência nomeia o estado afetivo-alvo que serve.
2. Nenhuma solução depende de emoção negativa induzida.
3. Toda resposta a problema prioriza solução sobre expressão.
4. Nenhuma mensagem atribui culpa ao usuário.
5. Pontos críticos seguem exatamente os padrões do produto.
6. Reconhecimentos são raros e proporcionais.
7. Nenhuma mecânica incentiva uso pelo uso.
8. Espera e falha nunca são atribuídas ao usuário.
9. Toda decisão crítica declara efeito, alcance e reversibilidade antes.

---

## 11. Checklist do capítulo

- [ ] Sei qual estado afetivo-alvo esta decisão serve.
- [ ] Não estou usando urgência, culpa ou medo para obter comportamento.
- [ ] No erro, resolvo antes de me expressar.
- [ ] Nenhuma mensagem culpa o usuário.
- [ ] O ponto crítico segue o padrão do produto, sem exceção visual.
- [ ] O reconhecimento é raro o suficiente para significar algo.
- [ ] Não criei mecânica de retorno compulsivo.
- [ ] Antes de confirmar, o usuário sabe efeito, alcance e reversibilidade.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (personalidade), 10 (promessas), 11 (ética), 15
(cognição).

**É pré-requisito de.** Capítulos 26 (onboarding), 39 (movimento), 42 (estados
vazios), 43 (feedback), 44 (erros), 45 (confirmações), 57 (voz), 64 (métricas e
anti-métricas).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Mensagens de erro e falha | `errors` em `src/i18n/messages/pt-BR.json`, `src/components/themed-toaster.tsx` |
| Pontos críticos | Confirmações em `src/components/ui/dialog.tsx`; envio em `src/components/broadcasts/` |
| Limites e consumo | `src/lib/consumption/`, `src/lib/plans/`, `src/components/consumption/` |
| Primeiro uso e reconhecimento | `src/lib/onboarding/`, `src/app/(dashboard)/welcome/` |
