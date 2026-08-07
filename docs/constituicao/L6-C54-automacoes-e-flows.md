# Capítulo 54 — Automações e Flows

| Campo | Valor |
| --- | --- |
| Livro | VI — Inteligência |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 11, 13, 18, 41, 44, 45, 49, 51 |
| É pré-requisito de | Capítulos 55, 62 |
| Artigos | `FH-54.01` a `FH-54.11` |

> É a funcionalidade de **maior poder e maior risco** do produto: age sozinha, em
> escala, sobre pessoas que não usam o sistema.

---

## 0. Núcleo Normativo

**`FH-54.01`** — **Legibilidade antes de execução.** Toda automação **DEVE** poder
ser lida e compreendida na linguagem do usuário, sem conceitos técnicos
(`FH-13.08`).
> **Verificação:** alguém que não é técnico consegue ler e entender o que esta automação fará? → SIM = cumpre | NÃO = viola.

**`FH-54.02`** — **Pré-visualização obrigatória.** Antes de ativar, o usuário
**DEVE** poder ver o que aconteceria: quais itens seriam afetados e quais ações
ocorreriam (`FH-18.06`, `FH-49.02`).
> **Verificação:** existe pré-visualização do efeito antes da ativação? → SIM = cumpre | NÃO = viola.

**`FH-54.03`** — **Ativação consciente.** Automação entra desligada e só passa a
agir por ato explícito do usuário (`FH-18.08`).
> **Verificação:** a automação entra desligada e exige ativação explícita? → SIM = cumpre | NÃO = viola.

**`FH-54.04`** — O **histórico de execução** **DEVE** ser compreensível por não
técnicos: o que ocorreu, sobre quem, quando e por qual regra (`FH-18.03`).
> **Verificação:** o histórico é legível sem conhecimento técnico? → SIM = cumpre | NÃO = viola.

**`FH-54.05`** — Falha **DEVE** ser visível e recuperável, com reprocessamento
seletivo do que falhou (`FH-44.08`, `FH-49.03`).
> **Verificação:** falhas são visíveis e reprocessáveis individualmente? → SIM = cumpre | NÃO = viola.

**`FH-54.06`** — Toda automação **DEVE** ter **limites de segurança** declarados
contra efeito em massa: teto de execuções, janela de tempo ou ambos (`FH-49.06`).
> **Verificação:** existem limites de segurança declarados? → SIM = cumpre | NÃO = viola.

**`FH-54.07`** — Alteração em automação **ativa** **DEVE** declarar o efeito sobre
execuções em curso e ser versionada, preservando o histórico da versão anterior.
> **Verificação:** a alteração é versionada e declara o efeito sobre execuções em curso? → SIM = cumpre | NÃO = viola.

**`FH-54.08`** — Automação **NUNCA** age fora do escopo da conta que a criou
(`FH-10.06`, `FH-51.10`).
> **Verificação:** existe caminho pelo qual a automação alcance dado de outra conta? → NÃO = cumpre | SIM = viola.

**`FH-54.09`** — Automação que **envia a terceiros** segue integralmente
`FH-45.07` e `FH-11.03`: resumo de alcance, confirmação na ativação, respeito
absoluto à recusa do destinatário e nenhuma promessa de reversão.
> **Verificação:** o tratamento de terceiros foi aplicado integralmente? → SIM = cumpre | NÃO = viola.

**`FH-54.10`** — Toda automação tem **responsável identificável**: quem criou, quem
ativou e quem alterou por último.
> **Verificação:** os três responsáveis são identificáveis? → SIM = cumpre | NÃO = viola.

**`FH-54.11`** — **Pausa de emergência** **DEVE** estar sempre disponível, em um
passo, a partir de qualquer ponto onde a automação apareça.
> **Verificação:** é possível pausar em um passo, de qualquer lugar onde ela apareça? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define a construção, a operação e a observabilidade de processos
automatizados. Ele existe porque automação concentra simultaneamente o maior ganho
de produtividade do produto e o maior potencial de dano irreversível.

---

## 2. Perguntas que este capítulo responde

- Como alguém constrói uma automação sem ser programador?
- Como entende o que ela fará antes de ativar?
- Como vê o que aconteceu?
- Como conserta quando falha?
- Como evito que uma automação cause dano em massa?

