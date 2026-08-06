# Capítulo 26 — Onboarding

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 13, 16, 25 |
| É pré-requisito de | Capítulos 27, 42, 55 |
| Artigos | `FH-26.01` a `FH-26.10` |

---

## 0. Núcleo Normativo

**`FH-26.01`** — É proibido **ensinar antes de entregar valor**. Nenhuma explicação,
tour ou instrução precede o Primeiro Valor Real (`FH-25.01`).
> **Verificação:** existe conteúdo instrucional antes do primeiro resultado útil? → NÃO = cumpre | SIM = viola.

**`FH-26.02`** — Onboarding é **configuração útil**, nunca apresentação do produto.
Cada passo **DEVE** produzir estado real e aproveitável depois.
> **Verificação:** este passo produz configuração real que permanece útil? → SIM = cumpre | NÃO = viola.

**`FH-26.03`** — Todo onboarding é **pulável sempre e recuperável sempre**: pode ser
abandonado a qualquer momento e retomado depois sem perda.
> **Verificação:** é possível pular agora e retomar depois sem perder o que já foi feito? → SIM = cumpre | NÃO = viola.

**`FH-26.04`** — Nenhum passo é obrigatório, exceto os **tecnicamente
indispensáveis** para que o produto funcione. Obrigatoriedade por conveniência de
dado é proibida (`FH-06.02`).
> **Verificação:** este passo obrigatório é indispensável para o funcionamento? → SIM = cumpre | NÃO = viola.

**`FH-26.05`** — O aprendizado **DEVE** estar embutido no uso. Qualquer conceito
necessário é ensinado no ponto onde ele importa, e não antes (`FH-06.08`,
`FH-16.08`).
> **Verificação:** o conceito é ensinado no ponto de uso, e não antecipadamente? → SIM = cumpre | NÃO = viola.

**`FH-26.06`** — O onboarding **DEVE** corresponder ao **arquétipo e ao papel** de
quem entra. Quem opera não recebe o percurso de quem configura a conta
(`FH-13.03`).
> **Verificação:** o percurso corresponde ao arquétipo e ao papel de quem entra? → SIM = cumpre | NÃO = viola.

**`FH-26.07`** — Quem entra em **conta já existente** tem percurso próprio: encontra
o ambiente pronto e é orientado apenas sobre o seu trabalho. **NUNCA** repete o
percurso de quem criou a conta.
> **Verificação:** o novo membro recebe percurso próprio, sem passos de criação de conta? → SIM = cumpre | NÃO = viola.

**`FH-26.08`** — **NUNCA** existirá tour bloqueante, sequência modal obrigatória ou
sobreposição que impeça o uso do produto.
> **Verificação:** algum elemento de onboarding impede o uso do produto? → NÃO = cumpre | SIM = viola.

**`FH-26.09`** — Progresso de onboarding **NUNCA** é apresentado como cobrança,
percentual de completude ou pendência (`FH-06.06`).
> **Verificação:** o progresso é exibido como cobrança ou completude? → NÃO = cumpre | SIM = viola.

**`FH-26.10`** — O onboarding **NUNCA** cria dados fictícios que se misturem aos
dados reais do usuário (`FH-27.02`).
> **Verificação:** algum dado criado pelo onboarding pode ser confundido com dado real? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo regula a entrada no produto **como parte do produto**, e não como
camada externa de apresentação. Ele define o que ensinar, o que não ensinar, e o
que fazer com quem não quer ser ensinado.

---

## 2. Perguntas que este capítulo responde

- O que ensinar e o que não ensinar?
- Tour é permitido?
- Quantos passos?
- O que fazer com quem pula?
- Como o produto ensina sem tutorial?
- Quem entra numa conta que já existe passa pelo mesmo caminho?

---

## 3. Definições

**Onboarding** — conjunto de ações que levam alguém do primeiro acesso ao uso
autônomo.

**Passo indispensável** — aquele sem o qual o produto tecnicamente não funciona
(conectar um canal, por exemplo).

**Passo de conveniência** — aquele que existe para preencher dados úteis ao
sistema. Nunca obrigatório.

**Tour** — sequência de explicações sobre a interface. Bloqueante é proibido
(`FH-26.08`).

