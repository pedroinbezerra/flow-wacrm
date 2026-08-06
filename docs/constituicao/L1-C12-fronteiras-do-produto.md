# Capítulo 12 — Fronteiras: O Que o FlowHub Nunca Será

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 6, 7, 8 |
| É pré-requisito de | Capítulos 20, 66, 67 |
| Artigos | `FH-12.01` a `FH-12.10` |

---

## 0. Núcleo Normativo

**`FH-12.01`** — Toda proposta de funcionalidade **DEVE** passar nos quatro testes,
cumulativamente: **Pertencimento** (`FH-05.05`), **Direção** (`FH-06.01`),
**Princípios** (`FH-07.01`) e **Custo Permanente** (`FH-12.06`). Reprovar em
qualquer um significa não construir.
> **Verificação:** a proposta passou nos quatro testes, com registro? → SIM = cumpre | NÃO = viola.

**`FH-12.02`** — Frequência de pedido **NUNCA** é justificativa suficiente para
construir. Quantidade de solicitações é evidência de **problema**, jamais
validação de **solução**.
> **Verificação:** a justificativa se apoia principalmente no número de pedidos? → NÃO = cumpre | SIM = viola.

**`FH-12.03`** — Toda recusa **DEVE** ser classificada como **"não agora"** ou
**"nunca"**, com motivo escrito. Recusa sem classificação é inválida e reabre a
cada trimestre.
> **Verificação:** a recusa está classificada e registrada com motivo? → SIM = cumpre | NÃO = viola.

**`FH-12.04`** — As fronteiras permanentes de §6 **NUNCA** são atravessadas sem
emenda ao Capítulo 5 ou 20. Pedido reiterado não altera fronteira.
> **Verificação:** a proposta atravessa alguma fronteira permanente sem emenda? → NÃO = cumpre | SIM = viola.

**`FH-12.05`** — Funcionalidade que atende a **um único cliente** e não se
generaliza **NUNCA** entra no produto.
> **Verificação:** esta funcionalidade serve a mais de um cliente sem adaptação específica? → SIM = cumpre | NÃO = viola.

**`FH-12.06`** — **Teste do Custo Permanente.** Toda proposta **DEVE** declarar seu
custo recorrente: manutenção, suporte, superfície de teste, carga cognitiva
adicionada a todos os usuários e restrição imposta a evoluções futuras.
> **Verificação:** o custo permanente está declarado por escrito? → SIM = cumpre | NÃO = viola.

**`FH-12.07`** — É proibido construir por reação a concorrente. Paridade de
funcionalidade **NUNCA** é fundamento.
> **Verificação:** a justificativa se apoia na existência da funcionalidade em outro produto? → NÃO = cumpre | SIM = viola.

**`FH-12.08`** — Ampliar o escopo do produto exige emenda ao Capítulo 5
(identidade) ou 20 (modelo mental), com análise de impacto. Escopo **NUNCA**
cresce por acumulação silenciosa de funcionalidades.
> **Verificação:** a funcionalidade amplia o escopo? Se SIM, existe emenda correspondente? → SIM = cumpre | NÃO = viola.

**`FH-12.09`** — Remover é evolução legítima. Funcionalidade que deixou de servir
ao produto **DEVERIA** ser depreciada pelo ciclo do Capítulo 66, e não mantida por
inércia.
> **Verificação:** funcionalidade sem uso e sem propósito permanece por decisão registrada, ou por inércia? → Decisão = cumpre | Inércia = viola.

**`FH-12.10`** — Recusar **DEVE** ser feito com explicação do critério, nunca com
silêncio nem com promessa vaga de futuro.
> **Verificação:** a recusa foi comunicada com o critério que a fundamentou? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Um produto se define tanto pelo que recusa quanto pelo que faz. Este capítulo dá
a quem decide um **critério objetivo para dizer não** — e, tão importante quanto,
um mecanismo para que o não permaneça dito, em vez de ser reaberto a cada
trimestre por quem não conhece a decisão anterior.

---

## 2. Perguntas que este capítulo responde

- Devemos construir isto?
- Como recuso sem parecer arbitrário?
- Muitos clientes pediram. Isso muda algo?
- O concorrente tem. E daí?
- Um cliente grande exige. E agora?
- Qual a diferença entre "não agora" e "nunca"?
- Podemos remover algo que já existe?
- Como impeço que a mesma discussão volte todo trimestre?

---

## 3. Definições

**Fronteira permanente** — limite de escopo que só se altera por emenda à
identidade.

**Custo permanente** — soma dos custos recorrentes de uma funcionalidade após a
entrega. Sempre maior que o custo de construção.

