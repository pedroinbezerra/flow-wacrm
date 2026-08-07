# Capítulo 46 — Desempenho Percebido

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P9, P10), 14, 27, 41, 43 |
| É pré-requisito de | Capítulos 47, 49, 50, 64 |
| Artigos | `FH-46.01` a `FH-46.10` |

---

## 0. Núcleo Normativo

**`FH-46.01`** — Cada faixa de espera tem resposta obrigatória (§5). Nenhuma espera
ocorre sem a resposta correspondente à sua duração.
> **Verificação:** a resposta corresponde à faixa de duração da espera? → SIM = cumpre | NÃO = viola.

**`FH-46.02`** — Quando a forma do conteúdo é conhecida, o carregamento **DEVE**
reproduzir essa forma. Indicador genérico só é permitido quando a forma final é
imprevisível.
> **Verificação:** a forma final é conhecida? Se SIM, o carregamento a reproduz? → SIM = cumpre | NÃO = viola.

**`FH-46.03`** — Todo espaço de conteúdo futuro **DEVE** ser reservado
antecipadamente. Nenhum elemento desloca conteúdo já visível ao chegar
(`FH-41.04`).
> **Verificação:** a chegada do conteúdo desloca algo já visível? → NÃO = cumpre | SIM = viola.

**`FH-46.04`** — **Progresso honesto.** Barra, percentual e estimativa só existem
quando derivam de medição real. Progresso inventado é proibido (`FH-07.10`).
> **Verificação:** o progresso exibido deriva de medição real? → SIM = cumpre | NÃO = viola.

**`FH-46.05`** — Antecipação de dado provável — carregar antes de o usuário pedir —
é permitida **desde que** não altere estado, não produza efeito externo e não
consuma recurso cobrado do usuário.
> **Verificação:** a antecipação altera estado, produz efeito externo ou consome recurso cobrado? → NÃO = cumpre | SIM = viola.

**`FH-46.06`** — Trabalho em segundo plano **DEVE** ser visível e **NUNCA** prender o
usuário (`FH-43.08`).
> **Verificação:** o trabalho em segundo plano é visível sem bloquear o uso? → SIM = cumpre | NÃO = viola.

**`FH-46.07`** — A resposta ao gesto é **sempre imediata**, independentemente da
duração da operação subjacente (`FH-43.01`).
> **Verificação:** o controle reage imediatamente ao acionamento? → SIM = cumpre | NÃO = viola.

**`FH-46.08`** — Nenhuma interface **PODE** ser bloqueada por processamento que
possa ocorrer de forma assíncrona.
> **Verificação:** este bloqueio é tecnicamente inevitável? → SIM = cumpre | NÃO = viola.

**`FH-46.09`** — A percepção de velocidade **NUNCA** é obtida por engano: exibir
conclusão antes do fim, ocultar falha para parecer rápido ou simular resultado são
proibidos.
> **Verificação:** algum ganho de percepção depende de informação falsa? → NÃO = cumpre | SIM = viola.

**`FH-46.10`** — Desempenho **DEVE** ser verificado em **condição real**: rede
degradada e conta com volume alto (`FH-14.10`, `FH-27.07`).
> **Verificação:** a verificação incluiu rede degradada e conta de volume alto? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula a **percepção de tempo**, que determina a satisfação do usuário
mais do que o tempo absoluto. Ele define o que fazer durante a espera, como
representá-la honestamente e como evitar que a espera se converta em dúvida.

---

## 2. Perguntas que este capítulo responde

- O que fazer enquanto carrega?
- Quando mostro esqueleto, quando mostro progresso, quando não mostro nada?
- Como evito salto de layout?
- Posso carregar dados antes de o usuário pedir?
- Como faço o sistema parecer instantâneo sem mentir?

---

## 3. Definições

**Espera** — intervalo entre a ação do usuário e o resultado disponível.

**Resposta imediata** — sinal de recebimento da ação, independente do resultado.

**Esqueleto** — representação da forma do conteúdo antes de ele existir.

**Antecipação** — carregamento de dado provável antes da solicitação.

**Salto de layout** — deslocamento de conteúdo visível causado pela chegada de
outro conteúdo.

---

## 4. Fundamento

**Por que percepção importa mais que medição.** A satisfação com a espera depende de
três variáveis que não são a duração: saber que a ação foi recebida, saber o que
está acontecendo e poder fazer outra coisa. Uma operação de dez segundos com essas
três condições é tolerada; uma de três segundos sem nenhuma delas é percebida como
falha. Otimizar apenas o tempo absoluto ignora a maior parte do problema.

**Por que o esqueleto reproduz a forma.** Um indicador genérico comunica apenas
"espere". Um esqueleto com a forma final comunica **o que virá**, permite ao
usuário se orientar antes do conteúdo chegar e elimina o salto de layout, porque o
espaço já está ocupado. É simultaneamente informação e prevenção de defeito.

**Por que progresso falso é proibido.** Uma barra que avança sem relação com o
trabalho real é mentira de estado (P9). O custo aparece quando ela chega perto do
fim e para: o usuário perde a confiança em toda indicação de progresso do produto,
inclusive nas verdadeiras. Quando não há medição, a resposta correta é dizer o que
está acontecendo, sem quantificar.

**Por que antecipação tem limites.** Carregar dado provável melhora a percepção sem
custo para o usuário — **desde que** seja apenas leitura. Se a antecipação altera
estado, produz efeito externo ou consome cota, ela deixa de ser otimização e passa
a ser ação não solicitada, violando `FH-07.03` e `FH-10.03`.

**Por que verificar em condição real.** Desempenho medido em ambiente de
desenvolvimento — rede local, conta pequena, dados recentes — não prevê nada sobre
a experiência da conta grande em rede ruim, que é justamente a mais valiosa
(`FH-27.07`). Medir apenas no cenário ideal produz a ilusão de velocidade.

