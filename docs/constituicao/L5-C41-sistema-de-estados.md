# Capítulo 41 — Sistema de Estados

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P9), 10, 14, 21, 24 |
| É pré-requisito de | Capítulos 42–46, 50, 51 |
| Artigos | `FH-41.01` a `FH-41.11` |

---

## 0. Núcleo Normativo

**`FH-41.01`** — Existe um **catálogo fechado de dez estados** (§5). Nenhuma tela,
componente ou operação **PODE** assumir estado fora dele.
> **Verificação:** todos os estados desta tela pertencem ao catálogo? → SIM = cumpre | NÃO = viola.

**`FH-41.02`** — Toda tela e todo componente **DEVEM** tratar **todos** os estados
aplicáveis antes de serem considerados prontos. Estado aplicável não tratado é
bloqueio de entrega (`FH-62`).
> **Verificação:** todos os estados aplicáveis foram projetados e implementados? → SIM = cumpre | NÃO = viola.

**`FH-41.03`** — **Estado indefinido é proibido.** Nenhuma situação pode resultar em
"nada acontece": ausência de resposta visível é sempre defeito.
> **Verificação:** existe caminho em que a tela não comunica nada ao usuário? → NÃO = cumpre | SIM = viola.

**`FH-41.04`** — Transições entre estados **NUNCA** produzem salto de layout,
deslocamento de conteúdo já lido ou perda de posição.
> **Verificação:** a transição desloca conteúdo ou muda a posição do que o usuário estava vendo? → NÃO = cumpre | SIM = viola.

**`FH-41.05`** — **Sucesso parcial é estado próprio.** Operação com falhas **NUNCA**
é representada como concluída (`FH-07.10`, `FH-10.04`).
> **Verificação:** operação com falhas parciais é exibida como sucesso? → NÃO = cumpre | SIM = viola.

**`FH-41.06`** — **Estado degradado** — funcionalidade reduzida por falha externa —
**DEVE** ser declarado ao usuário, com indicação do que continua funcionando.
> **Verificação:** havendo degradação, o usuário sabe o que ainda funciona? → SIM = cumpre | NÃO = viola.

**`FH-41.07`** — Perda e retomada de conexão **DEVEM** ser visíveis, com recuperação
automática e sem perda de trabalho (`FH-14.04`).
> **Verificação:** a perda de conexão é visível e a recuperação preserva o trabalho? → SIM = cumpre | NÃO = viola.

**`FH-41.08`** — **Ausência de permissão é estado, não erro.** É apresentada como
condição normal, com explicação e caminho, sem linguagem de falha (`FH-51`).
> **Verificação:** falta de permissão é apresentada como estado explicado, e não como erro? → SIM = cumpre | NÃO = viola.

**`FH-41.09`** — Atualização em segundo plano **NUNCA** bloqueia o trabalho em curso
nem substitui conteúdo sob o cursor ou sob leitura (`FH-50`).
> **Verificação:** a atualização bloqueia o trabalho ou substitui o que está sendo manipulado? → NÃO = cumpre | SIM = viola.

**`FH-41.10`** — Cada estado tem **representação canônica única**: o mesmo estado
tem a mesma aparência e o mesmo comportamento em todo o produto (`FH-07.08`).
> **Verificação:** este estado é representado como nas demais áreas do produto? → SIM = cumpre | NÃO = viola.

**`FH-41.11`** — Todo estado exibido **DEVE** ser verdadeiro no momento da exibição.
Estado obsoleto **DEVE** ser atualizado ou declarado como desatualizado, com o
momento da última verificação.
> **Verificação:** o estado exibido corresponde ao momento atual, ou declara sua defasagem? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define o **conjunto fechado de situações** em que qualquer parte do
produto pode se encontrar, e obriga a projetá-las todas. Ele existe porque a
maioria dos defeitos percebidos pelo usuário não está na lógica principal — está
nos estados que ninguém desenhou.

---

## 2. Perguntas que este capítulo responde

- Quais estados existem?
- É obrigatório desenhar todos?
- Como trato sucesso parcial?
- Como represento algo acontecendo em segundo plano?
- O que fazer quando um serviço externo falha?
- Falta de permissão é erro?

---

## 3. Definições

**Estado** — situação observável de uma tela, componente ou operação em um
momento.

**Estado aplicável** — aquele que a tela pode realisticamente assumir. Nem todos os
dez se aplicam a tudo.

**Sucesso parcial** — operação em que parte dos itens teve êxito e parte falhou.

**Degradação** — funcionamento reduzido por falha de dependência externa.

**Representação canônica** — a forma única e padronizada de exibir um estado.

---

## 4. Fundamento

