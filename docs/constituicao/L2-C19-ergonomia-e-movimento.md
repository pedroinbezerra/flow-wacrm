# Capítulo 19 — Ergonomia e Economia de Movimento

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P3), 13, 14, 15, 16 |
| É pré-requisito de | Capítulos 24, 35, 37, 38, 48, 49 |
| Artigos | `FH-19.01` a `FH-19.10` |

---

## 0. Núcleo Normativo

**`FH-19.01`** — A ação primária de uma tela **DEVE** estar na zona de alcance
confortável da superfície em uso, sem exigir rolagem para ser encontrada.
> **Verificação:** a ação primária é alcançável sem rolar e sem deslocamento desconfortável? → SIM = cumpre | NÃO = viola.

**`FH-19.02`** — Todo fluxo frequente **DEVE** ter seu custo declarado em **número
de passos** e **número de trocas de dispositivo de entrada**, antes e depois de
qualquer alteração.
> **Verificação:** o custo em passos e trocas está declarado para antes e depois? → SIM = cumpre | NÃO = viola.

**`FH-19.03`** — Ações destrutivas **NUNCA** são adjacentes a ações frequentes.
Exige-se separação espacial, agrupamento distinto ou ambos.
> **Verificação:** existe ação destrutiva imediatamente ao lado de uma ação de uso frequente? → NÃO = cumpre | SIM = viola.

**`FH-19.04`** — Todo alvo interativo **DEVE** respeitar a dimensão mínima
utilizável da superfície em uso, incluindo a área sensível além do desenho visual.
> **Verificação:** o alvo atinge a dimensão mínima da superfície, contando a área sensível? → SIM = cumpre | NÃO = viola.

**`FH-19.05`** — Elementos **DEVEM** ser posicionados na **ordem temporal de uso**:
o que se faz primeiro fica antes, no sentido de leitura.
> **Verificação:** a ordem espacial corresponde à ordem em que os elementos são usados? → SIM = cumpre | NÃO = viola.

**`FH-19.06`** — Nenhum fluxo frequente **PODE** exigir mais de **uma** troca entre
teclado e ponteiro. Alternância repetida é proibida.
> **Verificação:** quantas trocas de dispositivo este fluxo exige? → ≤1 = cumpre | 2+ = viola.

**`FH-19.07`** — Rolagem **NUNCA** é requisito para descobrir a existência da ação
primária, de aviso crítico ou de erro que impede a conclusão.
> **Verificação:** algo essencial só é percebido após rolagem? → NÃO = cumpre | SIM = viola.

**`FH-19.08`** — Passos consecutivos de um mesmo fluxo **DEVEM** minimizar a
distância percorrida entre eles. Alternância entre extremos opostos da tela é
proibida em fluxo frequente.
> **Verificação:** os passos consecutivos exigem deslocamento entre extremos opostos? → NÃO = cumpre | SIM = viola.

**`FH-19.09`** — Operação repetitiva sobre vários itens **NUNCA** exige repetir o
mesmo movimento item a item quando a ação em lote é possível.
> **Verificação:** existe caminho em lote para esta operação repetitiva? → SIM = cumpre | NÃO = viola.

**`FH-19.10`** — Em superfície de toque, a ação primária **DEVE** ser alcançável com
uma única mão, sem reposicionar o aparelho.
> **Verificação:** a ação primária é alcançável com uma mão em superfície de toque? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo reduz o **custo físico** do trabalho: distância percorrida, número de
cliques, trocas entre dispositivos de entrada, alcance na tela. É o complemento
material do Capítulo 15 — lá se economiza atenção, aqui se economiza movimento.

---

## 2. Perguntas que este capítulo responde

- Onde colocar a ação primária?
- Quantos cliques são aceitáveis?
- Como medir objetivamente o custo de um fluxo?
- Quando o teclado deve bastar?
- Onde colocar a ação de excluir?
- Qual o tamanho mínimo de um alvo?

---

## 3. Definições

**Zona de alcance** — região da superfície acessível com esforço mínimo. Varia por
tipo de superfície e por modo de segurar o aparelho.

**Troca de dispositivo** — mudança entre teclado e ponteiro. Cada troca custa tempo
e quebra o ritmo de execução.

**Custo de fluxo** — passos × frequência, somado às trocas de dispositivo.
Grandeza objetiva, declarável e comparável.

**Alvo interativo** — área sensível a clique ou toque, que pode ser maior que o
desenho visível.

**Ordem temporal de uso** — sequência em que os elementos são efetivamente usados,
que nem sempre coincide com sua importância conceitual.

---