---

## 3. Definições

**Automação** — regra que executa ações quando uma condição ocorre.

**Flow** — representação visual encadeada de etapas de uma automação.

**Execução** — instância concreta de uma automação, sobre itens específicos.

**Pré-visualização** — demonstração do efeito antes da ativação.

**Limite de segurança** — teto declarado que impede execução acima de determinada
escala.

**Pausa de emergência** — interrupção imediata de todas as execuções.

---

## 4. Fundamento

**Por que legibilidade vem primeiro.** Uma automação que não pode ser lida não pode
ser avaliada — e será ativada por confiança, não por compreensão. Quando ela agir
de forma inesperada, ninguém saberá dizer se está certa ou errada. `FH-54.01`
conecta este capítulo a `FH-13.08`: o Construtor não é programador, e exigir que
ele pense como um transfere ao usuário a complexidade que pertence ao sistema
(P1).

**Por que pré-visualização é obrigatória.** É a diferença entre confiança informada
e aposta. O usuário construiu uma regra em abstrato; a pré-visualização mostra o
concreto — quantos itens, quais, o que aconteceria. É também onde erros de
condição aparecem antes de custarem alguma coisa. Sem ela, `FH-18.06`
(previsibilidade antes de poder) não é cumprível.

**Por que entra desligada.** Automação ligada por padrão age antes de o usuário
entender o que ela faz, e a primeira execução de uma regra mal compreendida é
justamente a que causa dano. `FH-54.03` inverte o ônus.

**Por que o histórico precisa ser legível.** Quando algo dá errado, o histórico é a
única fonte de verdade sobre o que aconteceu. Se ele for técnico, o usuário
precisará de suporte para entender o próprio processo — e a automação deixa de ser
dele. Um histórico legível permite que ele corrija sozinho.

**Por que limites de segurança são obrigatórios.** Uma condição mal escrita pode
alcançar a base inteira. Quando há envio, o efeito é externo e irreversível, e
atinge pessoas que não usam o produto (`FH-11`). O limite não impede o uso
legítimo — impede que ele ocorra por acidente, sem etapa de consciência.

**Por que alteração em automação ativa é versionada.** Editar uma regra que está
executando produz um estado ambíguo: parte das execuções seguiu a versão antiga,
parte a nova. Sem versionamento, o histórico se torna incoerente e a investigação
de um problema fica impossível.

**Por que a pausa é sempre em um passo.** Quando algo dá errado em automação, o
tempo importa: cada minuto multiplica o dano. Uma pausa que exija navegar até uma
área específica é uma pausa que chega tarde.

---

## 5. Princípios

**O que não pode ser lido não pode ser avaliado.**

**Ver o concreto antes de ativar o abstrato.**

**Automação entra desligada; a decisão de ligar é do humano.**

**Em incidente, o tempo é o dano — pausar é sempre um passo.**

---

## 6. Regras normativas

### Ciclo de vida da automação

| Etapa | Obrigação | Artigo |
| --- | --- | --- |
| 1. Construção | Linguagem do usuário, sem conceito técnico | `FH-54.01` |
| 2. Pré-visualização | Efeito concreto sobre itens reais | `FH-54.02` |
| 3. Ativação | Explícita; entra desligada | `FH-54.03` |
| 4. Execução | Dentro dos limites de segurança | `FH-54.06` |
| 5. Registro | Histórico legível por não técnicos | `FH-54.04` |
| 6. Falha | Visível, com reprocessamento seletivo | `FH-54.05` |
| 7. Alteração | Versionada, com efeito declarado | `FH-54.07` |
| 8. Interrupção | Pausa em um passo, de qualquer lugar | `FH-54.11` |

### `FH-54.02` — Conteúdo da pré-visualização

| Elemento | Obrigatório |
| --- | --- |
| Quantos itens seriam afetados agora | Sim |
| Quais itens (amostra identificável) | Sim |
| Quais ações ocorreriam, na ordem | Sim |
| O que é irreversível | Sim, quando houver |
| O que seria ignorado e por quê | Sim, quando houver |

### `FH-54.09` — Automação com envio a terceiros