---

## 5. Faixas de espera e resposta obrigatória

| Faixa | Percepção do usuário | Resposta obrigatória |
| --- | --- | --- |
| **Instantânea** | Causa e efeito são um só evento | Nenhuma indicação; apenas o resultado |
| **Curta** | Percebe uma pausa, mas mantém o foco | Reação imediata no controle; sem indicador adicional |
| **Média** | Começa a duvidar se funcionou | Esqueleto com a forma final ou indicador no local da ação |
| **Longa** | Precisa decidir se espera | Informar o que está acontecendo; liberar o trabalho paralelo |
| **Muito longa** | Não pode esperar olhando | Segundo plano obrigatório: informar, liberar, avisar ao terminar (`FH-43.08`) |

**Regra de aplicação.** A faixa é determinada pela duração **real medida em
condição adversa** (`FH-46.10`), não pela duração esperada em condição ideal.

---

## 6. Regras normativas

### `FH-46.02` — Esqueleto com forma

**Quando NÃO aplicar.** Quando a forma final é genuinamente imprevisível — resultado
de busca com tipos heterogêneos, por exemplo.

**Certo.** Lista carregando com blocos do tamanho exato das linhas finais.

**Errado.** Indicador central genérico onde a estrutura da tela já é conhecida.

### `FH-46.04` — Progresso honesto

**Certo (com medição).** "1.240 de 3.000 contatos processados."

**Certo (sem medição).** "Processando a importação. Isso pode levar alguns
minutos."

**Errado.** Barra avançando por tempo, sem relação com o processamento.

### `FH-46.08` — Sem bloqueio evitável

**Errado.** Interface travada durante geração de relatório — o usuário fica sem
poder fazer nada por uma limitação que poderia ser assíncrona (`FH-07.11`).

---

## 7. Anti-padrões

**Indicador universal.** Um símbolo genérico para toda espera.

**Barra inventada.** Progresso sem medição.

**Salto de conteúdo.** Elemento que chega e empurra o resto.

**Bloqueio por conveniência.** Travar a tela porque é mais simples que implementar
segundo plano.

**Velocidade fingida.** Conclusão exibida antes do fim.

**Medição de laboratório.** Desempenho verificado só em condição ideal.

**Antecipação com efeito.** Pré-carregamento que altera estado ou consome cota.

---

## 8. Impactos

**Cognitivo.** O esqueleto permite orientação antes da chegada do conteúdo,
antecipando parte do trabalho de leitura.

**Emocional.** Espera sem informação é interpretada como falha; espera informada é
tolerada. A diferença é de comunicação, não de tempo.

**Produtividade.** `FH-46.06` e `FH-46.08` devolvem ao usuário o tempo que o
sistema tomaria — o ganho é proporcional à frequência das operações longas.

**Percepção de qualidade.** Resposta imediata ao gesto é o principal componente da
sensação de produto rápido, mesmo com processamento lento.

**Curva de aprendizagem.** Esqueletos com forma ensinam a estrutura da tela antes
do primeiro dado — especialmente útil no estado inaugural (`FH-27.01`).

---

## 9. Riscos e trade-offs

**Risco: complexidade do assíncrono.** Segundo plano exige acompanhamento de estado
e notificação. Custo assumido: é a alocação de complexidade de P1.

**Risco: excesso de indicadores.** Sinalizar toda espera curta gera ruído.
Mitigação: as faixas determinam quando **não** indicar.

**Risco: antecipação desperdiçada.** Pré-carregar consome recursos que podem não
ser usados. Mitigação: `FH-46.05` limita a leitura sem custo para o usuário.

**Trade-off central.** Trocamos simplicidade de implementação por honestidade
temporal. Seria mais fácil exibir progresso genérico e bloquear a tela — e é
exatamente isso que produz a percepção de produto lento.

---

## 10. Critérios de verificação

1. Cada espera tem a resposta correspondente à sua faixa.
2. Formas conhecidas são reproduzidas no carregamento.
3. Nenhuma chegada de conteúdo desloca o que já estava visível.
4. Todo progresso exibido deriva de medição real.
5. Nenhuma antecipação altera estado, produz efeito externo ou consome cota.
6. Trabalho em segundo plano é visível e não prende.
7. Todo controle reage imediatamente ao acionamento.
8. Nenhum bloqueio evitável de interface existe.
9. Nenhum ganho de percepção depende de informação falsa.
10. A verificação incluiu rede degradada e conta de volume alto.

---

## 11. Checklist do capítulo

- [ ] Medi a duração real em condição adversa e identifiquei a faixa.
- [ ] O carregamento reproduz a forma final quando ela é conhecida.
- [ ] Reservei o espaço: nada se desloca ao chegar.
- [ ] Só exibo progresso que sei medir.
- [ ] A antecipação é apenas leitura.
- [ ] Operação longa libera o usuário e avisa depois.
- [ ] O controle reage no instante do clique.
- [ ] Testei com conta grande e rede ruim.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P9, P10), 14 (contexto adverso), 27 (`FH-27.07`), 41
(estados), 43 (feedback).

**É pré-requisito de.** Capítulos 47 (busca incremental), 49 (lote), 50 (tempo
real), 64 (métricas).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Carregamento por rota | `loading.tsx` em `src/app/(dashboard)/` |
| Esqueletos e reserva de espaço | Componentes de skeleton em `src/components/ui/` |
| Operações longas | Rotas de API em `src/app/api/`, `docs/automations-and-cron.md` |
| Progresso de lote | `src/lib/broadcast-status.ts` |
| Medição em produção | `sentry.client.config.ts` |