## 4. Fundamento

**Por que o custo físico é subestimado.** Ele é invisível em uma única execução e
determinante no acumulado. Um clique a mais em uma tarefa executada duzentas vezes
por dia representa, ao longo de um ano, dezenas de horas de trabalho — e, mais
importante, uma sensação persistente de atrito que o usuário não consegue nomear e
que atribui, difusamente, à qualidade do produto.

**Por que trocar de dispositivo é o custo mais caro.** Trocar de teclado para
ponteiro não custa apenas o movimento da mão: custa a saída do modo de digitação, a
localização visual do alvo, o retorno e o reposicionamento dos dedos. É várias
vezes mais caro que um clique adicional dentro do mesmo modo — e é o custo que
menos aparece em contagem de passos. Por isso `FH-19.02` exige medir as duas
grandezas separadamente, e `FH-19.06` limita as trocas em vez dos passos.

**Por que separar ação destrutiva de ação frequente.** A fluência do Capítulo 16
significa executar sem olhar. Quando uma ação destrutiva está ao lado de uma
frequente, a memória motora — que é aproximada, não exata — eventualmente atinge a
errada. Não é imprudência do usuário: é propriedade do sistema motor humano. A
única prevenção confiável é a distância; confirmação ajuda, mas confirmação em ação
frequente é ignorada (`FH-45`).

**Por que a ordem espacial segue a temporal.** O olhar percorre a interface em uma
direção previsível. Quando a sequência de uso contraria essa direção, cada passo
exige uma busca visual — e a busca visual, repetida, é a maior fonte de lentidão em
fluxos que parecem simples. Note que isso pode contrariar a ordem de
**importância** conceitual: o que é mais importante nem sempre é o que se faz
primeiro, e é a ordem de uso que vence.

**Por que uma mão importa.** Em superfície de toque, o usuário frequentemente está
com a outra mão ocupada — segurando algo, escrevendo, dirigindo a atenção a outra
coisa. Uma ação primária fora do alcance de uma mão obriga a reposicionar o
aparelho, o que na prática significa adiar a ação. `FH-19.10` protege o Gestor do
Capítulo 13, que usa o produto em movimento.

**Por que lote é ergonomia, e não apenas produtividade.** Repetir o mesmo movimento
dezenas de vezes é a definição de trabalho desnecessário — além de ser a principal
causa de erro por desatenção, porque a repetição adormece a verificação.
`FH-19.09` conecta este capítulo ao 49.

---

## 5. Princípios

**Custo físico é invisível na unidade e decisivo no acumulado.**

**Trocar de dispositivo custa mais que clicar.**

**Distância é a única proteção confiável contra erro motor.**

**A ordem espacial obedece à ordem de uso, não à de importância.**

---

## 6. Regras normativas

### `FH-19.01` — Ação primária alcançável

**Quando aplicar.** Em toda tela com ação dominante.

**Quando NÃO aplicar.** Em telas de leitura longa, onde a ação pertence ao fim do
conteúdo por natureza — ainda assim, sua existência deve ser perceptível sem
rolagem (`FH-19.07`).

### `FH-19.02` — Custo declarado

**Quando aplicar.** Em toda alteração de fluxo frequente.

**Certo.** "Antes: 6 passos, 2 trocas de dispositivo. Depois: 4 passos, 1 troca."

**Errado.** Declarar apenas que o fluxo "ficou mais simples". Não é verificável e
não permite comparação futura.

### `FH-19.03` — Distância do destrutivo

**Quando aplicar.** Em listas, menus, cabeçalhos e barras de ação.

**Quando NÃO aplicar.** Quando a ação destrutiva **é** a ação primária da tela — uma
tela dedicada a excluir algo. Aí ela é a única, e o risco de confusão motora não
existe.

**Errado.** Excluir imediatamente ao lado de arquivar, no mesmo menu, com o mesmo
peso visual.

### `FH-19.05` — Ordem temporal

**Certo.** Selecionar destinatários → escolher conteúdo → revisar → enviar, nessa
ordem espacial.

**Errado.** Colocar a informação mais importante conceitualmente em primeiro lugar,
mesmo sendo a última a ser usada — obriga o olhar a voltar a cada passo.

### `FH-19.06` — Limite de trocas

**Quando aplicar.** Em fluxos frequentes.

**Quando NÃO aplicar.** Em fluxos episódicos e complexos (construção de automação),
onde a alternância é inerente à natureza do trabalho.

**Errado.** Digitar, clicar para confirmar um campo, digitar de novo, clicar de
novo — o padrão que mais destrói ritmo de digitação.