**Por que o catálogo é fechado.** Estados abertos produzem invenção local: cada
tela cria sua própria forma de dizer "carregando", "vazio" ou "deu ruim". O usuário
então precisa aprender o vocabulário visual de cada área — exatamente o oposto de
`FH-05.02`. Um catálogo fechado com representação canônica (`FH-41.10`) permite que
ele aprenda dez situações uma vez e as reconheça em qualquer lugar, inclusive em
telas que nunca viu.

**Por que todos os estados são obrigatórios.** O desenvolvimento acontece no
caminho feliz: dados existem, rede funciona, permissão está concedida. Os demais
estados aparecem depois, em produção, e são tratados como defeitos pontuais — cada
um resolvido de um jeito, por uma pessoa diferente, sob pressão. `FH-41.02`
desloca esse trabalho para o momento de projeto, que é o único momento barato e o
único em que a coerência é possível.

**Por que sucesso parcial precisa existir como estado.** É o estado mais evitado e
o mais consequente. Representar "112 de 120 enviados" como "envio concluído" é
mentira de estado (P9) com efeito prático imediato: oito pessoas não receberam algo
que o usuário acredita ter enviado. Ele descobrirá pelo cliente, e a confiança em
todos os "concluído" do produto cai junto.

**Por que degradação é declarada.** Quando um serviço externo falha, o produto pode
continuar parcialmente funcional. Sem declaração, o usuário interpreta a
funcionalidade ausente como defeito geral e para de usar o que ainda funciona.
`FH-41.06` exige o inverso: dizer o que caiu e o que permanece.

**Por que permissão não é erro.** Erro comunica que algo deu errado; falta de
permissão significa que o sistema está funcionando exatamente como deveria.
Apresentá-la com linguagem de falha produz ansiedade desnecessária e faz o usuário
procurar suporte para um comportamento correto. Além disso, mensagens de erro
tendem a revelar mais do que deveriam — e `FH-10.06` proíbe revelar existência.

**Por que transições não podem saltar.** O salto de layout é o defeito de estado
mais comum e mais irritante: o usuário clica no que estava ali e atinge outra
coisa, porque o conteúdo se moveu entre a intenção e o clique. Isso viola `FH-19`
(ergonomia) e produz erros que parecem culpa do usuário.

---

## 5. O catálogo fechado de estados

| # | Estado | Quando ocorre | Obrigação |
| --- | --- | --- | --- |
| 1 | **Inicial** | Antes de qualquer carregamento | Reservar espaço; nunca tela em branco |
| 2 | **Carregando** | Dados a caminho | Resposta ≤ janela de percepção (`FH-46`); esqueleto com a forma final |
| 3 | **Vazio** | Não há o que exibir | Tratamento por tipo (`FH-42`) |
| 4 | **Conteúdo** | Estado normal | Hierarquia do Capítulo 24 |
| 5 | **Parcial** | Parte carregou, parte não | Exibir o que há e declarar o que falta |
| 6 | **Atualizando** | Conteúdo presente, dados novos chegando | Nunca bloquear; nunca deslocar (`FH-41.09`) |
| 7 | **Sucesso parcial** | Operação com falhas em parte dos itens | Estado próprio; relatório por item (`FH-44.08`) |
| 8 | **Erro** | Falha que impede a operação | Anatomia do Capítulo 44 |
| 9 | **Sem permissão** | Acesso não autorizado | Estado explicado, sem linguagem de falha (`FH-51`) |
| 10 | **Degradado / offline** | Dependência externa indisponível | Declarar o que funciona; recuperar sozinho (`FH-41.07`) |

**Como usar.** Ao projetar qualquer tela: percorra os dez, marque os aplicáveis,
projete cada um. Estados não aplicáveis são declarados como tal — a declaração é o
que distingue "não se aplica" de "esqueci".

---

## 6. Regras normativas

### `FH-41.02` — Cobertura obrigatória

**Quando NÃO aplicar.** Componentes puramente decorativos ou estruturais, sem dado
nem ação.

**Certo.** Uma lista projeta: inicial, carregando, vazio (três tipos), conteúdo,
atualizando, erro, sem permissão.

**Errado.** Implementar carregamento e conteúdo, e descobrir os demais em produção.

### `FH-41.04` — Transições sem salto

**Certo.** O esqueleto ocupa exatamente o espaço do conteúdo final; ao chegar, nada
se move.

**Errado.** Aviso que surge no topo e empurra a lista para baixo no instante do
clique.

### `FH-41.05` — Sucesso parcial

**Certo.** "112 de 120 enviados. 8 falharam — ver detalhes e reenviar."

**Errado.** "Envio concluído" com os erros disponíveis apenas em um registro
técnico.

