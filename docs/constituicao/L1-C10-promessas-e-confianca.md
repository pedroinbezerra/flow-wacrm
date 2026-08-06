# Capítulo 10 — Promessas e Contratos de Confiança

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P4, P7, P9, P10), 9 |
| É pré-requisito de | Capítulos 18, 41, 44, 45, 50, 51, 62 |
| Artigos | `FH-10.01` a `FH-10.10` |

---

## 0. Núcleo Normativo

> As sete promessas abaixo são **contratos implícitos**. O usuário nunca as leu,
> mas conta com elas — e a primeira vez que uma é quebrada, ele passa a verificar
> tudo. Quebrar promessa custa mais do que falhar.

**`FH-10.01`** — **Promessa de preservação.** Nada que o usuário digitou se perde.
Navegação, erro, falha de rede, expiração de sessão, fechamento acidental e
recarregamento **NUNCA** destroem conteúdo produzido por ele.
> **Verificação:** existe caminho neste fluxo em que o conteúdo digitado desaparece sem ação deliberada do usuário? → NÃO = cumpre | SIM = viola.

**`FH-10.02`** — **Promessa de reversibilidade.** Toda ação do usuário pode ser
desfeita, ou foi confirmada antes de acontecer (`FH-07.05`).
> **Verificação:** esta ação é desfazível ou foi explicitamente confirmada? → SIM = cumpre | NÃO = viola.

**`FH-10.03`** — **Promessa de não-surpresa.** O sistema **NUNCA** executa, em nome
do usuário, ação de efeito externo que ele não solicitou nem autorizou
explicitamente.
> **Verificação:** o usuário solicitou ou autorizou explicitamente este efeito externo? → SIM = cumpre | NÃO = viola.

**`FH-10.04`** — **Promessa de veracidade.** Todo estado exibido corresponde ao
estado real do sistema (`FH-07.10`).
> **Verificação:** o estado exibido corresponde ao estado real, incluindo falhas parciais? → SIM = cumpre | NÃO = viola.

**`FH-10.05`** — **Promessa de continuidade.** O trabalho continua exatamente de
onde parou: posição, filtro, seleção, rascunho e contexto são preservados entre
sessões, dispositivos e interrupções.
> **Verificação:** ao retornar, o usuário reencontra o contexto exato em que estava? → SIM = cumpre | NÃO = viola.

**`FH-10.06`** — **Promessa de isolamento.** Dados de uma conta **NUNCA** aparecem,
vazam ou são inferíveis a partir de outra — nem por listagem, nem por contagem,
nem por mensagem de erro, nem por busca.
> **Verificação:** existe caminho pelo qual a existência ou o conteúdo de dado de outra conta seja perceptível? → NÃO = cumpre | SIM = viola.

**`FH-10.07`** — **Promessa de saída.** O usuário pode extrair seus dados e
encerrar o uso a qualquer momento, sem obstáculo, sem retenção artificial e sem
perda do que produziu.
> **Verificação:** existe caminho de exportação e encerramento sem fricção deliberada? → SIM = cumpre | NÃO = viola.

**`FH-10.08`** — Quebra de promessa é **incidente**, não defeito comum. Exige
correção prioritária, comunicação ao usuário afetado e registro no Anexo E.
> **Verificação:** a quebra foi tratada como incidente, com comunicação e registro? → SIM = cumpre | NÃO = viola.

**`FH-10.09`** — Promessas **NUNCA** são anunciadas como diferencial dentro do
produto. Elas se cumprem em silêncio; anunciá-las sugere que poderiam não ser
cumpridas.
> **Verificação:** algum texto do produto promove o cumprimento de uma promessa básica? → NÃO = cumpre | SIM = viola.