### `FH-19.09` — Lote em vez de repetição

**Quando NÃO aplicar.** Quando cada item exige decisão individual genuinamente
distinta — aí o lote produziria decisão apressada, o que é pior.

---

## 7. Anti-padrões

**Ação primária escondida abaixo da dobra.**

**Excluir ao lado do frequente.**

**Zigue-zague.** Passos consecutivos em extremos opostos da tela.

**Alternância forçada.** Fluxo que obriga a soltar o teclado repetidamente.

**Alvo minúsculo.** Área sensível igual ao desenho, sem margem.

**Ordem por importância.** Layout organizado por relevância conceitual em vez de
sequência de uso.

**Repetição braçal.** Aplicar a mesma ação item a item por falta de caminho em
lote.

---

## 8. Impactos

**Cognitivo.** Ordem espacial coerente com a temporal elimina busca visual repetida
— um custo que se soma silenciosamente ao longo do dia.

**Emocional.** Atrito físico produz irritação difusa que o usuário atribui ao
produto sem conseguir nomear a causa. Sua ausência produz a sensação de
"ferramenta que não atrapalha".

**Produtividade.** É o capítulo de efeito mais mensurável. Passos e trocas são
grandezas contáveis, e sua redução tem retorno direto e verificável.

**Percepção de qualidade.** Ergonomia bem resolvida é invisível; mal resolvida é
percebida como amadorismo, mesmo quando toda a lógica do produto está correta.

**Curva de aprendizagem.** `FH-19.03` e `FH-19.05` reduzem erro do iniciante sem
lentificar o especialista — uma das poucas otimizações que servem aos dois
extremos simultaneamente.

---

## 9. Riscos e trade-offs

**Risco: densidade excessiva por economia de movimento.** Aproximar tudo para
reduzir distância pode violar o orçamento cognitivo (`FH-15.01`). Mitigação:
agrupamento resolve os dois — proximidade por relação de uso reduz distância **e**
blocos.

**Risco: rigidez de layout.** `FH-19.05` limita liberdade de composição. É
deliberado: composição serve ao uso, não à estética (`FH-24`).

**Risco: lote perigoso.** `FH-19.09` pode facilitar erro em massa. Mitigação:
Capítulo 49 exige declaração de alcance antes de agir e relatório por item depois.

**Trade-off central.** Trocamos liberdade estética por eficiência física. Telas
ergonômicas são menos livres na composição — e mais rápidas todos os dias.

---

## 10. Critérios de verificação

1. A ação primária é alcançável sem rolagem.
2. Todo fluxo frequente alterado tem custo declarado antes e depois.
3. Nenhuma ação destrutiva é adjacente a ação frequente.
4. Todo alvo respeita a dimensão mínima da superfície.
5. A ordem espacial corresponde à ordem de uso.
6. Nenhum fluxo frequente exige mais de uma troca de dispositivo.
7. Nada essencial depende de rolagem para ser descoberto.
8. Passos consecutivos não exigem deslocamento entre extremos.
9. Toda operação repetitiva tem caminho em lote.
10. Em toque, a ação primária é alcançável com uma mão.

---

## 11. Checklist do capítulo

- [ ] Contei os passos e as trocas de dispositivo, antes e depois.
- [ ] A ação primária aparece sem rolar.
- [ ] Nenhuma ação destrutiva está ao lado de uma frequente.
- [ ] Os alvos têm tamanho mínimo, com área sensível maior que o desenho.
- [ ] A ordem na tela é a ordem de uso.
- [ ] O fluxo exige no máximo uma troca teclado↔ponteiro.
- [ ] Passos consecutivos estão próximos.
- [ ] Existe caminho em lote para o que é repetitivo.
- [ ] Em toque, alcanço a ação primária com uma mão.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P3), 13 (arquétipos), 14 (contexto), 15 (agrupamento),
16 (memória motora).

**É pré-requisito de.** Capítulos 24 (composição), 35 (componentes), 37
(responsividade), 38 (acessibilidade), 48 (teclado), 49 (lote).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Ações primárias e posicionamento | `src/components/ui/button.tsx`, cabeçalhos de rota em `src/app/(dashboard)/` |
| Ações destrutivas | Variantes destrutivas em `src/components/ui/button.tsx`, `dropdown-menu.tsx` |
| Alvos e áreas sensíveis | Primitivas em `src/components/ui/` |
| Fluxos frequentes do Operador | `src/components/inbox/message-thread.tsx` |
| Operações em lote | `src/components/contacts/`, `src/components/broadcasts/step2-select-audience.tsx` |
