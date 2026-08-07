# Capítulo 43 — Sistema de Feedback

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P6, P9, P10), 15, 17, 41 |
| É pré-requisito de | Capítulos 44, 45, 46, 49, 50 |
| Artigos | `FH-43.01` a `FH-43.10` |

---

## 0. Núcleo Normativo

**`FH-43.01`** — Toda ação do usuário **DEVE** produzir resposta perceptível
**imediata** — dentro da janela em que a relação causa-efeito ainda é percebida
como instantânea. A resposta imediata confirma o recebimento; o resultado pode vir
depois.
> **Verificação:** existe resposta perceptível imediatamente após a ação? → SIM = cumpre | NÃO = viola.

**`FH-43.02`** — A resposta **DEVE** aparecer **próxima ao ponto da ação**. Feedback
distante do gesto que o originou é proibido.
> **Verificação:** a resposta aparece no local onde a ação foi executada? → SIM = cumpre | NÃO = viola.

**`FH-43.03`** — O feedback é **proporcional à consequência**: ação comum e
reversível recebe resposta discreta; consequência relevante recebe resposta
explícita.
> **Verificação:** a intensidade da resposta corresponde à consequência da ação? → SIM = cumpre | NÃO = viola.

**`FH-43.04`** — **Silêncio após ação é proibido.** Nenhuma ação pode terminar sem
que o usuário saiba o que aconteceu (`FH-41.03`).
> **Verificação:** existe ação cujo desfecho não é comunicado? → NÃO = cumpre | SIM = viola.

**`FH-43.05`** — **Feedback otimista** — exibir o resultado antes da confirmação do
servidor — só é permitido quando **todas** as condições se aplicam: alta
probabilidade de êxito, efeito reversível, e **reconciliação obrigatória** com
reversão visível em caso de falha.
> **Verificação:** as três condições são atendidas e a reconciliação está implementada? → SIM = cumpre | NÃO = viola.

**`FH-43.06`** — Ação cujo resultado é **visível por si** **NUNCA** recebe mensagem
adicional de sucesso. O resultado é o feedback (`FH-07.07`).
> **Verificação:** existe mensagem de sucesso para ação cujo resultado já é visível? → NÃO = cumpre | SIM = viola.

**`FH-43.07`** — Feedback **NUNCA** bloqueia a continuidade do trabalho, exceto
quando exige decisão do usuário para prosseguir.
> **Verificação:** o feedback impede o usuário de continuar sem exigir decisão? → NÃO = cumpre | SIM = viola.

**`FH-43.08`** — Operação assíncrona **DEVE** informar que continuará em segundo
plano e avisar ao terminar, sem prender o usuário (`FH-07.11`).
> **Verificação:** a operação longa informa que continua e avisa ao terminar? → SIM = cumpre | NÃO = viola.

**`FH-43.09`** — Feedback **NUNCA** afirma mais do que o sistema sabe. Sucesso
parcial, resultado estimado e estado pendente **DEVEM** ser declarados como tais
(`FH-41.05`, `FH-41.11`).
> **Verificação:** o feedback afirma certeza maior do que a real? → NÃO = cumpre | SIM = viola.

**`FH-43.10`** — A mesma classe de ação **DEVE** produzir a mesma classe de
feedback em todo o produto (`FH-07.08`).
> **Verificação:** este feedback corresponde ao usado para ações equivalentes em outras áreas? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo garante que **toda ação tenha resposta** — perceptível, próxima,
proporcional e honesta. Ele é o contrapeso direto de P6 (silêncio como cortesia):
o produto fala pouco, mas nunca deixa o usuário sem saber o que aconteceu.

---

## 2. Perguntas que este capítulo responde

- Todo clique precisa responder?
- Em quanto tempo?
- Onde a resposta aparece?
- Quando uso resposta discreta e quando uso confirmação explícita?
- Posso mostrar o resultado antes de o servidor confirmar?
- Como confirmo algo que só termina depois?

---

## 3. Definições

**Resposta imediata** — sinal perceptível de que o sistema recebeu a ação.
Diferente do **resultado**, que pode demorar.

**Feedback otimista** — exibição do resultado provável antes da confirmação real.

**Reconciliação** — ajuste do estado exibido quando a confirmação real chega,
incluindo reversão visível em caso de falha.

