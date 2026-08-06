# Capítulo 18 — Confiança, Controle e Reversibilidade

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P2, P4, P7), 10, 11, 17 |
| É pré-requisito de | Capítulos 44, 45, 49, 52, 53, 54, 55 |
| Artigos | `FH-18.01` a `FH-18.11` |

---

## 0. Núcleo Normativo

**`FH-18.01`** — **Escala de autonomia.** Toda ação executada pelo sistema em nome
do usuário pertence a exatamente um de cinco níveis: **(1) informar, (2) sugerir,
(3) agir com desfazer, (4) agir com confirmação, (5) nunca agir**.
> **Verificação:** é possível classificar esta ação em um dos cinco níveis? → SIM = cumpre | NÃO = viola.

**`FH-18.02`** — **Menor autonomia suficiente.** O sistema **DEVE** operar no menor
nível que resolve o problema. Subir de nível exige justificativa registrada.
> **Verificação:** um nível inferior resolveria o mesmo problema? → NÃO = cumpre | SIM = viola.

**`FH-18.03`** — **Rastro obrigatório.** Tudo que o sistema executou em nome do
usuário **DEVE** ser consultável: o que foi feito, quando, por qual regra e sobre o
quê.
> **Verificação:** é possível consultar o que o sistema fez em nome do usuário? → SIM = cumpre | NÃO = viola.

**`FH-18.04`** — Reversibilidade é o **padrão**. Irreversibilidade é exceção que
exige confirmação explícita e declaração prévia de consequência (`FH-17.09`).
> **Verificação:** esta ação é reversível ou teve consequência declarada e confirmada? → SIM = cumpre | NÃO = viola.

**`FH-18.05`** — Todo automatismo que aja em nome do usuário **DEVE** poder ser
desligado por ele, sem perda do trabalho já realizado e sem sair do fluxo.
> **Verificação:** existe caminho para desligar este automatismo? → SIM = cumpre | NÃO = viola.

**`FH-18.06`** — **Previsibilidade antes de poder.** Nenhuma capacidade automática
entra em operação sem que o usuário possa prever seu efeito **antes** de ativá-la.
> **Verificação:** o usuário consegue prever o efeito antes de ativar? → SIM = cumpre | NÃO = viola.

**`FH-18.07`** — O sistema **NUNCA** esconde que agiu. Ação automática produz
registro visível, ainda que discreto, no contexto em que ocorreu.
> **Verificação:** a ação automática é perceptível no contexto onde ocorreu? → SIM = cumpre | NÃO = viola.

**`FH-18.08`** — Automatismos de nível 3 ou superior entram **desligados** por
padrão, salvo quando forem internos, reversíveis e sem efeito sobre terceiros.
> **Verificação:** este automatismo tem efeito externo ou irreversível? Se SIM, entra desligado? → SIM = cumpre | NÃO = viola.

**`FH-18.09`** — Toda funcionalidade **DEVE** declarar seu nível de autonomia como
atributo explícito, verificável em revisão.
> **Verificação:** o nível de autonomia está declarado? → SIM = cumpre | NÃO = viola.

**`FH-18.10`** — **Recuperação de confiança.** Após falha do sistema em ação
automática, é obrigatório: informar o ocorrido a quem foi afetado, corrigir e
declarar o que mudou para não repetir.
> **Verificação:** houve informação, correção e declaração de mudança? → SIM = cumpre | NÃO = viola.

**`FH-18.11`** — O sistema **NUNCA** aumenta o próprio nível de autonomia com base
em acertos anteriores. Confiança acumulada do sistema **não** é fundamento para
agir mais.
> **Verificação:** o nível de autonomia aumentou automaticamente por histórico de acerto? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo regula a variável que mais determina se um usuário confia em um
sistema que age sozinho: **a sensação de estar no controle**. Ele estabelece
quanto o sistema pode fazer sem perguntar, como o usuário fica sabendo, e como
volta atrás.

---

## 2. Perguntas que este capítulo responde

- Quando o sistema pode agir sem perguntar?
- Como o usuário desfaz?
- O que precisa de confirmação?
- Como mostro o que o sistema fez em meu nome?
- Automação nova entra ligada ou desligada?
- Se o sistema acerta sempre, pode passar a agir mais?
- O que fazer depois que uma automação causa um problema?

---

## 3. Definições

**Autonomia** — grau em que o sistema age sem intervenção humana no momento da
ação.

**Ação em nome do usuário** — qualquer execução que o usuário poderia ter feito e
que o sistema fez por ele.

**Rastro** — registro consultável do que o sistema executou.

**Automatismo** — regra que executa ação sem intervenção no momento em que ocorre.

**Efeito externo** — consequência que sai do sistema e alcança terceiros.

**Recuperação de confiança** — conjunto de atos após falha, definido em
`FH-18.10`.

---

## 4. Fundamento

