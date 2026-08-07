# Capítulo 53 — Padrões de Interação com IA

| Campo | Valor |
| --- | --- |
| Livro | VI — Inteligência |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 18, 40, 43, 46, 52 |
| É pré-requisito de | Capítulos 54, 55 |
| Artigos | `FH-53.01` a `FH-53.10` |

---

## 0. Núcleo Normativo

**`FH-53.01`** — Toda sugestão **DEVE** responder três perguntas: **o que é**, **de
onde veio** e **o que acontece se eu aceitar** (`FH-17.09`).
> **Verificação:** as três perguntas estão respondidas na própria sugestão? → SIM = cumpre | NÃO = viola.

**`FH-53.02`** — Aceitar uma sugestão **DEVE** sempre permitir edição antes do
efeito. Aceite que executa direto é proibido quando há efeito externo
(`FH-52.03`).
> **Verificação:** o usuário pode editar antes de o efeito ocorrer? → SIM = cumpre | NÃO = viola.

**`FH-53.03`** — Recusar uma sugestão **NUNCA** tem custo, penalidade ou
insistência. A recusa é sinal de aprendizado, não falha do usuário.
> **Verificação:** recusar custa algo ou provoca nova insistência? → NÃO = cumpre | SIM = viola.

**`FH-53.04`** — Conteúdo gerado **DEVE** ser distinguível de conteúdo humano até
ser revisado e assumido pelo usuário (`FH-06.10`).
> **Verificação:** é possível distinguir o gerado do humano antes da revisão? → SIM = cumpre | NÃO = viola.

**`FH-53.05`** — A espera por resultado de IA **NUNCA** bloqueia o trabalho
(`FH-46.06`, `FH-43.08`).
> **Verificação:** o usuário pode continuar trabalhando enquanto a IA responde? → SIM = cumpre | NÃO = viola.

**`FH-53.06`** — A frequência de sugestões **DEVE** ter limite. Sugestão que vira
rotina previsível deixa de ser útil e passa a ser ruído (`FH-07.07`).
> **Verificação:** existe limite de frequência declarado para esta sugestão? → SIM = cumpre | NÃO = viola.

**`FH-53.07`** — Sugestão incorreta **DEVE** ser corrigível ou descartável em **um
passo**, sem sair do contexto.
> **Verificação:** corrigir ou descartar exige mais de um passo? → NÃO = cumpre | SIM = viola.

**`FH-53.08`** — A IA **NUNCA** simula identidade humana. Em comunicação com
terceiros, **NUNCA** se apresenta como pessoa nem permite que o destinatário
acredite estar falando com uma (`FH-09.07`, `FH-11.01`).
> **Verificação:** algum texto sugere ao destinatário que a IA é uma pessoa? → NÃO = cumpre | SIM = viola.

**`FH-53.09`** — Entrada em linguagem natural **NUNCA** é o único caminho para uma
capacidade. Sempre existe caminho estruturado equivalente (`FH-52.09`).
> **Verificação:** existe caminho sem linguagem natural para esta capacidade? → SIM = cumpre | NÃO = viola.

**`FH-53.10`** — Toda interação com IA **DEVE** deixar registro auditável de
entrada, contexto e saída, sujeito às regras de retenção (`FH-18.03`,
`FH-11.11`).
> **Verificação:** existe registro auditável da interação? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo padroniza **como a inteligência aparece, sugere, é aceita, recusada
e corrigida**. Ele transforma os princípios do Capítulo 52 em comportamento
observável.

---

## 2. Perguntas que este capítulo responde

- Como apresento uma sugestão?
- Como o usuário aceita, edita ou recusa?
- Como aprendo com a recusa?
- Como diferencio texto gerado de texto humano?
- Como espero por uma resposta lenta sem travar o trabalho?

---

## 3. Definições

**Sugestão** — resultado oferecido pela IA, não aplicado.

**Aceite** — ato de incorporar a sugestão ao trabalho.

