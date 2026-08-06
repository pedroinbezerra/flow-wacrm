# Capítulo 27 — Primeira Experiência e Ciclo de Vida da Conta

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 11, 25, 26 |
| É pré-requisito de | Capítulos 36, 42, 46, 51 |
| Artigos | `FH-27.01` a `FH-27.10` |

---

## 0. Núcleo Normativo

**`FH-27.01`** — O **estado inaugural** — conta vazia, sem nenhum dado — **DEVE**
ser plenamente utilizável e orientar sobre o próximo passo útil (`FH-42`).
> **Verificação:** com a conta completamente vazia, a tela é utilizável e indica o próximo passo? → SIM = cumpre | NÃO = viola.

**`FH-27.02`** — Dados de demonstração **NUNCA** se misturam a dados reais. Se
existirem, **DEVEM** ser inequivocamente identificados como exemplo e removíveis em
um passo.
> **Verificação:** algum dado de exemplo pode ser confundido com dado real do usuário? → NÃO = cumpre | SIM = viola.

**`FH-27.03`** — A evolução da conta **NUNCA** altera o modelo mental, a navegação
nem a posição das ações. O que muda com a maturidade é o **conteúdo** e o que o
produto **oferece**, jamais o que ele **é** (`FH-20.06`, `FH-16.02`).
> **Verificação:** o crescimento da conta altera modelo, navegação ou posição de ações? → NÃO = cumpre | SIM = viola.

**`FH-27.04`** — Novos membros encontram o ambiente **pronto**: sem configuração
pendente, sem decisões herdadas e com acesso imediato ao seu trabalho
(`FH-26.07`).
> **Verificação:** o novo membro consegue trabalhar no primeiro acesso, sem configurar nada? → SIM = cumpre | NÃO = viola.

**`FH-27.05`** — Crescimento **NUNCA** exige migração manual, reconfiguração ou
recriação de dados já existentes (`FH-25.08`).
> **Verificação:** crescer exige alguma migração ou recriação manual? → NÃO = cumpre | SIM = viola.

**`FH-27.06`** — Limites de plano, consumo e capacidade **DEVEM** ser comunicados
**antes** de serem atingidos, com antecedência que permita agir.
> **Verificação:** o usuário é avisado antes de atingir o limite, com tempo de agir? → SIM = cumpre | NÃO = viola.

**`FH-27.07`** — Conta madura **NUNCA** é penalizada pelo próprio volume: o
desempenho percebido em conta grande **DEVE** ser equivalente ao de conta pequena
(`FH-46`).
> **Verificação:** o desempenho percebido se degrada proporcionalmente ao volume acumulado? → NÃO = cumpre | SIM = viola.

**`FH-27.08`** — Inatividade **NUNCA** destrói dado sem aviso prévio, prazo
declarado e oportunidade de exportar (`FH-10.07`, `FH-11.09`).
> **Verificação:** existe aviso prévio, prazo e caminho de exportação antes de qualquer exclusão por inatividade? → SIM = cumpre | NÃO = viola.

**`FH-27.09`** — **Reativação** devolve o estado anterior. Retomar após suspensão ou
inadimplência **NUNCA** exige reconfigurar o que já existia.
> **Verificação:** reativar restaura o estado anterior sem reconfiguração? → SIM = cumpre | NÃO = viola.

**`FH-27.10`** — Nenhuma exclusão definitiva ocorre antes de a exportação estar
disponível e o usuário ter sido informado do que será perdido e quando.
> **Verificação:** houve exportação disponível e informação do que será perdido, antes da exclusão? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo governa os dois extremos temporais da conta: os **primeiros minutos**,
quando não há dado nenhum, e a **vida longa**, quando há volume, pessoas e
histórico. São os dois estados menos projetados na maioria dos produtos — porque o
desenvolvimento acontece sempre no meio: alguns dados, uma pessoa, tudo recente.

---

## 2. Perguntas que este capítulo responde

- Como o sistema se comporta sem dado nenhum?
- Devemos criar dados de exemplo?
- O que muda quando a conta cresce?
- O que muda quando entram mais pessoas?
- Como comunicar limites?
- O que acontece com quem fica inativo?
- Como tratar reativação?

---

## 3. Definições

**Estado inaugural** — conta recém-criada, sem nenhum dado.

**Dado de demonstração** — conteúdo criado pelo sistema para ilustrar o
funcionamento.

**Maturidade** — acúmulo de dados, pessoas, processos e histórico ao longo do tempo.

**Suspensão** — interrupção temporária do acesso, tipicamente por inadimplência.