**Por que controle percebido importa mais que controle real.** Um usuário que sabe
que pode intervir raramente intervém — mas trabalha com tranquilidade. Um usuário
que não sabe verifica constantemente, mesmo que o sistema nunca erre. A diferença
de produtividade entre os dois é enorme, e ela não depende do comportamento do
sistema: depende do que o usuário sabe sobre esse comportamento.

**Por que a escala tem cinco níveis, e não dois.** A pergunta "o sistema deve agir
sozinho?" é mal formulada e produz respostas ruins nos dois extremos: automação
total (que surpreende) ou confirmação constante (que treina o usuário a clicar sem
ler). A escala de `FH-18.01` transforma uma pergunta binária em uma escolha
calibrada — e `FH-18.02` estabelece a direção de calibração: o **menor** nível que
resolve.

**Por que o nível 2 é o mais valioso.** Sugerir é onde vive quase todo o valor
percebido de inteligência do produto: o sistema demonstra que entendeu, prepara o
trabalho, e ainda assim o usuário decide. É o nível que produz a sensação de "está
um passo à frente" sem nenhum dos riscos de agir. A tentação de subir para o nível
3 ou 4 quase sempre vem de querer economizar um clique — economia que raramente
compensa a perda de previsibilidade.

**Por que o rastro é obrigatório.** Sem rastro, o usuário não consegue distinguir
o que ele fez do que o sistema fez. Quando algo aparece errado, ele não sabe se
errou, se alguém da equipe errou, ou se o sistema agiu. Essa ambiguidade é
corrosiva: ela transforma um problema pontual em desconfiança geral.

**Por que automatismos entram desligados.** Uma automação ligada por padrão age
antes de o usuário entender o que ela faz — e a primeira ação de uma automação
mal compreendida costuma ser justamente a que gera dano. `FH-18.08` inverte o
ônus: quem quiser o automatismo o liga, tendo visto antes o que ele fará
(`FH-18.06`).

**Por que o sistema nunca se promove.** É tentador desenhar sistemas que, ao
acertarem consistentemente, passem a agir sozinhos. Isso quebra P7
(previsibilidade) de forma especialmente grave: o comportamento muda sem que nada
visível tenha mudado, e o usuário perde a capacidade de modelar o sistema.
`FH-18.11` fecha essa porta — a autonomia é concedida pelo usuário, nunca
conquistada pelo sistema.

**Por que recuperação de confiança é regra, não cortesia.** Depois de uma falha em
ação automática, o usuário reduz sua confiança em **todos** os automatismos, não
apenas naquele. Sem os três atos de `FH-18.10` — informar, corrigir, declarar o
que mudou —, a redução de confiança é permanente, e o efeito prático é que ele
desliga tudo.

---

## 5. Princípios

**Controle percebido vale mais que controle exercido.**

**Sugerir é quase sempre suficiente.**

**O que o sistema fez, o usuário pode ver.**

**Autonomia é concedida, nunca conquistada.**

---

## 6. Regras normativas — a escala em detalhe

| Nível | O sistema… | Exige | Use quando | Nunca use quando |
| --- | --- | --- | --- | --- |
| **1 — Informar** | Mostra algo relevante | Nada | Sempre permitido | — |
| **2 — Sugerir** | Prepara e deixa pronto | Aceitação editável | O sistema tem alta confiança e o usuário decide rápido | A sugestão é ruidosa ou frequente demais |
| **3 — Agir com desfazer** | Executa e oferece reversão imediata | Reversão visível e de um passo | Efeito interno, reversível, sem terceiros | Há efeito externo ou irreversível |
| **4 — Agir com confirmação** | Pergunta antes | Declaração de efeito, alcance e reversibilidade | Efeito externo, irreversível ou de alcance amplo | A ação é frequente e reversível — confirmação vira ruído |
| **5 — Nunca agir** | Só o usuário executa | — | Comunicação com terceiros sem revisão; ampliação de permissão; exclusão definitiva | — |

### `FH-18.02` — Menor autonomia suficiente

**Quando aplicar.** Sempre, ao definir uma capacidade automática.

**Quando NÃO aplicar.** Quando o nível inferior tornaria a capacidade inútil — uma
automação que exige confirmação a cada execução não é automação. Nesse caso, o
nível correto é 3 ou 4 **na ativação**, com nível 1 (informar) em cada execução.

**Certo.** A automação é confirmada uma vez, ao ser ativada; cada execução gera
registro visível.

**Errado.** Confirmar cada execução (inútil) ou executar sem registro (invisível).

### `FH-18.03` — Rastro

**Quando aplicar.** Em toda ação automática.

**Quando NÃO aplicar.** Em operações internas sem efeito perceptível
(sincronização, cache).

**Errado.** Uma etiqueta aplicada automaticamente sem indicação de que foi o
sistema. O usuário atribui a ação a um colega — ou a si mesmo.

### `FH-18.05` — Desligamento disponível

**Quando NÃO aplicar.** Quando o automatismo é exigido por obrigação legal ou por
segurança de dados — aí ele é informado, não opcional.

### `FH-18.08` — Entrada desligada

**Quando NÃO aplicar.** Automatismos internos, reversíveis e sem terceiros podem
entrar ligados — ordenar por relevância, agrupar itens, preservar rascunho.

