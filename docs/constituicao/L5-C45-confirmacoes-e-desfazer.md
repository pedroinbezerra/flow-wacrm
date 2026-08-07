# Capítulo 45 — Confirmações, Ações Destrutivas e Desfazer

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P4), 10, 17, 18, 19, 44 |
| É pré-requisito de | Capítulos 46, 49, 54, 58 |
| Artigos | `FH-45.01` a `FH-45.11` |

---

## 0. Núcleo Normativo

**`FH-45.01`** — O tratamento de toda ação é definido pela **matriz reversibilidade
× impacto × alcance** (§6). Nenhuma ação recebe tratamento por preferência.
> **Verificação:** o tratamento corresponde à posição da ação na matriz? → SIM = cumpre | NÃO = viola.

**`FH-45.02`** — **Preferência estrutural por desfazer.** Sempre que a reversão for
tecnicamente possível, **desfazer vence confirmar**.
> **Verificação:** sendo reversível, foi oferecido desfazer em vez de confirmação? → SIM = cumpre | NÃO = viola.

**`FH-45.03`** — Toda confirmação **DEVE** declarar a **consequência real**: o que
acontece, sobre o que, quantos itens e o que não poderá ser desfeito. "Tem
certeza?" isolado é proibido (`FH-17.09`).
> **Verificação:** a confirmação declara efeito, alcance e reversibilidade? → SIM = cumpre | NÃO = viola.

**`FH-45.04`** — **Confirmação em ação reversível e frequente é proibida.** Ela
treina o usuário a confirmar sem ler, o que enfraquece todas as confirmações do
produto.
> **Verificação:** esta ação é reversível e frequente? Se SIM, existe confirmação? → NÃO existe = cumpre | Existe = viola.

**`FH-45.05`** — Confirmação por **digitação** — reproduzir um nome ou palavra — é
reservada exclusivamente à destruição **irreversível de alto alcance**.
> **Verificação:** há digitação exigida em ação que não é irreversível de alto alcance? → NÃO = cumpre | SIM = viola.

**`FH-45.06`** — A janela de desfazer **DEVE** ser visível, com duração declarada, e
**DEVE** permanecer acessível enquanto durar — sem depender de o usuário manter uma
mensagem aberta.
> **Verificação:** a possibilidade de desfazer é visível, com duração declarada, durante toda a janela? → SIM = cumpre | NÃO = viola.

**`FH-45.07`** — **Ação que afeta terceiros** — envio, disparo, notificação externa
— é categoria própria: **sempre confirmada**, **nunca reversível após o início**, e
**sempre precedida de resumo do alcance** (`FH-07.03`, `FH-11.10`).
> **Verificação:** a ação sobre terceiros é confirmada, com alcance declarado, e não promete reversão? → SIM = cumpre | NÃO = viola.

**`FH-45.08`** — Desfazer **DEVE** restaurar o estado **completo**, incluindo
relações, posição e atributos derivados. Reversão parcial é proibida.
> **Verificação:** desfazer restaura tudo o que a ação alterou? → SIM = cumpre | NÃO = viola.

**`FH-45.09`** — Confirmação **NUNCA** substitui prevenção. Ela não transfere ao
usuário a responsabilidade por um risco que o desenho poderia ter eliminado
(`FH-44.01`).
> **Verificação:** a confirmação está sendo usada no lugar de uma prevenção possível? → NÃO = cumpre | SIM = viola.

**`FH-45.10`** — Ações da mesma classe **DEVEM** receber o mesmo tratamento em todo
o produto (`FH-07.08`).
> **Verificação:** ações equivalentes em outras áreas recebem este mesmo tratamento? → SIM = cumpre | NÃO = viola.

**`FH-45.11`** — Confirmação **NUNCA** é o caminho para obter consentimento amplo.
Cada consentimento é específico à ação apresentada (`FH-11.02`, `FH-10.03`).
> **Verificação:** esta confirmação autoriza apenas a ação declarada? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula o momento em que o sistema pergunta "tem certeza?" — e,
principalmente, **quando ele não deve perguntar**. Confirmação em excesso é tão
perigosa quanto confirmação de menos: ambas terminam com o usuário executando ações
destrutivas sem perceber.

---

## 2. Perguntas que este capítulo responde

- O que exige confirmação?
- O que exige desfazer em vez de confirmação?
- Como escrevo uma confirmação?
- Quando exijo digitar o nome?
- Por quanto tempo o desfazer fica disponível?
- Envio pode ser desfeito?

---

## 3. Definições

**Reversibilidade** — possibilidade técnica de restaurar o estado anterior.

**Impacto** — gravidade da consequência: perda de trabalho, de dado, de relação, de
dinheiro.