Categoria de maior risco do produto. Exige, cumulativamente: pré-visualização com
alcance; confirmação explícita na ativação; verificação de recusa do destinatário a
cada execução (`FH-11.03`); limite de segurança; e ausência de qualquer promessa de
reversão após o início.

---

## 7. Anti-padrões

**Automação ilegível.** Regra compreensível apenas por quem a escreveu.

**Ativação às cegas.** Ligar sem ver o efeito.

**Ligada por padrão.** Agindo antes de ser compreendida.

**Histórico técnico.** Registro que exige suporte para ser lido.

**Falha silenciosa.** Execução que erra e não aparece.

**Sem teto.** Automação capaz de alcançar a base inteira por engano.

**Edição em voo.** Alteração sem versionamento nem declaração de efeito.

**Pausa distante.** Interrupção que exige navegação.

**Autoria anônima.** Ninguém sabe quem criou ou ativou.

---

## 8. Impactos

**Cognitivo.** Pré-visualização substitui simulação mental por observação — a
diferença entre supor e ver.

**Emocional.** Automação é a funcionalidade que mais gera receio. Legibilidade,
pré-visualização e pausa convertem esse receio em confiança operacional.

**Produtividade.** É o maior multiplicador do produto: transforma trabalho
repetitivo em regra executada sozinha.

**Percepção de qualidade.** Histórico legível e reprocessamento seletivo são sinais
raros de maturidade — a maioria dos produtos entrega logs técnicos.

**Curva de aprendizagem.** Pré-visualização é a forma mais eficaz de ensinar
automação: o usuário aprende vendo o efeito antes de assumi-lo.

---

## 9. Riscos e trade-offs

**Risco: dano em massa.** É o risco central. Mitigado por pré-visualização,
ativação consciente, limites de segurança, categoria própria para terceiros e pausa
imediata.

**Risco: fricção na construção.** As etapas tornam criar automação mais lento.
Trade-off assumido: a etapa cara é a que evita o incidente.

**Risco: custo de versionamento.** Manter histórico por versão exige estrutura.
Custo assumido: sem ele, a investigação de incidentes é impossível.

**Trade-off central.** Trocamos agilidade de automação por segurança operacional. A
automação demora mais para entrar em produção — e não destrói uma base por engano.

---

## 10. Critérios de verificação

1. Toda automação é legível por não técnicos.
2. Existe pré-visualização do efeito antes da ativação.
3. Toda automação entra desligada e exige ativação explícita.
4. O histórico de execução é compreensível sem conhecimento técnico.
5. Falhas são visíveis e reprocessáveis seletivamente.
6. Existem limites de segurança declarados.
7. Alterações em automações ativas são versionadas e declaram efeito.
8. Nenhuma automação alcança dado de outra conta.
9. Automações com envio a terceiros seguem o tratamento integral.
10. Criador, ativador e último editor são identificáveis.
11. A pausa de emergência está a um passo, de qualquer lugar.

---

## 11. Checklist do capítulo

- [ ] Alguém não técnico lê e entende o que isto faz.
- [ ] Vi a pré-visualização com itens reais antes de ativar.
- [ ] Ela entra desligada.
- [ ] O histórico é legível.
- [ ] Consigo ver e reprocessar só o que falhou.
- [ ] Existe teto de execuções ou janela.
- [ ] Se envia a terceiros, apliquei `FH-45.07` e `FH-11.03`.
- [ ] Consigo pausar em um passo, de onde eu estiver.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 11 (`FH-11.03`), 13 (`FH-13.08`), 18 (autonomia), 41
(estados), 44 (erros), 45 (`FH-45.07`), 49 (lote), 51 (permissões).

**É pré-requisito de.** Capítulos 55 (personalização), 62 (qualidade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Construtor visual | `src/components/flows/flow-builder.tsx` |
| Motor de automações | `src/lib/automations/`, `src/lib/flows/` |
| Histórico de execução | `src/app/(dashboard)/automations/[id]/logs/`, `flows/[id]/runs/` |
| Agendamento e execução | `docs/automations-and-cron.md` |
| Limites e cotas | `src/lib/rate-limit.ts`, `src/lib/consumption/` |
| Envio a terceiros | `src/lib/whatsapp/`, `src/lib/broadcast-status.ts` |