**Recusa** — ato de descartar a sugestão.

**Conteúdo assumido** — conteúdo gerado que o usuário revisou e adotou como seu.

**Registro auditável** — entrada, contexto e saída consultáveis.

---

## 4. Fundamento

**Por que a sugestão explica sua origem.** Sem saber de onde veio, o usuário não
consegue avaliar se a sugestão faz sentido — e a única postura racional passa a ser
verificar tudo, o que custa mais do que fazer manualmente. A origem transforma a
sugestão de "acredite" em "confira rapidamente".

**Por que recusar não pode custar.** Se recusar exigir passos, gerar confirmação ou
provocar nova insistência, o usuário aprende a evitar acionar a IA. A recusa
precisa ser tão barata quanto o aceite — e ela é a informação mais valiosa que a
interação produz, porque indica onde o modelo erra.

**Por que conteúdo gerado é marcado até ser assumido.** A marcação protege dois
lados: o usuário sabe o que ainda precisa revisar, e a equipe sabe o que foi
produzido por modelo. Depois da revisão, o conteúdo passa a ser dele — e continuar
marcando seria desconfiança desnecessária, além de sugerir ao destinatário algo
sobre a origem que não lhe diz respeito.

**Por que espera não bloqueia.** Modelos são lentos e sua latência varia. Bloquear a
interface durante a geração transfere ao usuário o custo dessa variabilidade e faz
o produto inteiro parecer lento — quando apenas uma camada opcional está demorando.

**Por que limitar frequência.** Sugestão constante deixa de ser oferta e vira ruído
de fundo: o usuário para de ler e passa a descartar por reflexo. Nesse ponto, a
sugestão útil também é descartada. É o mesmo mecanismo de `FH-45.04` aplicado à
inteligência.

**Por que a IA nunca simula pessoa.** Para o destinatário — que não é usuário do
produto e não escolheu essa interação —, acreditar estar falando com uma pessoa é
engano induzido, proibido por `FH-11.01`. Além disso, expõe o usuário: a
descoberta posterior danifica a relação dele com o próprio cliente.

**Por que linguagem natural nunca é o único caminho.** Interface conversacional é
imprecisa, difícil de repetir e inacessível para parte dos usuários. Como caminho
adicional, amplia; como caminho único, exclui e torna a capacidade dependente da
disponibilidade do modelo (`FH-52.09`).

---

## 5. Princípios

**Sugestão sem origem exige verificação total — e verificação total anula o ganho.**

**Recusar precisa custar tão pouco quanto aceitar.**

**Marcado até ser revisado; do usuário depois disso.**

**Conversar amplia; conversar como único caminho exclui.**

---

## 6. Regras normativas

### Anatomia da sugestão (`FH-53.01`)

| Elemento | Responde | Exemplo de conteúdo |
| --- | --- | --- |
| **O que é** | Que tipo de resultado é este | "Rascunho de resposta" |
| **De onde veio** | Qual contexto foi usado | "Baseado nas últimas mensagens desta conversa" |
| **O que acontece se aceitar** | Qual o efeito do aceite | "O texto vai para o campo de resposta; nada é enviado" |

### Ciclo obrigatório da sugestão

| Etapa | Obrigação | Artigo |
| --- | --- | --- |
| 1. Oferta | Anatomia completa; frequência limitada | `FH-53.01`, `FH-53.06` |
| 2. Espera | Não bloqueante | `FH-53.05` |
| 3. Aceite | Sempre editável antes do efeito | `FH-53.02` |
| 4. Recusa | Um passo, sem custo, sem insistência | `FH-53.03`, `FH-53.07` |
| 5. Revisão | Marcado até ser assumido | `FH-53.04` |
| 6. Registro | Entrada, contexto e saída auditáveis | `FH-53.10` |

### `FH-53.08` — Sem identidade simulada

**Certo.** O usuário revisa e envia como ele mesmo; o sistema não se apresenta ao
destinatário.