**Reativação** — retomada do uso após suspensão ou inatividade.

---

## 4. Fundamento

**Por que o estado inaugural é sistematicamente mal projetado.** Quem constrói o
produto nunca o vê vazio depois da primeira semana — o ambiente de trabalho tem
dados de teste acumulados. O usuário novo, ao contrário, vê **apenas** o estado
vazio, e é a partir dele que forma sua primeira impressão. `FH-27.01` obriga a
projetar o estado que a equipe menos vê e o usuário mais vê no momento mais
decisivo.

**Por que dados de demonstração são perigosos.** Eles resolvem o problema do vazio e
criam três piores: o usuário não sabe o que é real; ele hesita em excluir; e, se
esquecer de excluir, dados falsos entram em relatórios e — no pior caso — em
comunicações. `FH-27.02` não os proíbe, mas impõe as duas condições que os tornam
seguros: identificação inequívoca e remoção em um passo. Um estado vazio bem
projetado (`FH-42`) quase sempre é a solução melhor.

**Por que a maturidade não muda o produto.** A tentação é evoluir a interface
conforme a conta cresce — mais recursos visíveis, atalhos novos, layout diferente.
Isso viola `FH-07.08` de forma grave: o mesmo gesto passa a produzir resultados
diferentes conforme a idade da conta, e o conhecimento de um usuário deixa de
servir a outro. O que legitimamente muda é o **conteúdo** (mais dados) e a
**oferta** (o produto sugere o que faz sentido agora).

**Por que limites são comunicados antes.** Descobrir um limite ao atingi-lo
significa descobri-lo no meio de uma tarefa — normalmente uma tarefa urgente, já que
é o volume que revela o limite. `FH-27.06` desloca a informação para quando ainda há
escolha, o que é a diferença entre informar e bloquear.

**Por que a conta madura não pode ser penalizada.** Contas grandes são as mais
valiosas e as que mais sofrem com degradação de desempenho, porque a degradação é
proporcional ao acúmulo. Um produto que fica mais lento conforme é mais usado pune
exatamente o comportamento que desejava — e a percepção do usuário é de que "o
sistema não aguenta".

**Por que inatividade e reativação exigem cuidado especial.** São momentos em que o
usuário não está olhando. Excluir dado de quem não está presente para reclamar é a
situação de maior assimetria de poder do ciclo de vida — e por isso `FH-27.08` e
`FH-27.10` são categóricos. A reativação, por sua vez, é a segunda chance: exigir
reconfiguração nesse momento é converter um retorno em desistência definitiva.

---

## 5. Princípios

**Projete o vazio: é o que o usuário novo vê.**

**Dado falso é dívida com juros.**

**A conta cresce; o produto permanece o mesmo.**

**Nunca destrua o que pertence a quem não está olhando.**

---

## 6. Regras normativas

### O que muda e o que não muda com a maturidade

| Dimensão | Muda com a maturidade? |
| --- | --- |
| Modelo mental (Capítulo 20) | **Nunca** |
| Navegação e posição de ações | **Nunca** |
| Vocabulário | **Nunca** |
| Densidade da tela | Não muda por conta; muda por **tipo de tela** (`FH-24.07`) |
| Volume de conteúdo | Sim |
| Ofertas e sugestões do produto | Sim, por relevância (`FH-55`) |
| Recursos disponíveis por plano | Sim, conforme direitos (`FH-51`) |

### `FH-27.01` — Estado inaugural

**Certo.** A tela vazia explica o que aparecerá ali, por que está vazia e qual é o
próximo passo útil — com a ação disponível ali mesmo.

**Errado.** Tela em branco, ou tela idêntica à populada, porém sem nada. O usuário
não sabe se o sistema está quebrado, carregando ou correto.

### `FH-27.02` — Dados de demonstração

**Quando NÃO aplicar.** Ambientes explicitamente de teste, isolados da conta real.

**Certo.** Exemplo claramente marcado, com remoção em um passo, e que nunca entra
em envio, relatório ou automação.

**Errado.** Contatos de exemplo indistinguíveis dos reais. Risco concreto: entrarem
em um disparo.

### `FH-27.06` — Limites antecipados

**Certo.** Aviso ao aproximar-se do limite, com o número exato, o prazo e o caminho
de ajuste.

**Errado.** Bloqueio no momento do uso, com a informação aparecendo pela primeira
vez ali.

### `FH-27.08` — Inatividade

**Certo.** Aviso com prazo declarado, exportação disponível, e um segundo aviso
antes da exclusão.

