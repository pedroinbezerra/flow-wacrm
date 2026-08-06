# Capítulo 25 — Jornada Completa

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 10, 11, 13, 17 |
| É pré-requisito de | Capítulos 26, 27, 64, 67 |
| Artigos | `FH-25.01` a `FH-25.10` |

---

## 0. Núcleo Normativo

**`FH-25.01`** — O **Primeiro Valor Real** — o momento em que o usuário obtém, pela
primeira vez, um resultado que ele reconhece como útil — **DEVE** ser declarado,
medido e alcançável **na primeira sessão**.
> **Verificação:** o Primeiro Valor Real está declarado e é alcançável na primeira sessão? → SIM = cumpre | NÃO = viola.

**`FH-25.02`** — Cada estágio da jornada (§5) **DEVE** ter obrigações declaradas do
produto. Estágio sem obrigação declarada é estágio não projetado.
> **Verificação:** as obrigações do produto neste estágio estão declaradas? → SIM = cumpre | NÃO = viola.

**`FH-25.03`** — Sinais de risco **DEVEM** produzir resposta do produto — melhoria,
oferta de ajuda, remoção de obstáculo — e **NUNCA** pressão, cobrança ou apelo
emocional (`FH-17.02`).
> **Verificação:** a resposta ao risco remove obstáculo ou pressiona o usuário? → Remove = cumpre | Pressiona = viola.

**`FH-25.04`** — **Saída digna.** Encerrar o uso **DEVE** ser possível a qualquer
momento, com exportação completa e sem obstáculo (`FH-10.07`, `FH-11.09`).
> **Verificação:** existe caminho de saída com exportação completa e sem fricção? → SIM = cumpre | NÃO = viola.

**`FH-25.05`** — O sistema **NUNCA** decide sozinho que o usuário "já passou" de um
estágio removendo apoios, alterando a interface ou mudando comportamento sem que
ele perceba (`FH-16.05`, `FH-18.11`).
> **Verificação:** houve mudança automática de comportamento por progressão inferida? → NÃO = cumpre | SIM = viola.

**`FH-25.06`** — Nenhuma funcionalidade **PODE** melhorar um estágio degradando
outro sem declaração explícita do impacto.
> **Verificação:** o impacto sobre os demais estágios está declarado? → SIM = cumpre | NÃO = viola.

**`FH-25.07`** — No **retorno após ausência**, o sistema reapresenta o contexto e o
que mudou. **NUNCA** cobra a ausência nem exibe acúmulo como falha do usuário.
> **Verificação:** o retorno informa contexto sem cobrar a ausência? → SIM = cumpre | NÃO = viola.

**`FH-25.08`** — **Expansão sem refazer.** Crescer — mais pessoas, mais volume, mais
processos — **NUNCA** exige refazer configuração já realizada nem migrar dados
manualmente.
> **Verificação:** crescer exige refazer configuração ou migração manual? → NÃO = cumpre | SIM = viola.

**`FH-25.09`** — Toda comunicação de ciclo de vida — boas-vindas, limite, cobrança,
inatividade, encerramento — segue a voz e a sobriedade dos Capítulos 9 e 57.
> **Verificação:** a comunicação segue a voz do produto e a sobriedade proporcional? → SIM = cumpre | NÃO = viola.

**`FH-25.10`** — As métricas da jornada **DEVEM** ser de **esforço e tempo até
valor**. Métricas de engajamento — tempo de tela, frequência de acesso, cliques por
sessão — **NUNCA** são objetivo de produto (`FH-17.07`, Capítulo 64).
> **Verificação:** a métrica usada mede esforço/tempo até valor, e não engajamento? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo mapeia a experiência do primeiro contato até o uso maduro e a
eventual saída, e declara **o que o produto deve fazer em cada estágio**. Ele
existe porque a maior parte das decisões de produto é tomada pensando no usuário
médio em regime permanente — que é uma minoria dos momentos que realmente decidem
a relação.

---

## 2. Perguntas que este capítulo responde

- Quais momentos decidem se o usuário fica?
- Onde as pessoas desistem?
- O que é sucesso em cada fase?
- Como reagir quando alguém está prestes a sair?
- Como tratar quem volta depois de sumir?
- Podemos dificultar a saída?

---

## 3. Definições

**Primeiro Valor Real** — primeiro resultado útil reconhecido pelo usuário. Não é
completar o cadastro, nem ver a interface: é obter algo que ele queria.

**Estágio** — fase da relação entre o usuário e o produto, com necessidades e
riscos próprios.

**Sinal de risco** — evidência observável de que a relação está se deteriorando.

**Expansão** — crescimento do uso: mais pessoas, mais volume, mais processos.

**Saída digna** — encerramento sem obstáculo, com dados preservados e exportáveis.

---

## 4. Fundamento

