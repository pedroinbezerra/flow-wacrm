# Capítulo 3 — Hierarquia Normativa e Resolução de Conflitos

| Campo | Valor |
| --- | --- |
| Livro | 0 — A Constituição |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Volume 0 (§0.8), Capítulos 1 e 2 |
| É pré-requisito de | Capítulos 4, 61, 62, 65, 68 |
| Artigos | `FH-03.01` a `FH-03.11` |

---

## 0. Núcleo Normativo

**`FH-03.01`** — A ordem de precedência entre livros (§0.8 do Volume 0) é
vinculante: **I → II → V → III → VI → IV → VII → VIII**. Em conflito entre
artigos de livros distintos, vence o artigo do livro mais alto.
> **Verificação:** o artigo aplicado pertence ao livro de maior precedência entre os conflitantes? → SIM = cumpre | NÃO = viola.

**`FH-03.02`** — Quatro desempates atravessam toda a hierarquia e vencem sempre,
inclusive contra o Livro I: **(a)** segurança de dados e isolamento por conta;
**(b)** acessibilidade; **(c)** reversibilidade; **(d)** compreensão.
> **Verificação:** a solução escolhida sacrifica isolamento de dados, acessibilidade, reversibilidade ou compreensão em favor de outro valor? → NÃO = cumpre | SIM = viola.

**`FH-03.03`** — Artigo específico derroga artigo geral do mesmo nível
hierárquico. Especificidade é medida pelo escopo do enunciado, nunca pela
conveniência do resultado.
> **Verificação:** entre os artigos aplicáveis do mesmo livro, o de escopo mais restrito foi aplicado? → SIM = cumpre | NÃO = viola.

**`FH-03.04`** — Persistindo o empate após `FH-03.01` a `FH-03.03`, vence a
solução **reversível**, mesmo que seja mais lenta, mais verbosa ou menos elegante.
> **Verificação:** entre as soluções empatadas, a adotada é a da qual o usuário consegue voltar? → SIM = cumpre | NÃO = viola.

**`FH-03.05`** — Consistência global vence otimização local. Uma solução melhor
para uma tela isolada, porém divergente do padrão do produto, **NUNCA** é adotada
sem que o padrão inteiro seja emendado.
> **Verificação:** esta solução diverge de padrão constitucional vigente? Se SIM, existe emenda que altera o padrão para todo o produto? → SIM = cumpre | NÃO = viola.

**`FH-03.06`** — Obrigação legal ou contratual vence qualquer artigo. Quando a lei
contrariar a Constituição, a lei prevalece **e** o artigo afetado **DEVE** ser
emendado no mesmo ciclo para incorporar a restrição.
> **Verificação:** houve prevalência de obrigação legal sobre artigo? Se SIM, o artigo foi emendado no mesmo ciclo? → SIM = cumpre | NÃO = viola.

**`FH-03.07`** — Prazo, urgência, volume de pedidos, tamanho do cliente e
senioridade de quem propõe **NUNCA** são critérios de desempate. Não possuem peso
algum na resolução de conflito normativo.
> **Verificação:** a justificativa do desempate menciona prazo, urgência, cliente ou hierarquia? → NÃO = cumpre | SIM = viola.

**`FH-03.08`** — Todo conflito resolvido **DEVE** ser registrado com: artigos
conflitantes, critério aplicado, decisão e data. Conflito resolvido sem registro
é considerado não resolvido e reabre a cada ocorrência.
> **Verificação:** existe registro do conflito no Anexo E? → SIM = cumpre | NÃO = viola.

**`FH-03.09`** — Os conflitos recorrentes já arbitrados na tabela de §6 **NUNCA**
são rediscutidos caso a caso. Rediscussão exige emenda.
> **Verificação:** o conflito consta da tabela de arbitragens? Se SIM, a decisão da tabela foi seguida? → SIM = cumpre | NÃO = viola.

**`FH-03.10`** — Conflito que não se resolve por nenhum critério deste capítulo
**DEVE** virar proposta de emenda com prazo de decisão. É proibido deixá-lo em
aberto: enquanto pendente, aplica-se `FH-03.04` (solução reversível).
> **Verificação:** existe proposta de emenda com prazo para o conflito não resolvido? → SIM = cumpre | NÃO = viola.