**Feedback proporcional** — intensidade da resposta calibrada pela consequência.

**Feedback ambiente** — sinal discreto e não interruptivo, integrado ao conteúdo.

---

## 4. Fundamento

**Por que a resposta precisa ser imediata.** A percepção de causalidade humana tem
uma janela estreita: além dela, o usuário deixa de associar o resultado ao próprio
gesto e passa a duvidar de que o clique funcionou. A consequência prática é
conhecida e cara — ele clica de novo, e a ação é executada duas vezes. Note a
distinção que `FH-43.01` faz: o que precisa ser imediato é o **reconhecimento**,
não o resultado. Um envio pode demorar; a evidência de que o botão foi pressionado,
não.

**Por que a resposta precisa ser próxima.** Feedback que aparece longe do gesto
exige uma busca visual justamente no momento em que a atenção está no ponto da
ação. Em telas densas, uma mensagem no canto oposto simplesmente não é vista — e
uma mensagem não vista é equivalente a silêncio.

**Por que proporcionalidade.** Feedback uniforme produz dois erros simultâneos:
ações triviais geram ruído (violando P6) e ações consequentes recebem tratamento
insuficiente. Pior: quando tudo recebe a mesma resposta, o usuário deixa de ler —
e passa a ignorar também as respostas que importavam.

**Por que resultado visível dispensa mensagem.** Se o item mudou de coluna diante
dos olhos do usuário, uma notificação dizendo "item movido" adiciona ruído e
consome atenção para informar o que ele acabou de ver. `FH-43.06` é a aplicação
mais direta de P6, e é o artigo que mais reduz poluição de interface.

**Por que feedback otimista é restrito.** Ele melhora a percepção de velocidade e
é honesto **enquanto** reconcilia. Sem reconciliação, transforma-se em mentira de
estado (P9): o usuário viu o sucesso, o sistema falhou, e ninguém contou. As três
condições de `FH-43.05` existem porque a falha silenciosa desse padrão é a mais
difícil de detectar — tudo parece certo até o cliente reclamar.

**Por que operação longa não prende.** Prender a interface durante processamento
longo transfere ao usuário o custo de uma limitação técnica, violando P1 e P10.
A alternativa é sempre possível: informar que continua, liberar o trabalho, avisar
ao terminar.

---

## 5. Princípios

**Reconhecer é imediato; concluir pode demorar.**

**Feedback longe do gesto é feedback não visto.**

**Se o resultado é visível, a mensagem é ruído.**

**Otimismo sem reconciliação é mentira.**

---

## 6. Regras normativas

### Escala de feedback

| Nível | Forma | Use quando | Exemplo de situação |
| --- | --- | --- | --- |
| 1 — **Imediato** | Mudança visual no próprio controle | Sempre, em toda ação | Botão reage ao ser pressionado |
| 2 — **Ambiente** | Alteração visível no conteúdo | O resultado é observável na própria tela | Item muda de estado na lista |
| 3 — **Discreto** | Mensagem breve, não interruptiva | Resultado não observável na tela atual | Registro salvo fora da vista |
| 4 — **Explícito** | Mensagem persistente com ação | Consequência relevante ou que exige acompanhamento | Envio iniciado; falha parcial |
| 5 — **Bloqueante** | Exige decisão para continuar | Só quando o usuário precisa decidir (`FH-45`) | Confirmação de ação irreversível |

**Regra de escolha:** use o **menor nível** que comunica o que aconteceu. Subir de
nível exige que o nível anterior seja insuficiente, não que a informação pareça
importante para quem construiu.

### `FH-43.05` — Condições do feedback otimista

Todas obrigatórias:

1. A operação tem alta probabilidade de êxito em condições normais.
2. O efeito é reversível ou o estado anterior é recuperável.
3. Existe reconciliação implementada, com **reversão visível** e explicação em
   caso de falha.

**Certo.** Marcar uma conversa como resolvida: aparece resolvida na hora; se o
servidor recusar, volta ao estado anterior com aviso do motivo.

**Errado.** Exibir "enviado" antes da confirmação do canal. Envio tem efeito
externo e não é reversível — viola também `FH-07.03`.

### `FH-43.08` — Operação assíncrona