### `FH-18.10` — Recuperação após falha

**Certo.** "Esta automação enviou 12 mensagens duplicadas em 3 de março. Os
contatos afetados estão listados. A regra foi corrigida para X."

**Errado.** Corrigir silenciosamente. O usuário descobre pelo cliente dele, e a
confiança não se recupera.

---

## 7. Anti-padrões

**Autonomia por conveniência.** Subir de nível para economizar um clique.

**Automação invisível.** Sistema agindo sem rastro.

**Ligado por padrão.** Automatismo com efeito externo ativo desde o início.

**Confirmação inflacionada.** Perguntar em ação reversível frequente — treina o
usuário a ignorar todas as confirmações, inclusive as importantes.

**Promoção silenciosa.** Sistema que passa a agir mais por ter acertado antes.

**Correção muda.** Falha resolvida sem comunicação.

**Desligar escondido.** Automatismo cujo desligamento exige procurar em
configurações.

---

## 8. Impactos

**Cognitivo.** O rastro elimina a ambiguidade sobre autoria de ações — uma das
principais fontes de esforço investigativo em sistemas multiusuário com automação.

**Emocional.** É o capítulo que produz a **confiança calma** do Capítulo 17. Controle
percebido é o antídoto direto da ansiedade de delegação.

**Produtividade.** Nível 2 bem executado é o maior ganho disponível: o sistema faz
o trabalho preparatório e o usuário mantém a decisão — sem custo de verificação.

**Percepção de qualidade.** Sistemas previsíveis são percebidos como inteligentes;
sistemas imprevisíveis são percebidos como instáveis, mesmo quando acertam mais.

**Curva de aprendizagem.** `FH-18.06` e `FH-18.08` permitem que o usuário adote
automação no ritmo em que a compreende, em vez de descobri-la pelo efeito.

---

## 9. Riscos e trade-offs

**Risco: subutilização da automação.** Entrar desligado reduz adoção. Mitigação:
`FH-18.06` (previsão antes de ativar) e `FH-06.11` (oferta ao detectar repetição)
— a adoção vem por convite compreendido, não por imposição.

**Risco: excesso de rastro.** Registro de tudo pode virar ruído. Mitigação: o
rastro é **consultável**, não necessariamente exibido; `FH-18.07` exige
perceptibilidade discreta no contexto, não notificação.

**Risco: rigidez de `FH-18.11`.** Impede sistemas que aprendem a agir. Trade-off
assumido: previsibilidade vence capacidade adaptativa (`FH-03.09`). O sistema pode
aprender a **sugerir melhor**; não a agir mais.

**Trade-off central.** Trocamos automação máxima por confiança máxima. O produto
faz menos sozinho do que poderia — e é usado com mais tranquilidade, o que resulta
em mais delegação real ao longo do tempo.

---

## 10. Critérios de verificação

1. Toda ação automática está classificada em um dos cinco níveis.
2. Nenhuma opera em nível superior ao necessário sem justificativa registrada.
3. Tudo que o sistema fez em nome do usuário é consultável.
4. Toda ação é reversível ou teve consequência declarada e confirmada.
5. Todo automatismo pode ser desligado sem sair do fluxo.
6. Nenhuma capacidade automática entra sem previsão prévia do efeito.
7. Nenhuma ação automática é imperceptível no contexto.
8. Automatismos com efeito externo entram desligados.
9. Toda funcionalidade declara seu nível de autonomia.
10. Nenhuma falha automática foi corrigida sem comunicação.
11. Nenhum nível de autonomia aumentou por histórico de acerto.

---

## 11. Checklist do capítulo

- [ ] Classifiquei esta ação em um dos cinco níveis.
- [ ] Verifiquei se o nível abaixo resolveria.
- [ ] O que o sistema faz fica registrado e consultável.
- [ ] A ação é reversível — ou declarei consequência e confirmei.
- [ ] Existe caminho de desligar, dentro do fluxo.
- [ ] O usuário vê o efeito antes de ativar.
- [ ] Automatismo com efeito externo entra desligado.
- [ ] Declarei o nível de autonomia da funcionalidade.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P2, P4, P7), 10 (promessas), 11 (ética), 17 (emoção).

**É pré-requisito de.** Capítulos 44 (erros), 45 (confirmações), 49
(produtividade), 52–53 (IA), 54 (automações), 55 (personalização).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Automatismos e execuções | `src/lib/automations/`, `src/app/(dashboard)/automations/` |
| Rastro de execução | `src/app/(dashboard)/automations/[id]/logs/`, `src/app/(dashboard)/flows/[id]/runs/` |
| Ativação e previsão de efeito | `src/components/flows/flow-builder.tsx`, `src/components/automations/` |
| Ações de IA em nome do usuário | `src/lib/ai-service/`, `src/app/(dashboard)/ai-assistant/` |
| Reversão e confirmação | `src/components/ui/dialog.tsx`, `src/components/themed-toaster.tsx` |