**`FH-03.11`** — Um conflito **NUNCA** é resolvido cumprindo os dois lados pela
metade. Soluções que atendem parcialmente ambos os artigos e integralmente
nenhum são proibidas.
> **Verificação:** a solução cumpre integralmente ao menos um dos artigos conflitantes? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Toda constituição real produz conflitos internos, porque protege valores que
competem entre si. Densidade de informação compete com respiro visual. Automação
compete com controle. Velocidade compete com reversibilidade. Poder compete com
simplicidade.

Este capítulo garante que esses conflitos sejam resolvidos **sempre da mesma
forma**, por qualquer pessoa, em qualquer época. Sem ele, a Constituição seria um
conjunto de valores igualmente válidos — o que, na prática, significa que quem
decide escolhe o valor que prefere e cita o artigo correspondente. Isso não é
governança; é justificação.

---

## 2. Perguntas que este capítulo responde

- Dois artigos exigem coisas opostas. Qual vence?
- Acessibilidade contra estética: quem cede?
- A automação inteligente contraria o controle do usuário. O que fazer?
- Minha solução é melhor que o padrão, mas só nesta tela. Posso usar?
- A lei exige algo que a Constituição proíbe. E agora?
- O cliente é grande e o prazo é hoje. Isso muda alguma coisa?
- Posso resolver "meio a meio"?
- Quem decide quando nada resolve?

---

## 3. Definições

**Conflito normativo** — situação em que cumprir integralmente um artigo impede
cumprir integralmente outro.

**Conflito aparente** — situação em que os artigos parecem conflitar, mas uma
leitura correta do escopo mostra que apenas um se aplica. A maioria dos conflitos
é aparente e se dissolve com `FH-03.03`.

**Desempate transversal** — critério que vence independentemente da posição
hierárquica dos artigos em disputa. São quatro, listados em `FH-03.02`.

**Otimização local** — melhoria em um ponto do produto que aumenta a divergência
do conjunto.

**Meio-cumprimento** — solução que dilui ambos os artigos. Proibido por
`FH-03.11`.

---

## 4. Fundamento

**Por que existe uma ordem entre os livros.** A ordem não reflete importância
emocional, e sim **dependência causal**. A identidade (Livro I) define o que o
produto é; se ela ceder, o resto perde referência. O ser humano (Livro II) define
o que "melhor" significa; sem ele, otimizaríamos para o sistema. O comportamento
(Livro V) precede a estrutura e a matéria porque forma segue comportamento — uma
tela existe para permitir uma ação, não o contrário. O design system (Livro IV)
vem quase por último não porque importa pouco, mas porque é **consequência**:
tokens, componentes e espaçamentos existem para materializar decisões tomadas
antes. Inverter essa ordem produz o erro clássico de produtos guiados por design
system: interfaces internamente consistentes e externamente sem sentido.

**Por que existem desempates transversais.** Quatro valores não podem depender de
posição hierárquica porque suas violações são **assimétricas e irreversíveis**:

- *Isolamento de dados*: um vazamento entre contas não se desfaz. Nenhuma
  melhoria de experiência compensa.
- *Acessibilidade*: uma pessoa excluída não é uma experiência pior; é uma
  experiência ausente. A perda não é gradual, é binária.
- *Reversibilidade*: erro reversível custa segundos; erro irreversível pode custar
  a relação do usuário com um cliente dele. A assimetria de custo é de ordens de
  grandeza.
- *Compreensão*: poder que não se entende não é usado, ou é usado errado. Nos dois
  casos, seu valor real é zero ou negativo.

**Por que `FH-03.05` protege a consistência contra a melhoria local.** É o artigo
mais contraintuitivo do capítulo, porque parece impedir progresso. A razão é que
consistência tem valor composto e melhoria local tem valor isolado. Uma tela 10%
melhor e divergente adiciona uma exceção ao modelo mental do usuário — e exceções
não se somam linearmente, se multiplicam: cada uma reduz a confiança do usuário
na previsibilidade de todas as outras. A saída legítima existe e está no próprio
artigo: se a solução é realmente melhor, ela vira o padrão de todo o produto por
emenda. O que é proibido é ter as duas coisas ao mesmo tempo.