**`FH-10.10`** — Nenhuma promessa nova pode ser criada sem constar deste capítulo.
Comportamento consistente que o usuário passa a esperar **DEVE** ser promovido a
promessa por emenda, ou eliminado.
> **Verificação:** este comportamento cria expectativa permanente? Se SIM, está registrado como promessa? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo enumera as garantias que o usuário assume sem verificar. Elas são o
alicerce sobre o qual toda a experiência se apoia: se qualquer uma cair, o
usuário passa a gastar atenção verificando o sistema em vez de trabalhar — e esse
custo nunca mais desaparece completamente.

---

## 2. Perguntas que este capítulo responde

- O que o usuário tem direito de assumir sem conferir?
- O que o sistema jamais faz sem que ele saiba?
- O que acontece quando quebramos uma dessas garantias?
- Um comportamento consistente vira obrigação com o tempo?
- Podemos dificultar a saída de um cliente?
- Podemos divulgar essas garantias como vantagem?

---

## 3. Definições

**Promessa** — garantia permanente que o usuário assume sem verificar e sobre a
qual organiza seu trabalho.

**Contrato implícito** — obrigação criada pelo comportamento consistente do
sistema, independentemente de ter sido declarada.

**Quebra de promessa** — evento no qual uma garantia falha. Tratada como
incidente (`FH-10.08`).

**Retenção artificial** — obstáculo deliberado à saída do usuário. Proibida.

**Custo de verificação** — atenção que o usuário passa a gastar conferindo o
sistema depois de uma quebra. É permanente e não se recupera com uma correção.

---

## 4. Fundamento

**Por que promessas são mais fortes que funcionalidades.** Uma funcionalidade
ausente frustra uma vez, no momento em que é procurada. Uma promessa quebrada
altera permanentemente a relação: o usuário deixa de delegar. Ele passa a copiar
textos antes de enviar, conferir se salvou, verificar em outro lugar se o envio
saiu. Cada uma dessas verificações é trabalho que o sistema existe para eliminar —
e ele passa a gerá-lo.

**Por que a assimetria é tão grande.** Confiança se constrói por acúmulo lento de
evidências e se destrói por evento único. Mil salvamentos bem-sucedidos não
compensam uma perda de texto: o usuário não conclui "o sistema é 99,9% confiável",
conclui "o sistema pode perder meu trabalho". A partir daí, ele age sob essa
possibilidade em todas as interações seguintes. Por isso `FH-10.08` classifica a
quebra como incidente: o dano não é proporcional à frequência.

**Por que a promessa de preservação é a primeira.** Texto digitado representa
tempo, raciocínio e, muitas vezes, uma decisão delicada sobre o que dizer a um
cliente. Perdê-lo não é perder dados; é perder o trabalho intelectual que o
produziu. É a quebra mais rapidamente percebida e a menos perdoada.

**Por que a promessa de isolamento é absoluta.** Ela é a única cuja quebra pode
causar dano irreparável a terceiros e responsabilidade legal ao usuário. Por isso
integra as cláusulas pétreas (`FH-04.12`) e vence qualquer regra de experiência
(`FH-03.02`). Note que `FH-10.06` proíbe também a **inferência**: contagens,
tempos de resposta e mensagens de erro que revelem a existência de um registro em
outra conta são violações, mesmo sem exibir conteúdo algum.

**Por que a promessa de saída existe.** Retenção por obstáculo é a forma mais
comum de padrão escuro em software de negócio, e é sempre autodestrutiva: ela
converte um usuário que sairia neutro em um detrator ativo. Além disso,
contradiz o traço de confiança (`FH-09.01`) — só quem duvida do próprio valor
prende alguém.

**Por que promessas não são anunciadas.** `FH-10.09` parece contraintuitivo do
ponto de vista comercial. A razão é psicológica: anunciar uma garantia básica
introduz a dúvida de que ela poderia não existir. Ninguém anuncia que o prédio
não vai cair. O cumprimento silencioso comunica muito mais força do que a
declaração.

**Por que comportamento vira promessa.** `FH-10.10` reconhece que o usuário
aprende por observação, não por documentação. Se o sistema se comporta de certa
forma consistentemente, ele passa a contar com isso — e a mudança futura será
percebida como quebra, mesmo que nunca tenha sido prometida. Duas saídas
legítimas: promover o comportamento a promessa, ou eliminá-lo antes que a
expectativa se consolide.