**Não agora** — recusa por prioridade, maturidade ou dependência. A proposta
continua válida.

**Nunca** — recusa por incompatibilidade com a identidade. A proposta só volta por
emenda.

**Paridade reativa** — construir porque outro produto tem. Proibida.

**Acumulação silenciosa** — crescimento de escopo por soma de funcionalidades
individualmente pequenas, sem que ninguém tenha decidido ampliar o produto.

---

## 4. Fundamento

**Por que recusar é mais difícil do que aceitar.** Aceitar tem beneficiário
imediato e visível: o cliente que pediu, o vendedor que fechou, a métrica que
sobe. Recusar tem beneficiário difuso e futuro: todos os usuários que não
receberão uma tela mais complexa, e a equipe que não manterá mais um caminho
durante anos. Como o custo de aceitar é invisível e o de recusar é imediato, a
tendência natural de todo produto é crescer até perder identidade. Este capítulo é
o contrapeso estrutural a essa assimetria.

**Por que frequência de pedido não basta.** Pedidos descrevem soluções que o
usuário imaginou a partir do que ele conhece — geralmente, do produto anterior que
usava. Cem pedidos por um campo específico podem indicar um problema real e uma
solução ruim. `FH-12.02` não manda ignorar o pedido: manda extrair o problema e
resolvê-lo pelo caminho do produto. É a diferença entre ouvir o cliente e
obedecer ao cliente.

**Por que o custo permanente precisa ser declarado.** Toda funcionalidade tem
quatro custos que ninguém contabiliza na decisão: manutenção enquanto existir;
suporte enquanto for usada; carga cognitiva imposta a **todos** os usuários,
inclusive os que nunca a usarão; e restrição a evoluções futuras, porque cada
funcionalidade existente limita o que pode ser mudado sem quebrar alguém. A soma
desses quatro costuma superar o custo de construção em ordens de grandeza — e é
integralmente ignorada quando a decisão considera apenas o esforço de entrega.

**Por que "nunca" precisa ser dito.** Recusas classificadas apenas como "não
agora" retornam indefinidamente, consumindo discussão a cada ciclo. Pior:
transmitem esperança falsa a quem pediu. Dizer "nunca", com o critério explícito,
é mais respeitoso e mais barato — encerra a questão e permite que o cliente busque
a solução em outro lugar, o que é um serviço legítimo a ele.

**Por que remover é evolução.** Funcionalidades permanecem por inércia porque
removê-las gera reclamação imediata e visível, enquanto mantê-las gera custo
difuso. É a mesma assimetria da decisão de construir, invertida no tempo.
`FH-12.09` estabelece que a permanência precisa ser uma decisão, não uma omissão.

---

## 5. Princípios

**O produto se define pelo que recusa.**

**Pedido é evidência de problema, nunca validação de solução.**

**Toda funcionalidade cobra aluguel para sempre.**

**Recusa sem critério explícito não permanece recusada.**

---

## 6. Fronteiras permanentes

As fronteiras abaixo **NUNCA** são atravessadas sem emenda ao Capítulo 5 ou 20
(`FH-12.04`). Cada uma vem com o motivo, porque uma fronteira sem motivo escrito
será removida pela primeira equipe que a encontrar.

| Fronteira | O FlowHub nunca será | Motivo |
| --- | --- | --- |
| **Contabilidade e fiscal** | Sistema de escrituração, emissão fiscal ou contabilidade | Domínio regulado, com modelo mental próprio e ciclo alheio à operação comercial (`FH-05.07`) |
| **Gestão financeira interna** | Controle de caixa, folha, tesouraria | Não pertence ao eixo Pessoa → Conversa → Processo → Resultado |
| **Gestão de projetos genérica** | Ferramenta de tarefas de propósito geral | Modelo mental concorrente ao do produto |
| **Rede social ou marketplace** | Ambiente de descoberta entre contas | Contradiz o isolamento por conta (`FH-10.06`) |
| **Chatbot autônomo sem revisão** | Agente que conversa com clientes sem supervisão humana | Viola `FH-07.03` e `FH-11.06` |
| **Ferramenta de disparo em massa sem base** | Plataforma de envio para listas sem consentimento | Viola `FH-11.08` e `FH-11.10` |
| **Painel de vigilância de equipe** | Monitoramento individual como produto | Viola `FH-11.07` |
| **Construtor genérico sem opinião** | Plataforma de baixo código para qualquer aplicação | Contradiz P1: transfere complexidade ao usuário |
| **Produto multiperfil por segmento** | Versões estruturalmente distintas por nicho | Contradiz `FH-05.02` e `FH-07.08` |
| **Ambiente de personalização visual pelo cliente** | Interface reconfigurável pelo usuário final | Contradiz P7 e `FH-09.09` |