**Errado.** Assistente automático conversando com o cliente final como se fosse um
atendente humano — viola também `FH-52.03`.

---

## 7. Anti-padrões

**Sugestão sem origem.** "Sugerimos isto" sem dizer com base em quê.

**Aceite cego.** Aceitar executa direto, sem revisão.

**Recusa cara.** Descartar exige confirmação ou passos.

**Insistência.** A mesma sugestão retornando após recusa.

**Espera bloqueante.** Interface travada durante a geração.

**Gerado indistinguível.** Conteúdo de modelo com aparência de conteúdo humano.

**Persona artificial.** IA se apresentando como pessoa.

**Só conversa.** Capacidade acessível apenas por linguagem natural.

---

## 8. Impactos

**Cognitivo.** A anatomia da sugestão substitui verificação por conferência rápida
— o usuário avalia a origem, não o conteúdo inteiro.

**Emocional.** Recusa barata preserva a sensação de controle; insistência produz a
sensação de estar sendo empurrado.

**Produtividade.** Espera não bloqueante mantém o fluxo enquanto o modelo trabalha
— o ganho é integral, sem o custo da latência.

**Percepção de qualidade.** IA transparente é percebida como competente; IA opaca é
percebida como imprevisível, mesmo quando acerta mais.

**Curva de aprendizagem.** Sugestões com origem visível ensinam o que o sistema
sabe e o que ele consegue fazer, sem documentação.

---

## 9. Riscos e trade-offs

**Risco: verbosidade.** Explicar origem e efeito em toda sugestão adiciona texto.
Mitigação: o Capítulo 58 limita extensão; três elementos cabem em uma linha e uma
dica.

**Risco: subaproveitamento.** Limitar frequência reduz exposição da IA. Trade-off
assumido: sugestão constante é descartada por reflexo, o que reduz o
aproveitamento a zero.

**Risco: custo de registro.** Auditar toda interação gera volume. Mitigação:
`FH-11.11` e a política de retenção definem prazos.

**Trade-off central.** Trocamos fluidez conversacional por controle e
rastreabilidade. A IA parece menos mágica — e pode ser usada em trabalho real, com
clientes reais.

---

## 10. Critérios de verificação

1. Toda sugestão responde às três perguntas.
2. Todo aceite permite edição antes do efeito.
3. Recusar não custa nada nem gera insistência.
4. Conteúdo gerado é distinguível até ser assumido.
5. Nenhuma espera de IA bloqueia o trabalho.
6. Toda sugestão tem limite de frequência declarado.
7. Corrigir ou descartar leva um passo.
8. Nenhum texto sugere que a IA é uma pessoa.
9. Toda capacidade tem caminho sem linguagem natural.
10. Toda interação deixa registro auditável.

---

## 11. Checklist do capítulo

- [ ] A sugestão diz o que é, de onde veio e o que acontece se eu aceitar.
- [ ] Posso editar antes de qualquer efeito.
- [ ] Recusar é um passo e não volta a insistir.
- [ ] O conteúdo gerado está marcado até eu revisar.
- [ ] Continuo trabalhando enquanto a IA responde.
- [ ] Existe limite de frequência.
- [ ] Nada faz o destinatário pensar que fala com uma pessoa.
- [ ] Existe caminho estruturado equivalente.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (`FH-09.07`), 18 (autonomia), 40 (frequência), 43
(feedback), 46 (espera), 52 (princípios).

**É pré-requisito de.** Capítulos 54 (automações), 55 (personalização).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Sugestões na conversa | `src/components/ai/`, `src/components/inbox/` |
| Serviço de IA | `src/lib/ai-service/` |
| Superfície dedicada | `src/app/(dashboard)/ai-assistant/` |
| Registro e retenção | `docs/business-rules/retencao-logs-ia-e-provedor-externo.md` |
| Textos de IA | Chave `aiAssistant` em `src/i18n/messages/pt-BR.json` |