---

## 5. Princípios

**Confiança se constrói devagar e se perde inteira.**

**O que o usuário assume sem verificar é obrigação, não cortesia.**

**Cumprir em silêncio comunica mais do que prometer.**

**Comportamento consistente cria obrigação, mesmo sem declaração.**

---

## 6. Regras normativas

### `FH-10.01` — Preservação

**Quando aplicar.** Em todo campo de entrada de texto, formulário longo,
composição de mensagem e configuração.

**Quando NÃO aplicar.** Quando o próprio usuário descarta deliberadamente, com
ação explícita.

**Certo.** Rascunho preservado localmente e restaurado ao retornar; formulário
interrompido por falha de rede reaparece preenchido.

**Errado.** Erro de validação no envio que limpa o campo. É a forma mais comum e
mais irritante de quebra: o sistema pune o erro destruindo o trabalho.

### `FH-10.02` — Reversibilidade

Ver Capítulo 45 para a matriz completa. Aqui a regra é categórica: não existe ação
sem desfazer **e** sem confirmação.

### `FH-10.03` — Não-surpresa

**Quando aplicar.** Em toda ação com efeito fora do sistema.

**Quando NÃO aplicar.** Quando a autorização foi dada previamente e de forma
específica — uma automação que o usuário criou, revisou e ativou. Autorização
genérica ("aceito que o sistema me ajude") **NUNCA** basta.

### `FH-10.04` — Veracidade

Ver `FH-07.10` e Capítulo 41. Inclui explicitamente sucesso parcial: operação com
falhas **NUNCA** é apresentada como concluída.

### `FH-10.05` — Continuidade

**Quando aplicar.** Em listas, filtros, seleções, rascunhos, posição de rolagem e
contexto de navegação.

**Quando NÃO aplicar.** Quando o contexto anterior deixou de existir (o registro
foi excluído) — aí a obrigação é explicar o que mudou, não restaurar.

**Errado.** Voltar de um item para a lista e reencontrá-la no topo, sem filtro e
sem a seleção. O usuário refaz trabalho que já tinha feito, toda vez.

### `FH-10.06` — Isolamento

**Quando aplicar.** Em toda consulta, busca, contagem, exportação, mensagem de
erro e endpoint.

**Quando NÃO aplicar.** Nunca. Cláusula pétrea.

**Errado.** Mensagem de erro que distingue "registro não encontrado" de "sem
permissão para este registro". A distinção revela existência.

### `FH-10.07` — Saída

**Quando aplicar.** Em exportação, encerramento de conta e cancelamento.

**Quando NÃO aplicar.** Não impede confirmação de ação irreversível — confirmar
protege; dificultar retém. A diferença é objetiva: confirmação é um passo que
informa consequência; retenção é um obstáculo que tenta demover.

### `FH-10.08` — Quebra como incidente

**Quando aplicar.** Sempre que uma promessa falhar, mesmo em caso isolado.

**Certo.** Correção priorizada, usuários afetados informados diretamente, causa
registrada.

**Errado.** Tratar perda de rascunho como defeito de baixa prioridade porque
"aconteceu com poucos".

### `FH-10.09` — Cumprimento silencioso

**Errado.** "Seus dados estão sempre seguros conosco!" dentro do produto.

### `FH-10.10` — Promessa por comportamento

**Certo.** Perceber que usuários passaram a contar com um comportamento e
promovê-lo formalmente a promessa por emenda.

**Errado.** Alterar esse comportamento sem análise, por conveniência de
implementação.

---

## 7. Anti-padrões

**Perda por validação.** Erro que limpa o formulário.

**Reset de contexto.** Voltar e reencontrar tudo no estado inicial.

**Sucesso otimista sem reconciliação.** Mostrar concluído antes de saber, e nunca
corrigir.