**Por que o Primeiro Valor Real é a métrica central.** Um usuário que ainda não
obteve valor não tem motivo para persistir diante de qualquer dificuldade. Cada
passo antes do primeiro valor é um ponto de abandono sem contrapartida — o usuário
está pagando sem ter recebido. Por isso `FH-25.01` exige que ele ocorra na primeira
sessão e que seja **declarado**: sem declaração, cada equipe otimiza um marco
diferente, e a maioria otimiza a conclusão do cadastro, que é valor para o sistema,
não para o usuário.

**Por que os estágios têm obrigações distintas.** As necessidades mudam
radicalmente. Quem chega precisa de orientação e de valor rápido; quem está em
rotina precisa de velocidade e estabilidade; quem está em risco precisa que o
obstáculo seja removido; quem sai precisa de seus dados. Otimizar o produto apenas
para a rotina — o estágio mais visível — deixa os quatro momentos decisivos sem
projeto.

**Por que risco não se responde com pressão.** A reação instintiva à queda de uso é
comunicar mais: lembrete, oferta, alerta. Isso trata o sintoma e agrava a causa —
se o usuário parou porque o produto não estava entregando valor, insistir apenas
adiciona irritação. `FH-25.03` obriga a resposta correta: descobrir e remover o
obstáculo, ou oferecer ajuda concreta.

**Por que o retorno não pode cobrar.** Quem volta depois de ausência encontra
acúmulo — conversas não respondidas, tarefas pendentes. Apresentar isso como
dívida produz culpa (`FH-17.02`) no exato momento em que a pessoa decidiu voltar.
A obrigação é reapresentar o contexto e o que mudou, de forma factual.

**Por que a expansão não pode exigir refazer.** O momento de crescimento é
justamente aquele em que o usuário tem menos tempo. Se crescer exige reconfigurar,
o custo aparece no pior momento possível — e a alternativa que ele considera é
trocar de ferramenta, já que reconfigurar seria necessário de qualquer forma.

**Por que a saída é digna.** Além do que já foi estabelecido nos Capítulos 10 e 11,
há um argumento adicional: quem sai bem volta, e quem sai bem recomenda. Retenção
por obstáculo converte um usuário neutro em detrator ativo, e o faz de forma
permanente.

---

## 5. Os oito estágios

| Estágio | Pergunta do usuário | Obrigação do produto | Sinal de sucesso | Sinal de risco |
| --- | --- | --- | --- | --- |
| **1. Descoberta** | Isto serve para mim? | Deixar claro o que o produto é, sem jargão (`FH-05.11`) | Entende em uma frase | Confusão de categoria |
| **2. Ativação** | Consigo começar? | Remover todo passo dispensável antes do primeiro uso (`FH-26.04`) | Chega ao produto sem ajuda | Abandono antes de entrar |
| **3. Primeiro Valor Real** | Isto funciona? | Entregar resultado útil na primeira sessão (`FH-25.01`) | Obtém resultado reconhecível | Sessão termina sem valor |
| **4. Rotina** | É rápido no dia a dia? | Velocidade, estabilidade, retomada (Capítulos 14, 16, 19) | Uso diário sem atrito | Fluxos abandonados |
| **5. Expansão** | Cresce comigo? | Crescer sem refazer (`FH-25.08`) | Novas pessoas e processos entram sem custo | Configuração refeita |
| **6. Maturidade** | Continua bom com volume? | Desempenho e densidade sob volume real (`FH-24.09`, `FH-27.07`) | Contas grandes funcionam igual | Lentidão proporcional ao volume |
| **7. Risco** | Ainda vale a pena? | Detectar obstáculo e removê-lo, sem pressionar (`FH-25.03`) | Uso retomado por melhoria | Queda respondida com insistência |
| **8. Saída** | Consigo sair? | Exportação completa, encerramento sem obstáculo (`FH-25.04`) | Sai com seus dados, sem atrito | Retenção por labirinto |

**Regra transversal.** Nenhum estágio é pulado por decisão do sistema
(`FH-25.05`). O usuário progride no ritmo dele, e o produto se comporta igual em
todos os estágios — o que muda é o que ele **oferece**, nunca o que ele **é**.

---

## 6. Regras normativas

### `FH-25.01` — Primeiro Valor Real

**Quando aplicar.** Em todo fluxo de entrada e em toda funcionalidade que possa
antecipar o primeiro valor.

**Quando NÃO aplicar.** Não obriga que **toda** capacidade seja alcançável na
primeira sessão — obriga que **uma** o seja, e que ela seja valiosa de verdade.

**Certo.** Declarar: "Primeiro Valor Real = responder uma conversa real pelo
FlowHub." Tudo que estiver entre a entrada e isso é candidato a remoção.

**Errado.** Tratar "conta criada" ou "tour concluído" como valor. São marcos do
sistema, não do usuário.

### `FH-25.03` — Resposta ao risco

**Certo.** Uso caiu após uma mudança: investigar o obstáculo, corrigir, informar o
que mudou.

**Errado.** Uso caiu: enviar sequência de lembretes. Trata o sintoma e adiciona
irritação.