**Por que `FH-03.11` proíbe o meio-termo.** O instinto conciliador produz o pior
resultado possível: uma confirmação que existe mas é fraca demais para proteger e
irritante o bastante para atrapalhar; uma automação que age sozinha mas pede
confirmação em metade dos casos, e que por isso não é confiável nem previsível. O
meio-cumprimento entrega os custos de ambos os caminhos e os benefícios de
nenhum. Conflito real exige escolha, e escolher é o trabalho.

---

## 5. Princípios

**Hierarquia é dependência, não importância.** O que vem antes é o que sustenta o
que vem depois.

**Violações irreversíveis não competem com ganhos graduais.** Por isso quatro
critérios são transversais.

**Consistência tem valor composto.** Cada exceção custa mais do que a anterior.

**Conflito exige escolha.** Diluir os dois lados é a única resposta sempre errada.

---

## 6. Regras normativas — arbitragens permanentes

Os conflitos abaixo são recorrentes e já estão **decididos**. `FH-03.09` proíbe
rediscuti-los caso a caso.

| Conflito | Decisão permanente | Fundamento |
| --- | --- | --- |
| Densidade de informação × respiro visual | Vence a densidade em telas operacionais de uso contínuo; vence o respiro em telas de configuração e análise. O critério é a frequência de uso, nunca o gosto. | Operador de alto volume paga o custo do respiro excessivo em rolagem e tempo (Cap. 13, 19) |
| Acessibilidade × estética | Vence a acessibilidade, sempre, sem exceção. | `FH-03.02(b)` |
| Automação × controle do usuário | Vence o controle. A automação age, mas o usuário sempre vê o que foi feito e consegue reverter. | `FH-03.02(c)`, Cap. 18 |
| Velocidade × reversibilidade | Vence a reversibilidade. | `FH-03.02(c)` |
| Poder × simplicidade | Vence a simplicidade na superfície; o poder existe em profundidade, no mesmo lugar, sem "modo avançado" separado. | Cap. 8, 16 |
| Personalização × previsibilidade | Vence a previsibilidade para estrutura e navegação; a personalização atua em prioridade e sugestão. | Cap. 55 |
| Inteligência da IA × transparência | Vence a transparência. Sugestão sem origem visível não é enviada. | Cap. 52 |
| Consistência × melhoria local | Vence a consistência, salvo emenda que generalize a melhoria. | `FH-03.05` |
| Eficiência de disparo × respeito ao destinatário | Vence o destinatário. | Cap. 11 |
| Riqueza visual × desempenho percebido | Vence o desempenho percebido. | Cap. 46 |
| Coleta de dados × minimização | Vence a minimização. | Cap. 11 |
| Informação completa × carga cognitiva | Vence a carga cognitiva: mostra-se o que decide, com acesso ao resto. Nunca se omite sem caminho. | Cap. 15, 8 |

**Como usar esta tabela.** Identificar o conflito, aplicar a decisão, registrar a
aplicação. Se o conflito real não estiver na tabela e for recorrente, `FH-02.10`
o converte em nova linha por emenda.

**Quando NÃO usar.** Quando o caso é apenas superficialmente parecido. A
verificação é: os dois valores realmente se excluem aqui, ou existe solução que
cumpre ambos integralmente? Se existe, não há conflito — há falta de esforço de
desenho, e `FH-03.11` exige que se procure essa solução antes de arbitrar.

---

## 7. Anti-padrões

**Escalada hierárquica.** Subir ao Livro I para escapar de um artigo específico do
Livro IV. Proibido por `FH-02.03` e `FH-03.03`.

**Conflito fabricado.** Alegar conflito para justificar o caminho preferido,
quando na verdade existe solução que cumpre ambos.

**Arbitragem privada.** Resolver e não registrar. O mesmo conflito volta em três
meses e é decidido ao contrário.

**Exceção estética.** "Só nesta tela, porque fica muito melhor." É o mecanismo
mais comum de erosão de design system.