**Vazamento por metadado.** Contagem, tempo de resposta ou mensagem que revela
dado alheio.

**Saída por labirinto.** Cancelamento em várias etapas com ofertas de retenção.

**Promessa publicitária.** Anunciar garantias básicas dentro do produto.

---

## 8. Impactos

**Cognitivo.** Promessas cumpridas eliminam a necessidade de monitorar o sistema.
O usuário dedica atenção ao trabalho, e não à supervisão da ferramenta.

**Emocional.** São a base da confiança calma (Capítulo 17). Sua quebra produz
ansiedade persistente, desproporcional ao evento.

**Produtividade.** `FH-10.05` é o artigo de maior efeito diário: retomada de
contexto acontece dezenas de vezes por jornada.

**Percepção de qualidade.** Promessas cumpridas são invisíveis; quebradas, são a
única coisa que o usuário lembra. Essa assimetria é a razão de o capítulo existir.

**Curva de aprendizagem.** Reversibilidade e preservação permitem aprender por
exploração — o modo mais rápido e o único que não depende de instrução.

---

## 9. Riscos e trade-offs

**Risco: custo de implementação.** Preservação e continuidade exigem persistência
de estado em muitos pontos. É custo real e recorrente, assumido: é exatamente a
transferência de complexidade que P1 exige.

**Risco: excesso de confirmação.** Buscar não-surpresa pode gerar confirmações em
excesso, que treinam o usuário a ignorá-las. Mitigação: Capítulo 45 — a
preferência estrutural é sempre desfazer, não confirmar.

**Risco: saída fácil demais.** Facilitar a saída aumenta cancelamentos evitáveis.
Trade-off assumido: retenção por obstáculo produz detratores e contradiz a
identidade (`FH-09.01`).

**Trade-off central.** Trocamos flexibilidade de implementação por garantias
absolutas. Cada promessa restringe soluções técnicas possíveis. É a restrição que
torna o produto confiável — e confiabilidade é o que permite ao usuário parar de
verificar.

---

## 10. Critérios de verificação

1. Nenhum fluxo destrói conteúdo digitado sem ação deliberada do usuário.
2. Toda ação é desfazível ou confirmada.
3. Nenhum efeito externo ocorre sem solicitação ou autorização específica.
4. Nenhum estado exibido é mais otimista que a realidade, inclusive em sucesso
   parcial.
5. Retorno restaura posição, filtro, seleção e rascunho.
6. Nenhum caminho permite perceber a existência de dado de outra conta.
7. Existe caminho de exportação e encerramento sem fricção deliberada.
8. Toda quebra de promessa foi tratada como incidente, com comunicação e registro.

---

## 11. Checklist do capítulo

- [ ] Testei o caminho de falha: o que o usuário digitou sobrevive?
- [ ] Esta ação é desfazível ou foi confirmada?
- [ ] Nenhum efeito externo acontece sem autorização específica.
- [ ] Falha parcial é exibida como falha parcial.
- [ ] Ao voltar, o contexto é o mesmo que eu deixei.
- [ ] Nenhuma mensagem, contagem ou erro revela dado de outra conta.
- [ ] Não criei obstáculo à saída.
- [ ] Se criei expectativa permanente, ela virou promessa registrada.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P4, P7, P9, P10), 9.

**É pré-requisito de.** Capítulo 18 (confiança e controle), 41 (estados), 44
(erros), 45 (confirmações), 50 (colaboração), 51 (permissões), 62 (qualidade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Isolamento por conta | Políticas RLS em `supabase/migrations/`, filtros `account_id`, guards de rota |
| Preservação de rascunho | `src/components/inbox/message-thread.tsx`, formulários de domínio |
| Continuidade de contexto | Estado de listas e filtros em `src/app/(dashboard)/` |
| Exportação e encerramento | `src/app/(dashboard)/settings/`, `docs/business-rules/retencao-exclusao-inadimplencia.md` |
| Tratamento de incidentes | `docs/governance/plano-resposta-a-incidentes.md` |