**Percurso** — caminho de entrada específico de um arquétipo e papel.

---

## 4. Fundamento

**Por que valor vem antes de ensino.** Ninguém aprende algo cuja utilidade ainda
não percebeu. Ensinar antes de entregar valor é pedir investimento de atenção sem
contrapartida, num momento em que o usuário tem a menor motivação possível para
concedê-la. O resultado prático é conhecido: tours são pulados, e quem não pula não
retém — porque a informação chegou antes do contexto que a tornaria significativa.

**Por que onboarding é configuração, não apresentação.** Se cada passo produz estado
real — um canal conectado, um funil pronto, um membro convidado —, o tempo
investido pelo usuário permanece como trabalho feito. Se os passos são
explicativos, o tempo é gasto e nada resta. `FH-26.02` converte o onboarding de
custo em produção.

**Por que pular precisa ser sempre possível.** Uma parcela relevante dos usuários já
sabe o que quer fazer — vieram de outro produto, foram indicados, leram antes.
Obrigá-los a percorrer um caminho de iniciante é desrespeito e é o primeiro contato
do produto com eles. `FH-26.03` também protege o caso mais comum: a pessoa foi
interrompida e precisa voltar depois.

**Por que tour bloqueante é proibido.** Ele inverte a relação: em vez de o produto
servir ao usuário, o usuário serve ao roteiro. Além disso, tours bloqueantes
ensinam **posições**, e posições mudam; o que precisa ser ensinado é o **modelo**
(Capítulo 20), que se aprende usando.

**Por que o percurso varia por papel.** Quem cria a conta configura; quem é
convidado opera. Dar ao segundo o percurso do primeiro produz duas falhas
simultâneas: pede decisões que ele não pode tomar (permissão) e adia o trabalho que
ele veio fazer. `FH-26.07` é a aplicação direta de `FH-13.03`.

**Por que progresso não é cobrança.** Um indicador de completude transforma o
onboarding em dívida e produz o efeito descrito em `FH-06.06`: preenchimento de
baixa qualidade para calar o medidor. Se um passo importa, ele aparece quando
importa; se não importa a ponto de aparecer, não deveria ser cobrado.

---

## 5. Princípios

**Ninguém aprende o que ainda não precisou.**

**Todo minuto de onboarding deve deixar trabalho feito.**

**Pular é um direito, não uma falha.**

**Ensina-se o modelo, não a posição dos botões.**

---

## 6. Regras normativas

### Estrutura obrigatória do onboarding

| Momento | O que o produto faz | O que **não** faz |
| --- | --- | --- |
| Entrada | Leva ao trabalho pelo caminho mais curto | Apresenta o produto |
| Passos indispensáveis | Apenas o que impede o funcionamento | Coleta dados "úteis para depois" |
| Primeiro Valor Real | Entrega resultado reconhecível | Celebra a conclusão do cadastro |
| Depois | Oferece o próximo passo útil, no ponto de uso | Retoma sequência linear |
| A qualquer momento | Permite pular e retomar | Bloqueia, insiste, cobra |

### `FH-26.01` — Valor antes de ensino

**Quando NÃO aplicar.** Quando o conceito é externo e obrigatório — regras de um
canal, exigência de um provedor, obrigação legal. Aí a explicação é necessária, e
deve aparecer no ponto de uso, com o motivo.

**Certo.** A primeira tela útil já permite trabalhar; o que precisa ser configurado
aparece quando é necessário.

**Errado.** Cinco telas explicando funcionalidades antes de qualquer uso.

### `FH-26.04` — Obrigatoriedade mínima

**Certo.** Conectar o canal é indispensável para enviar mensagens — logo, é
obrigatório **no momento de enviar**, não na entrada.

**Errado.** Exigir o preenchimento do perfil da empresa antes de permitir qualquer
uso. Nada nele impede o produto de funcionar.

### `FH-26.07` — Entrada em conta existente

**Certo.** O convidado encontra o ambiente pronto e é orientado sobre seu trabalho:
onde estão suas conversas, como responder, o que é dele.

**Errado.** Pedir ao convidado que configure canal, funil ou plano — decisões que
não são dele e que já foram tomadas.