**Alcance** — quantidade de itens e de pessoas afetadas.

**Desfazer** — reversão oferecida após a execução, em janela declarada.

**Confirmação** — decisão exigida antes da execução.

**Confirmação por digitação** — reprodução de um texto como barreira deliberada.

---

## 4. Fundamento

**Por que desfazer é melhor que confirmar.** Confirmação cobra de **todos** os
usuários, em **todas** as execuções, um custo que só se justifica nas raras vezes em
que a ação foi um engano. Desfazer inverte a economia: o fluxo comum é rápido, e o
custo recai apenas sobre quem errou. Além disso, confirmação exige que o usuário
avalie uma consequência **antes** de vê-la; desfazer permite avaliar o resultado
real. Essa é uma diferença cognitiva grande — julgar o concreto é muito mais
confiável que imaginar o hipotético.

**Por que confirmação frequente é perigosa.** Confirmar é uma ação motora. Quando
ela se repete em contexto de baixo risco, ela se automatiza (`FH-16`), e o usuário
passa a confirmar sem ler — inclusive nas telas em que a leitura importava. Ou
seja: **confirmar demais destrói a confirmação**. É por isso que `FH-45.04` proíbe
categoricamente, em vez de apenas desencorajar.

**Por que "tem certeza?" é proibido.** A pergunta não fornece nenhuma informação
nova. O usuário já decidiu quando clicou; o que ele precisa não é ser questionado,
é **saber a consequência**. Uma confirmação útil informa alcance, efeito e
reversibilidade — e frequentemente é lida como informação valiosa, não como
obstáculo.

**Por que digitação é reservada.** Exigir reproduzir um nome é a barreira mais cara
que existe: ela quebra o fluxo, obriga leitura e impede automatização motora. Por
isso funciona — e por isso não pode ser usada fora de destruição irreversível de
alto alcance. Se for aplicada a ações medianas, o usuário desenvolve tolerância e a
barreira perde eficácia justamente onde era essencial.

**Por que ação sobre terceiros é categoria própria.** Uma mensagem enviada não pode
ser "desfeita": ela já chegou a alguém. Prometer reversão nesse caso é mentira de
estado (P9) e produz o pior tipo de surpresa. Além disso, o dano é sofrido por
quem não usa o produto e não tem voz aqui (`FH-11`). Por isso o tratamento é
sempre: resumo do alcance, confirmação explícita, e nenhuma promessa de reversão
após o início.

**Por que desfazer precisa ser completo.** Reversão parcial produz um estado que
nunca existiu antes — pior que o estado anterior e pior que o posterior. O usuário
perde a capacidade de raciocinar sobre o sistema, e a recuperação passa a exigir
trabalho manual.

---

## 5. Princípios

**Confirmar cobra de todos; desfazer cobra de quem errou.**

**Confirmação demais destrói a confirmação.**

**A pergunta certa não é "tem certeza?", é "isto é o que você quer que aconteça?".**

**O que chegou a terceiros não volta — e o produto não finge que volta.**

---

## 6. Matriz de tratamento

Localize a ação pelos três eixos. O tratamento é obrigatório (`FH-45.01`).

| Reversível? | Impacto | Alcance | Tratamento |
| --- | --- | --- | --- |
| Sim | Baixo | Um item | **Nada.** Executa; feedback ambiente (`FH-43`) |
| Sim | Baixo | Muitos itens | **Desfazer** com resumo do que mudou |
| Sim | Alto | Qualquer | **Desfazer** visível e prolongado + resumo |
| Não | Baixo | Um item | **Confirmação simples** com consequência declarada |
| Não | Alto | Um item | **Confirmação** com consequência detalhada |
| Não | Alto | Muitos itens | **Confirmação com digitação** (`FH-45.05`) |
| Qualquer | Qualquer | **Afeta terceiros** | **Categoria própria** (`FH-45.07`): resumo + confirmação + sem promessa de reversão |

**Regra de leitura.** "Afeta terceiros" domina todas as outras dimensões: um envio
para uma pessoa recebe o tratamento da última linha, não da primeira.

### `FH-45.03` — Anatomia da confirmação

| Elemento | Obrigatório | Exemplo de conteúdo |
| --- | --- | --- |
| Efeito | Sim | "Excluir 3 etapas do funil" |
| Alcance | Sim | "12 negócios serão movidos para a primeira etapa" |
| Irreversibilidade | Sim, quando houver | "Esta ação não pode ser desfeita" |
| Ação de saída | Sim | "Cancelar" com o mesmo peso de leitura |

**Errado.** "Tem certeza que deseja continuar?" — nenhum dos quatro elementos.