**Como usar.** Antes de qualquer proposta significativa, verificar a tabela. Se a
proposta cruza uma fronteira, o caminho é emenda com análise de impacto — não
exceção, não piloto, não "versão simples".

---

## 7. Anti-padrões

**Roadmap por pedido.** Construir o que mais aparece na lista. Sintoma: produto
sem tese, com funcionalidades que não conversam entre si.

**Sim para fechar contrato.** Compromisso comercial que vira escopo. Sintoma:
funcionalidades usadas por um único cliente.

**Paridade reativa.** Perseguir a lista do concorrente. Sintoma: decisões
justificadas por comparativos.

**Piloto permanente.** Atravessar fronteira "só para testar" e nunca reverter.

**Não agora eterno.** Recusar sem classificar, rediscutir para sempre.

**Museu de funcionalidades.** Manter tudo que já foi construído por medo de
reclamação.

---

## 8. Impactos

**Cognitivo.** Cada funcionalidade recusada é carga que nenhum usuário precisará
carregar. O efeito é invisível individualmente e determinante no acumulado — é a
diferença entre um produto que continua compreensível ao longo dos anos e um que
não continua.

**Emocional.** Clientes reagem melhor a um não explicado do que a um talvez
indefinido. `FH-12.10` protege a relação: o critério comunicado mostra que existe
um produto com identidade, e não uma equipe indisponível.

**Produtividade.** Recusas bem registradas eliminam rediscussão recorrente, que é
um dos maiores desperdícios de tempo em times de produto.

**Percepção de qualidade.** Produtos focados são percebidos como melhores mesmo
quando fazem menos. Amplitude sem coerência é percebida como confusão, não como
poder.

**Curva de aprendizagem.** O escopo controlado mantém a curva finita. Cada
funcionalidade adicionada estende a curva para todos os futuros usuários.

---

## 9. Riscos e trade-offs

**Risco: perder negócio real.** Recusas custarão contratos. É o custo mais
concreto e imediato deste capítulo, e ele é aceito conscientemente. A alternativa
— aceitar tudo — leva a um produto que não é bom em nada e que perderá os mesmos
contratos, mais tarde e com mais custo acumulado.

**Risco: rigidez diante de mudança real de mercado.** Uma fronteira pode estar
errada. Mitigação: emenda com evidência (`FH-04.03`). Fronteira não é dogma; é
decisão que exige o mesmo rigor para ser mudada que teve para ser criada.

**Risco: recusar por conservadorismo.** O capítulo pode ser usado para evitar
trabalho. Mitigação: `FH-12.01` exige os quatro testes com registro — recusar
também precisa de fundamento.

**Trade-off central.** Trocamos crescimento por coerência. Um produto que aceita
tudo cresce mais rápido em funcionalidades e mais devagar em valor. O FlowHub
escolhe o inverso, e essa escolha é o que torna possível cumprir todo o resto
desta Constituição.

---

## 10. Critérios de verificação

1. Toda funcionalidade construída tem os quatro testes registrados.
2. Nenhuma justificativa se apoia principalmente em número de pedidos.
3. Toda recusa está classificada como "não agora" ou "nunca", com motivo.
4. Nenhuma fronteira permanente foi atravessada sem emenda.
5. Nenhuma funcionalidade serve a um único cliente.
6. Todo custo permanente foi declarado antes da aprovação.
7. Nenhuma justificativa se apoia em paridade com concorrente.
8. Toda recusa foi comunicada com o critério.

---

## 11. Checklist do capítulo

- [ ] Passa no Teste de Pertencimento?
- [ ] Passa no Teste da Direção?
- [ ] Não contraria nenhum dos dez princípios?
- [ ] Declarei o custo permanente — manutenção, suporte, carga, restrição?
- [ ] Não estou construindo por frequência de pedido nem por paridade.
- [ ] Serve a mais de um cliente sem adaptação específica?
- [ ] Não atravessa fronteira permanente sem emenda.
- [ ] Se recusei: classifiquei, registrei o motivo e comuniquei o critério.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5 (identidade), 6 (tese), 7 (princípios), 8
(simplicidade).

**É pré-requisito de.** Capítulo 20 (modelo mental), 66 (depreciação), 67
(evolução).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Escopo atual do produto | `src/app/(dashboard)/` — cada rota é uma capacidade admitida |
| Registro de recusas | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Ciclo de depreciação | Capítulo 66 (a escrever) |
| Limites de plano e consumo | `src/lib/plans/`, `src/lib/consumption/` |