**Certo.** "Importação iniciada. Você pode continuar trabalhando; avisaremos ao
terminar." Ao concluir: resultado com relatório por item.

**Errado.** Barra de progresso bloqueando a tela durante processamento longo.

---

## 7. Anti-padrões

**Clique mudo.** Nenhuma reação perceptível ao acionar.

**Mensagem para o óbvio.** Confirmar por escrito o que o usuário acabou de ver.

**Feedback distante.** Aviso no canto oposto ao gesto.

**Otimismo sem volta.** Sucesso exibido e nunca reconciliado.

**Bloqueio por cortesia.** Modal de sucesso que exige fechar.

**Feedback uniforme.** Mesma resposta para trivial e para consequente.

**Progresso sequestrador.** Operação longa prendendo a interface.

---

## 8. Impactos

**Cognitivo.** Feedback imediato fecha o ciclo de ação e libera a memória de
trabalho para a próxima tarefa. Sua ausência mantém a ação "aberta" na cabeça do
usuário.

**Emocional.** Silêncio após ação produz insegurança; feedback excessivo produz
irritação. A calibração de `FH-43.03` é o que sustenta a confiança calma do
Capítulo 17.

**Produtividade.** `FH-43.06` e `FH-43.07` removem interrupções em fluxos
repetitivos — o ganho aparece multiplicado pela frequência.

**Percepção de qualidade.** Resposta imediata é o principal componente da sensação
de "produto rápido", mesmo quando o processamento real é lento (`FH-46`).

**Curva de aprendizagem.** Feedback consistente ensina o que cada ação faz sem
documentação — o usuário aprende por consequência observada.

---

## 9. Riscos e trade-offs

**Risco: ruído por excesso.** Muitos avisos treinam o usuário a ignorá-los.
Mitigação: regra do menor nível suficiente e `FH-43.06`.

**Risco: subnotificação.** Buscar silêncio pode esconder resultados relevantes.
Mitigação: `FH-43.04` é categórico — silêncio total é sempre violação.

**Risco: complexidade do otimismo.** Reconciliação exige implementação cuidadosa.
Mitigação: as três condições restringem seu uso aos casos em que compensa.

**Trade-off central.** Trocamos simplicidade de implementação por precisão de
comunicação. Calibrar cinco níveis custa mais que notificar tudo igual — e é o que
mantém a atenção do usuário disponível para o que importa.

---

## 10. Critérios de verificação

1. Toda ação produz resposta perceptível imediata.
2. Toda resposta aparece próxima ao ponto da ação.
3. A intensidade corresponde à consequência.
4. Nenhuma ação termina em silêncio.
5. Todo feedback otimista atende às três condições e reconcilia.
6. Nenhuma mensagem confirma resultado já visível.
7. Nenhum feedback bloqueia sem exigir decisão.
8. Toda operação longa informa continuidade e avisa ao terminar.
9. Nenhum feedback afirma mais certeza do que o sistema possui.
10. Ações equivalentes produzem feedback equivalente em todo o produto.

---

## 11. Checklist do capítulo

- [ ] O controle reage imediatamente ao ser acionado.
- [ ] A resposta aparece onde a ação aconteceu.
- [ ] Usei o menor nível de feedback que comunica o resultado.
- [ ] Nenhuma ação termina sem desfecho comunicado.
- [ ] Se usei otimismo, há reconciliação com reversão visível.
- [ ] Não notifiquei o que já estava visível.
- [ ] A operação longa libera o usuário e avisa depois.
- [ ] O feedback não afirma mais do que o sistema sabe.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P6, P9, P10), 15 (interrupção), 17 (emoção), 41
(estados).

**É pré-requisito de.** Capítulos 44 (erros), 45 (confirmações), 46 (desempenho
percebido), 49 (lote), 50 (tempo real).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Mensagens de sistema | `src/components/themed-toaster.tsx` |
| Feedback imediato em controles | `src/components/ui/button.tsx` e primitivas |
| Operações assíncronas | `src/lib/broadcast-status.ts`, rotas de API em `src/app/api/` |
| Reconciliação de estado | Hooks de dados em `src/hooks/`, clientes Supabase |
| Textos de feedback | `src/i18n/messages/pt-BR.json` |