### `FH-45.06` — Janela de desfazer

**Certo.** Reversão visível junto ao resultado, com duração declarada, disponível
mesmo que a mensagem seja dispensada.

**Errado.** Desfazer disponível apenas enquanto uma notificação temporária estiver
na tela. Quem desviou o olhar perdeu a chance — e o produto sabia disso.

---

## 7. Anti-padrões

**Confirmação-reflexo.** Perguntar em toda ação, inclusive triviais.

**Tem certeza vazio.** Pergunta sem consequência declarada.

**Digitação banalizada.** Exigir reproduzir nome em ação mediana.

**Desfazer efêmero.** Reversão que some com a notificação.

**Reversão parcial.** Desfazer que restaura só uma parte.

**Envio "desfazível".** Prometer cancelar o que já saiu.

**Confirmação como escudo.** Usar a pergunta para transferir responsabilidade em
vez de prevenir.

**Consentimento amplo.** Confirmação que autoriza mais do que a ação apresentada.

---

## 8. Impactos

**Cognitivo.** Desfazer transfere a avaliação do hipotético para o concreto —
julgar o que aconteceu é muito mais barato e confiável que imaginar o que
aconteceria.

**Emocional.** A reversibilidade é a base da confiança calma (Capítulo 17) e da
disposição para explorar. Confirmações excessivas produzem a sensação de caminhar
em campo minado.

**Produtividade.** `FH-45.04` remove interrupções de fluxos frequentes — o ganho é
proporcional à frequência, e é grande.

**Percepção de qualidade.** Confirmações informativas são percebidas como cuidado;
confirmações genéricas, como burocracia. O texto faz toda a diferença.

**Curva de aprendizagem.** Reversibilidade permite aprender explorando. Sistemas
sem desfazer só podem ser aprendidos por instrução — proibido por `FH-06.08`.

---

## 9. Riscos e trade-offs

**Risco: complexidade de implementação do desfazer.** Reversão completa é cara.
Custo assumido: é a alocação de complexidade que P1 exige, e a matriz limita os
casos.

**Risco: subconfirmação.** Preferir desfazer pode deixar passar ação perigosa.
Mitigação: a matriz é explícita, e "afeta terceiros" domina os demais eixos.

**Risco: confirmações longas.** Declarar consequência aumenta o texto. Mitigação:
Capítulo 58 limita extensão; quatro elementos cabem em duas linhas.

**Trade-off central.** Trocamos proteção uniforme por proteção calibrada. Algumas
ações deixam de perguntar — e as que perguntam voltam a ser lidas.

---

## 10. Critérios de verificação

1. Todo tratamento corresponde à posição da ação na matriz.
2. Toda ação reversível oferece desfazer em vez de confirmação.
3. Toda confirmação declara efeito, alcance e reversibilidade.
4. Nenhuma ação reversível e frequente exige confirmação.
5. Digitação só é exigida em destruição irreversível de alto alcance.
6. A janela de desfazer é visível, declarada e persistente enquanto durar.
7. Ações sobre terceiros são confirmadas, com alcance, e sem promessa de reversão.
8. Desfazer restaura o estado completo.
9. Nenhuma confirmação substitui prevenção possível.
10. Ações equivalentes recebem o mesmo tratamento em todo o produto.
11. Nenhuma confirmação autoriza além da ação declarada.

---

## 11. Checklist do capítulo

- [ ] Localizei a ação na matriz: reversível? impacto? alcance? afeta terceiros?
- [ ] Sendo reversível, ofereci desfazer em vez de perguntar.
- [ ] A confirmação diz o efeito, o alcance e o que não volta.
- [ ] Não coloquei confirmação em ação frequente e reversível.
- [ ] Digitação só onde é destruição irreversível ampla.
- [ ] O desfazer continua acessível durante toda a janela declarada.
- [ ] Envio a terceiros: resumo, confirmação, sem promessa de cancelar.
- [ ] O desfazer restaura tudo, não parte.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P4), 10 (reversibilidade), 17 (`FH-17.09`), 18
(autonomia), 19 (`FH-19.03`), 44 (prevenção).

**É pré-requisito de.** Capítulos 46, 49 (lote), 54 (automações), 58 (microcopy).
Alimenta a matriz pendente de confirmação no Anexo C.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Confirmações | `src/components/ui/dialog.tsx` |
| Ações destrutivas | Variantes destrutivas em `src/components/ui/button.tsx` |
| Desfazer e mensagens | `src/components/themed-toaster.tsx` |
| Envio a terceiros | `src/components/broadcasts/`, `src/lib/whatsapp/` |
| Exclusão e retenção | `docs/business-rules/retencao-exclusao-inadimplencia.md` |