### `FH-25.07` — Retorno

**Certo.** "Desde sua última visita: 14 conversas novas, 3 aguardando resposta."

**Errado.** "Você tem 14 conversas não lidas há 9 dias." A informação é a mesma; a
segunda cobra.

### `FH-25.10` — Métricas da jornada

**Certo.** Tempo até o Primeiro Valor Real; passos até concluir a tarefa
dominante; taxa de retomada bem-sucedida.

**Errado.** Tempo de tela por sessão. Em um produto que existe para reduzir
esforço, esse número subindo pode significar exatamente o fracasso.

---

## 7. Anti-padrões

**Valor adiado.** Cadastro, configuração e tour antes de qualquer resultado.

**Marco falso.** Celebrar conclusão de etapa administrativa como se fosse valor.

**Risco respondido com insistência.** Lembretes em vez de remoção de obstáculo.

**Cobrança de retorno.** Acúmulo apresentado como dívida.

**Crescimento punido.** Expansão exigindo reconfiguração.

**Saída por labirinto.** Encerramento com etapas de retenção.

**Otimizar só a rotina.** Quatro estágios decisivos sem projeto.

---

## 8. Impactos

**Cognitivo.** Estágios declarados evitam que o produto exija do iniciante o
conhecimento do veterano — e que ofereça ao veterano a orientação do iniciante.

**Emocional.** `FH-25.03` e `FH-25.07` protegem os dois momentos de maior
fragilidade emocional: quando o usuário está desistindo e quando ele volta.

**Produtividade.** `FH-25.08` protege o momento de maior custo de oportunidade: o
crescimento.

**Percepção de qualidade.** Produtos que tratam bem a saída são percebidos como
confiáveis — inclusive por quem fica, porque a saída digna sinaliza que a
permanência é por valor.

**Curva de aprendizagem.** O Primeiro Valor Real na primeira sessão é o que
transforma curiosidade em uso. Sem ele, a curva nunca começa.

---

## 9. Riscos e trade-offs

**Risco: obsessão pelo primeiro valor.** Otimizar demais a entrada pode empobrecer
a profundidade. Mitigação: `FH-25.06` exige declarar impacto sobre os demais
estágios.

**Risco: não agir diante do risco.** Proibir pressão pode levar à passividade.
Mitigação: `FH-25.03` exige resposta — o que muda é a natureza dela.

**Risco: churn facilitado.** Saída digna aumenta cancelamentos evitáveis.
Trade-off assumido, já registrado em `FH-10.07`.

**Trade-off central.** Trocamos otimização de métricas de curto prazo por
sustentação da relação. Alguns números pioram no trimestre; a permanência por valor
é o que se preserva.

---

## 10. Critérios de verificação

1. O Primeiro Valor Real está declarado e é alcançável na primeira sessão.
2. Todo estágio tem obrigações declaradas.
3. Nenhuma resposta a risco usa pressão ou apelo emocional.
4. Existe caminho de saída com exportação completa.
5. Nenhuma mudança de comportamento decorre de progressão inferida.
6. Toda funcionalidade declara impacto sobre os demais estágios.
7. O retorno informa contexto sem cobrar ausência.
8. Crescer não exige refazer configuração nem migração manual.
9. Toda comunicação de ciclo de vida segue a voz do produto.
10. Nenhuma métrica de engajamento é objetivo de produto.

---

## 11. Checklist do capítulo

- [ ] Sei qual é o Primeiro Valor Real e quanto tempo ele leva.
- [ ] Removi todo passo entre a entrada e ele.
- [ ] Declarei o impacto desta mudança sobre os oito estágios.
- [ ] A resposta ao risco remove obstáculo, não pressiona.
- [ ] O retorno após ausência informa sem cobrar.
- [ ] Crescer não exige refazer nada.
- [ ] A saída é possível, completa e sem obstáculo.
- [ ] Não estou medindo engajamento como sucesso.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (tese), 10 (promessas), 11 (ética), 13 (arquétipos), 17
(emoção).

**É pré-requisito de.** Capítulos 26 (onboarding), 27 (ciclo de vida da conta), 64
(métricas), 67 (evolução).

---

## 13. Aterrissagem

| Estágio | Onde vive hoje |
| --- | --- |
| Ativação e entrada | `src/app/(auth)/signup/`, `src/app/auth/callback/` |
| Primeiro Valor Real | `src/app/(dashboard)/welcome/`, `src/lib/onboarding/` |
| Rotina | `src/app/(dashboard)/inbox/` |
| Expansão | Convites em `src/components/settings/invite-member-dialog.tsx` |
| Maturidade e limites | `src/lib/plans/`, `src/lib/consumption/` |
| Análise de jornada | `src/lib/onboarding/ai-journey-insights.ts`, `src/app/(dashboard)/admin/onboarding-analytics/` |
| Saída | `src/app/(dashboard)/settings/`, `docs/business-rules/retencao-exclusao-inadimplencia.md` |