### `FH-41.06` — Degradação

**Certo.** "O envio de mensagens está indisponível no momento. Conversas e
contatos continuam funcionando."

**Errado.** Botão que não responde, sem explicação. O usuário conclui que o produto
inteiro está quebrado.

### `FH-41.11` — Estado verdadeiro agora

**Quando NÃO aplicar.** Dados históricos, que são verdadeiros para o período que
declaram.

**Certo.** Indicador com "atualizado há 2 minutos" quando a atualização não é
contínua.

**Errado.** Exibir estado antigo como se fosse atual. É mentira por omissão de
tempo.

---

## 7. Anti-padrões

**Caminho feliz único.** Só conteúdo e carregamento implementados.

**Sucesso otimista.** Falhas parciais escondidas atrás de "concluído".

**Tela morta.** Ação sem resposta visível.

**Salto de layout.** Conteúdo se movendo no momento do clique.

**Erro de permissão.** Autorização ausente apresentada como falha.

**Estado congelado.** Informação antiga exibida como atual.

**Vocabulário local.** Cada área com sua forma de mostrar o mesmo estado.

---

## 8. Impactos

**Cognitivo.** Dez estados com representação canônica formam um vocabulário
visual aprendido uma vez e reconhecido em qualquer tela — inclusive nas que ainda
não existem.

**Emocional.** Estados bem tratados eliminam a ansiedade do "não sei o que está
acontecendo", que é a principal fonte de desconforto em software.

**Produtividade.** `FH-41.09` protege o trabalho em curso do próprio sistema —
atualizações que interrompem custam mais que a informação que trazem.

**Percepção de qualidade.** É o capítulo de maior efeito sobre a impressão de
acabamento: produtos que tratam todos os estados são percebidos como maduros,
mesmo com menos funcionalidades.

**Curva de aprendizagem.** Consistência de estados permite prever o comportamento
do sistema em situações novas — base do aprendizado por exploração.

---

## 9. Riscos e trade-offs

**Risco: custo de projeto.** Dez estados por tela multiplica o trabalho de desenho.
Mitigação: nem todos se aplicam sempre, e a representação canônica é reutilizada —
projeta-se uma vez para o produto inteiro.

**Risco: excesso de declaração.** Informar toda degradação pode gerar ruído.
Mitigação: P6 continua valendo — declara-se o que muda o que o usuário pode fazer.

**Risco: rigidez do catálogo.** Situações novas podem não caber. Mitigação: se um
estado real não cabe, é lacuna constitucional e vira emenda — nunca invenção local.

**Trade-off central.** Trocamos velocidade de entrega por completude. Cada tela
demora mais para ficar pronta; nenhuma tela surpreende o usuário depois.

---

## 10. Critérios de verificação

1. Todos os estados usados pertencem ao catálogo fechado.
2. Todos os estados aplicáveis foram projetados e implementados.
3. Nenhum caminho resulta em ausência de resposta visível.
4. Nenhuma transição desloca conteúdo ou perde posição.
5. Sucesso parcial tem estado próprio.
6. Degradação declara o que continua funcionando.
7. Perda de conexão é visível e a recuperação preserva o trabalho.
8. Falta de permissão é estado explicado, não erro.
9. Atualização em segundo plano não bloqueia nem desloca.
10. Cada estado tem a mesma representação em todo o produto.
11. Todo estado exibido é verdadeiro ou declara sua defasagem.

---

## 11. Checklist do capítulo

- [ ] Percorri os dez estados e marquei os aplicáveis.
- [ ] Projetei e implementei todos os aplicáveis.
- [ ] Nenhum caminho deixa a tela sem comunicar nada.
- [ ] As transições não movem conteúdo.
- [ ] Sucesso parcial aparece como sucesso parcial.
- [ ] A degradação diz o que ainda funciona.
- [ ] Falta de permissão não usa linguagem de erro.
- [ ] A representação é a mesma do resto do produto.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P9), 10 (veracidade), 14 (rede), 21 (estados de
entidade), 24 (composição).

**É pré-requisito de.** Capítulos 42 (vazios), 43 (feedback), 44 (erros), 46
(desempenho percebido), 50 (tempo real), 51 (permissões).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Estados de carregamento por rota | `loading.tsx` e estados locais em `src/app/(dashboard)/` |
| Erros de rota | `error.tsx`, `not-found.tsx` |
| Estados de conexão e tempo real | `src/lib/presence.ts`, canais de realtime |
| Estados de operação em lote | `src/lib/broadcast-status.ts`, `src/lib/template-status.ts` |
| Representações visuais | `src/components/ui/` (skeletons, alert, badge) |