---

## 7. Anti-padrões

**Tour de boas-vindas.** Sequência explicativa antes do uso.

**Cadastro-pedágio.** Formulário longo antes de qualquer valor.

**Checklist de completude.** Progresso como cobrança.

**Onboarding único.** Mesmo percurso para quem cria a conta e para quem é
convidado.

**Dados de brinquedo.** Registros fictícios misturados aos reais.

**Ensino de posição.** Explicar onde ficam os botões em vez do modelo.

**Sem retorno.** Onboarding que, uma vez pulado, some para sempre.

---

## 8. Impactos

**Cognitivo.** Ensinar no ponto de uso alinha informação e contexto, que é a única
condição em que a retenção acontece.

**Emocional.** Ausência de cobrança e possibilidade de pular comunicam respeito
logo no primeiro contato — o momento em que o produto define como será a relação.

**Produtividade.** `FH-26.02` transforma o tempo de entrada em trabalho realizado,
em vez de custo afundado.

**Percepção de qualidade.** Produtos que exigem tour são percebidos como
complicados; produtos que dispensam tour são percebidos como bem desenhados —
independentemente da complexidade real.

**Curva de aprendizagem.** O onboarding não encurta a curva: ele determina se ela
começa. Um usuário que abandona antes do primeiro valor nunca entra na curva.

---

## 9. Riscos e trade-offs

**Risco: subconfiguração.** Sem passos obrigatórios, contas podem ficar
incompletas. Mitigação: `FH-26.05` — o que falta aparece quando é necessário, com
o motivo, e não antes.

**Risco: descoberta insuficiente.** Sem tour, capacidades podem passar
despercebidas. Mitigação: `FH-16.08` e `FH-16.04` colocam a descoberta no ponto de
uso; se algo só é descoberto por tour, o problema é a exposição.

**Risco: percursos múltiplos.** Um percurso por arquétipo aumenta a manutenção.
Mitigação: os percursos diferem no que **oferecem**, não no que **são** — o produto
continua único (`FH-13.05`).

**Trade-off central.** Trocamos controle sobre a primeira impressão por respeito ao
tempo do usuário. Não conseguimos garantir que ele veja tudo. Em troca, o que ele
vê, ele usa.

---

## 10. Critérios de verificação

1. Nenhum conteúdo instrucional precede o Primeiro Valor Real.
2. Todo passo produz configuração real e aproveitável.
3. Todo onboarding é pulável e recuperável sem perda.
4. Todo passo obrigatório é tecnicamente indispensável.
5. Conceitos são ensinados no ponto de uso.
6. O percurso corresponde ao arquétipo e ao papel.
7. Novos membros de conta existente têm percurso próprio.
8. Nenhum elemento de onboarding bloqueia o uso.
9. Nenhum progresso é exibido como cobrança.
10. Nenhum dado fictício se mistura aos dados reais.

---

## 11. Checklist do capítulo

- [ ] Nada é ensinado antes do primeiro valor.
- [ ] Cada passo deixa configuração real feita.
- [ ] Dá para pular agora e voltar depois.
- [ ] Os passos obrigatórios são indispensáveis de verdade.
- [ ] Os conceitos aparecem onde importam.
- [ ] O percurso do convidado é diferente do de quem criou a conta.
- [ ] Nada bloqueia o uso.
- [ ] Não há barra de completude nem cobrança.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (`FH-06.06`, `FH-06.08`), 13 (arquétipos), 16
(descoberta), 25 (Primeiro Valor Real).

**É pré-requisito de.** Capítulos 27 (ciclo de vida), 42 (estados vazios), 55
(personalização).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Fluxo de entrada | `src/app/(auth)/signup/`, `src/app/auth/callback/route.ts` |
| Primeira experiência | `src/app/(dashboard)/welcome/`, `src/components/onboarding/welcome-screen.tsx` |
| Lógica de onboarding | `src/lib/onboarding/` |
| Entrada de novo membro | `src/components/settings/invite-member-dialog.tsx` |
| Ajuda no ponto de uso | `src/components/ui/contextual-help.tsx` |
| Métricas de entrada | `src/app/(dashboard)/admin/onboarding-analytics/` |