**Meio-termo conciliador.** Descrito em `FH-03.11`. Aparece como sinal de bom
senso e é o pior resultado disponível.

---

## 8. Impactos

**Cognitivo.** Elimina deliberação repetida. Conflitos arbitrados uma vez não
consomem atenção de novo — e a tabela de §6 converte as disputas mais caras do
produto em consulta de uma linha.

**Emocional.** Despersonaliza o desacordo. Sem hierarquia declarada, discordâncias
viram embates de gosto e de poder, com custo emocional alto e resultado
arbitrário. Com hierarquia, quem perde a disputa perde para uma regra, não para
uma pessoa.

**Produtividade.** O ganho concentra-se em decisões caras: as que envolvem várias
pessoas, várias reuniões e retrabalho. Uma arbitragem permanente pode economizar
dezenas de horas ao longo de anos.

**Percepção de qualidade.** `FH-03.05` é o artigo que mais protege a sensação de
"produto único". A percepção de qualidade em software nasce muito mais da
previsibilidade do conjunto do que da excelência isolada de uma tela.

**Curva de aprendizagem.** A hierarquia é a parte mais difícil de internalizar,
porque é abstrata. Mitigado pela tabela de §6, que entrega o resultado sem exigir
o raciocínio — quem entende o raciocínio decide casos novos; quem não entende
ainda decide certo nos casos conhecidos.

---

## 9. Riscos e trade-offs

**Risco: engessamento.** Arbitragens permanentes podem envelhecer mal quando o
contexto muda. Mitigação: emenda, com o custo deliberadamente baixo para casos
com evidência nova.

**Risco: hierarquia usada como atalho.** Pessoas podem invocar o livro superior
sem analisar o caso. Mitigação: `FH-03.03` (específico derroga geral) e exigência
de registro do critério aplicado.

**Risco: perda de boas ideias locais.** `FH-03.05` sacrifica melhorias reais. É um
custo assumido e consciente. A compensação é o caminho de emenda: a boa ideia não
é descartada, é generalizada ou registrada com sua justificativa para revisão
futura.

**Trade-off central.** Trocamos a otimização de cada parte pela coerência do
todo. Um produto composto de telas ótimas e mutuamente inconsistentes é pior, do
ponto de vista do usuário, do que um produto de telas boas e perfeitamente
previsíveis — porque o usuário não usa telas isoladas, usa um sistema.

---

## 10. Critérios de verificação

1. Todo conflito resolvido tem registro com artigos, critério, decisão e data.
2. Nenhuma solução entregue diverge de padrão vigente sem emenda correspondente.
3. Nenhuma justificativa de desempate menciona prazo, cliente ou hierarquia.
4. Conflitos da tabela de §6 foram resolvidos conforme a tabela.
5. Nenhuma solução entregue cumpre parcialmente dois artigos conflitantes.
6. Conflitos não resolvidos têm proposta de emenda com prazo.

---

## 11. Checklist do capítulo

- [ ] O conflito é real (os valores se excluem) ou aparente (falta desenho)?
- [ ] Consultei a tabela de arbitragens permanentes.
- [ ] Apliquei os desempates transversais antes da hierarquia de livros.
- [ ] Entre artigos do mesmo livro, apliquei o mais específico.
- [ ] Minha solução cumpre integralmente ao menos um dos lados.
- [ ] Registrei artigos, critério, decisão e data.
- [ ] Se nada resolveu, abri emenda com prazo e adotei a solução reversível.

---

## 12. Referências cruzadas

**Depende de.** Volume 0 (§0.8); Capítulos 1 e 2.

**É pré-requisito de.** Capítulo 4 (emenda), 61 (heurísticas), 62 (qualidade), 65
(governança), 68 (agentes). A tabela de §6 alimenta o Anexo C.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Registro de conflitos e arbitragens | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Consulta rápida de arbitragens | `docs/constituicao/ANEXO-C-matriz-de-decisao.md` |
| Obrigações legais que prevalecem | `docs/legal/`, `docs/business-rules/` |
| Isolamento por conta (desempate `a`) | Políticas RLS em `supabase/migrations/`, filtros por `account_id` |