**Errado.** Exclusão silenciosa por política interna. Viola `FH-10.01` e `FH-11.09`.

---

## 7. Anti-padrões

**Vazio abandonado.** Tela sem dado e sem orientação.

**Demonstração contaminante.** Dados falsos misturados aos reais.

**Produto que muda com a idade.** Interface diferente para contas antigas.

**Limite-surpresa.** Bloqueio descoberto no momento do uso.

**Degradação por sucesso.** Sistema que piora conforme é mais usado.

**Exclusão silenciosa.** Dado destruído sem aviso a quem não está presente.

**Reativação-recomeço.** Voltar exige reconfigurar tudo.

---

## 8. Impactos

**Cognitivo.** O estado inaugural bem projetado ensina o modelo mental sem
tutorial: a tela vazia explica o que aquele lugar é.

**Emocional.** `FH-27.08` e `FH-27.10` protegem a confiança nos momentos de maior
vulnerabilidade do usuário — quando ele não está presente para se defender.

**Produtividade.** `FH-27.04` e `FH-27.05` removem custo nos dois momentos de maior
pressão: entrada de pessoas e crescimento.

**Percepção de qualidade.** Contas grandes que continuam rápidas são a prova mais
convincente de solidez que um produto pode oferecer.

**Curva de aprendizagem.** Como o produto não muda com a maturidade, o
conhecimento adquirido continua válido para sempre — e é transmissível entre
usuários de contas diferentes.

---

## 9. Riscos e trade-offs

**Risco: vazio pouco convincente.** Sem dados de demonstração, o usuário pode não
perceber o potencial. Mitigação: `FH-42` exige que o vazio explique e ofereça
caminho; o valor se demonstra pelo uso real, não pela ilustração.

**Risco: custo de desempenho constante.** Manter conta grande tão rápida quanto
pequena exige investimento contínuo. Custo assumido: é a promessa de `FH-27.07`.

**Risco: retenção de dados inativos.** Não excluir por inatividade aumenta custo de
armazenamento. Mitigação: `FH-27.08` não proíbe excluir; exige aviso, prazo e
exportação — e as obrigações de retenção legal continuam prevalecendo.

**Trade-off central.** Trocamos otimizações específicas por invariância. O produto
não se adapta à idade da conta — e por isso continua sendo o mesmo produto para
todos, o tempo inteiro.

---

## 10. Critérios de verificação

1. Toda tela é utilizável e orienta no estado inaugural.
2. Nenhum dado de exemplo pode ser confundido com dado real.
3. Modelo, navegação e posição de ações não mudam com a maturidade.
4. Novos membros trabalham no primeiro acesso, sem configurar.
5. Crescer não exige migração nem recriação manual.
6. Limites são comunicados antes de atingidos, com tempo de agir.
7. O desempenho percebido não se degrada com o volume acumulado.
8. Nenhuma exclusão por inatividade ocorre sem aviso, prazo e exportação.
9. Reativação restaura o estado anterior.
10. Nenhuma exclusão definitiva precede a disponibilidade de exportação.

---

## 11. Checklist do capítulo

- [ ] Testei a tela com a conta completamente vazia.
- [ ] Nenhum dado de exemplo se confunde com dado real.
- [ ] Testei com volume alto: modelo, navegação e desempenho iguais.
- [ ] Um novo membro consegue trabalhar sem configurar nada.
- [ ] Crescer não exige refazer nada.
- [ ] O limite é avisado antes, com tempo de agir.
- [ ] Nada é excluído sem aviso, prazo e exportação.
- [ ] Reativar devolve o estado anterior.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10 (promessas), 11 (ética), 25 (jornada), 26
(onboarding).

**É pré-requisito de.** Capítulos 36 (densidade e escala), 42 (estados vazios), 46
(desempenho percebido), 51 (permissões e limites).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Criação de conta e primeiro acesso | `src/app/(auth)/signup/`, `src/lib/onboarding/` |
| Estado inaugural das telas | Estados vazios em cada rota de `src/app/(dashboard)/` |
| Entrada de membros | `src/components/settings/invite-member-dialog.tsx` |
| Planos, direitos e limites | `src/lib/plans/`, `src/lib/consumption/`, `src/components/consumption/` |
| Cobrança e suspensão | `src/app/api/account/checkout/`, `src/lib/asaas/`, `docs/business-rules/billing-ciclo-cobranca-e-estornos.md` |
| Retenção e exclusão | `docs/business-rules/retencao-exclusao-inadimplencia.md` |
