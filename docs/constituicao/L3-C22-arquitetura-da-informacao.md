# Capítulo 22 — Arquitetura da Informação

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 8, 15, 20, 21 |
| É pré-requisito de | Capítulos 23, 24, 36, 47 |
| Artigos | `FH-22.01` a `FH-22.11` |

---

## 0. Núcleo Normativo

**`FH-22.01`** — A organização do produto **DEVE** agrupar por **tarefa do
usuário**. Agrupamento por estrutura interna, modelo de dados, equipe responsável
ou ordem histórica de construção é proibido (`FH-05.09`, `FH-15.03`).
> **Verificação:** este agrupamento reflete tarefas do usuário? → SIM = cumpre | NÃO = viola.

**`FH-22.02`** — A profundidade máxima de navegação é de **três níveis** a partir
da navegação principal. Nada essencial fica além disso.
> **Verificação:** quantos níveis separam esta informação da navegação principal? → ≤3 = cumpre | 4+ = viola.

**`FH-22.03`** — Toda informação tem **um lar único e canônico**. A mesma
informação **PODE** ser exibida em vários lugares, mas apenas um deles é o lugar
onde ela vive, é editada e é considerada verdadeira.
> **Verificação:** é possível apontar o lar canônico desta informação? → SIM = cumpre | NÃO = viola.

**`FH-22.04`** — Toda tela **DEVE** ter hierarquia de prioridade declarada: o que é
essencial, o que é contextual e o que é secundário.
> **Verificação:** a hierarquia de prioridade da tela está declarada? → SIM = cumpre | NÃO = viola.

**`FH-22.05`** — Criar, fundir ou remover uma seção da navegação principal exige os
critérios objetivos de §6 e emenda a este capítulo. A navegação principal **NUNCA**
cresce por acumulação.
> **Verificação:** a alteração da navegação principal atende aos critérios e tem emenda? → SIM = cumpre | NÃO = viola.

**`FH-22.06`** — Nenhum item de navegação existe apenas para conter outros itens.
Todo item **DEVE** levar a conteúdo próprio e útil.
> **Verificação:** este item de navegação leva a conteúdo próprio? → SIM = cumpre | NÃO = viola.

**`FH-22.07`** — Toda informação **DEVE** ser alcançável por pelo menos dois
caminhos: navegação estrutural **e** busca (`FH-47`).
> **Verificação:** esta informação é alcançável por navegação e por busca? → SIM = cumpre | NÃO = viola.

**`FH-22.08`** — Nomes de seção **DEVEM** designar o objeto ou a tarefa, usando o
par canônico do Capítulo 21. Nomes genéricos, ações vagas e termos internos são
proibidos.
> **Verificação:** o nome designa objeto ou tarefa, com termo canônico? → SIM = cumpre | NÃO = viola.

**`FH-22.09`** — A ordem dos itens da navegação principal **DEVE** seguir a
frequência real de uso (`FH-13.10`), e **NUNCA** a importância declarada ou a
ordem de construção.
> **Verificação:** a ordem deriva de frequência real medida? → SIM = cumpre | NÃO = viola.

**`FH-22.10`** — **Configuração global** vive em lar único; **configuração de
contexto** vive no ponto de uso. É proibido espalhar configuração global por telas
operacionais e proibido exigir ida à configuração global para ajustar algo
específico do contexto.
> **Verificação:** esta configuração está no lugar correto conforme seu alcance? → SIM = cumpre | NÃO = viola.

**`FH-22.11`** — Nenhuma informação relevante existe **apenas** em um caminho
profundo. Se algo importa para a tarefa, ele aparece onde a tarefa acontece — ainda
que resumido, com acesso ao detalhe (`FH-15.06`).
> **Verificação:** a informação necessária à tarefa está disponível onde a tarefa ocorre? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **onde as coisas ficam**. Ele traduz o modelo mental
(Capítulo 20) e a ontologia (Capítulo 21) em uma organização navegável, e
estabelece os critérios que impedem essa organização de degradar conforme o
produto cresce.

---

## 2. Perguntas que este capítulo responde

- Onde isto vai?
- Quantos níveis de profundidade são aceitáveis?
- Quando criar uma nova seção de topo?
- Como decido o que aparece primeiro?
- A mesma informação pode estar em dois lugares?
- Configurações ficam todas juntas?

---

## 3. Definições

**Navegação principal** — o conjunto de destinos permanentes de primeiro nível.

**Lar canônico** — o lugar onde uma informação vive, é editada e é considerada
verdadeira. Todo o resto são exibições.

**Exibição** — aparição de uma informação fora do seu lar, em modo consulta ou com
edição que grava no lar.

**Profundidade** — número de passos de navegação a partir do primeiro nível.

**Configuração global** — ajuste que vale para a conta inteira.

**Configuração de contexto** — ajuste que vale para um item específico.

---

## 4. Fundamento

**Por que agrupar por tarefa.** O usuário procura pelo que quer fazer, não pelo
lugar onde o dado é armazenado. Organizações que espelham a estrutura interna
exigem que ele aprenda a arquitetura do sistema antes de encontrar qualquer coisa
— exatamente o que `FH-20.08` proíbe. Esse erro é especialmente comum porque a
estrutura interna é a organização mais óbvia para quem constrói.

**Por que três níveis.** Cada nível adicional reduz drasticamente a probabilidade
de descoberta e aumenta o custo de retorno. Três níveis cobrem estrutura
suficiente para um produto desta complexidade; o quarto nível quase sempre indica
que o agrupamento acima está errado — e a solução correta é reorganizar, não
aprofundar.

**Por que lar único, com exibições livres.** Duplicar informação sem hierarquia
produz divergência: dois lugares mostram valores diferentes e ninguém sabe qual
vale. Mas proibir a exibição em vários lugares violaria `FH-15.06` (a informação
vem ao usuário). A solução é assimétrica: **um lar, muitas janelas**. A edição
sempre grava no lar; a exibição sempre reflete o lar.

**Por que a navegação principal não cresce.** É o recurso mais escasso do produto:
cada item adicional dilui a atenção de todos os outros e aumenta o tempo de
localização. A tendência natural é crescer — toda área nova quer visibilidade de
topo. `FH-22.05` torna esse crescimento uma decisão constitucional, e não uma
consequência de quem entregou por último.

**Por que ordem por frequência.** A posição no início da navegação é a de menor
custo de acesso. Distribuí-la por importância declarada é sempre uma decisão
política; distribuí-la por frequência é uma decisão aritmética, e ela otimiza o
custo agregado real.

**Por que configuração tem dois lares.** Centralizar tudo obriga o usuário a sair
do contexto para ajustar algo daquele contexto — viola `FH-15.06`. Espalhar tudo
torna a configuração global impossível de encontrar e auditar. A regra de
`FH-22.10` separa por **alcance**, que é um critério objetivo: o que vale para a
conta fica junto; o que vale para um item fica no item.

---

## 5. Princípios

**O usuário procura pela tarefa, nunca pela estrutura.**

**Um lar, muitas janelas.**

**A navegação principal é território escasso.**

**Profundidade é a solução preguiçosa para agrupamento ruim.**

---

## 6. Regras normativas

### Critérios para alterar a navegação principal (`FH-22.05`)

Uma seção nova só é criada se **todos** os critérios forem atendidos:

1. Representa uma **tarefa recorrente** do usuário, não uma funcionalidade.
2. Tem conteúdo próprio e útil, não é apenas contêiner (`FH-22.06`).
3. Não cabe em nenhuma seção existente sem distorcer o significado dela.
4. Sua frequência de uso justifica ocupar território de primeiro nível
   (`FH-22.09`).
5. Seu nome usa o par canônico do Capítulo 21.

Duas seções **DEVEM** ser fundidas quando os usuários alternam constantemente entre
elas para concluir uma única tarefa. Uma seção **DEVERIA** ser removida quando sua
frequência de uso for residual e seu conteúdo couber em outra sem distorção — pelo
ciclo do Capítulo 66.

### `FH-22.03` — Lar canônico

**Quando aplicar.** A toda informação editável.

**Quando NÃO aplicar.** A informação derivada e a agregada não têm lar próprio:
elas pertencem ao lar das informações que as originam.

**Certo.** O responsável por uma conversa é editado na conversa e **exibido** na
lista, no quadro e na ficha do contato.

**Errado.** O mesmo atributo editável em dois lugares, com regras diferentes.

### `FH-22.04` — Hierarquia declarada

**Certo.** "Essencial: conversa e composição. Contextual: dados do contato.
Secundário: histórico de automações."

**Errado.** Tela sem hierarquia declarada — todo elemento com o mesmo peso, o que
força o usuário a decidir a cada visita o que é importante.

### `FH-22.08` — Nomes de seção

**Errado.** Nomes genéricos que não designam objeto nem tarefa, ou termos internos
do sistema. O usuário não consegue prever o que encontrará antes de clicar — e
navegação imprevisível força exploração exaustiva.

### `FH-22.11` — Informação onde a tarefa acontece

**Errado.** Para decidir um envio, precisar navegar até a área de consumo para
saber quanto do limite já foi usado.

---

## 7. Anti-padrões

**Navegação-organograma.** Estrutura interna virando menu.

**Menu-guarda-chuva.** Item que só existe para conter outros.

**Quarto nível.** Informação essencial enterrada.

**Dois lares.** Mesmo dado editável em dois lugares.

**Topo inflacionado.** Navegação principal crescendo a cada entrega.

**Configuração diáspora.** Ajustes globais espalhados por telas operacionais.

**Nome genérico.** Seções cujo conteúdo é imprevisível pelo nome.

---

## 8. Impactos

**Cognitivo.** Agrupamento por tarefa elimina a tradução entre intenção e
estrutura. É o ganho cognitivo mais alto disponível na organização do produto.

**Emocional.** Encontrar as coisas rapidamente produz competência percebida; não
encontrar produz a sensação de inadequação — o usuário culpa a si mesmo.

**Produtividade.** `FH-22.11` e `FH-22.02` atacam diretamente o tempo de
localização, que é uma fração significativa e invisível da jornada.

**Percepção de qualidade.** Arquitetura clara é lida como produto pensado.
Navegação inflada é lida como produto que cresceu sem cuidado.

**Curva de aprendizagem.** Uma estrutura previsível permite inferir onde algo
novo estará. Estrutura arbitrária exige memorizar cada local.

---

## 9. Riscos e trade-offs

**Risco: rigidez da navegação principal.** Funcionalidades novas podem ficar sem
visibilidade adequada. Mitigação: `FH-22.07` (busca como segundo caminho) e
`FH-22.11` (informação aparece onde a tarefa ocorre).

**Risco: excesso de fusão.** Fundir seções pode produzir telas sobrecarregadas.
Mitigação: os limites do Capítulo 15 continuam valendo — fusão que estoure o
orçamento cognitivo é proibida.

**Risco: lar canônico distante.** Centralizar edição pode afastar o usuário do
contexto. Mitigação: a exibição pode editar, desde que grave no lar — a assimetria
é de verdade, não de acesso.

**Trade-off central.** Trocamos visibilidade individual de funcionalidades por
clareza do conjunto. Cada área ganha menos destaque; o produto inteiro fica
navegável.

---

## 10. Critérios de verificação

1. Todo agrupamento reflete tarefas do usuário.
2. Nada essencial está a mais de três níveis.
3. Toda informação editável tem lar canônico único identificável.
4. Toda tela tem hierarquia de prioridade declarada.
5. Nenhuma alteração da navegação principal ocorreu sem critérios e emenda.
6. Nenhum item de navegação é apenas contêiner.
7. Toda informação é alcançável por navegação e por busca.
8. Todos os nomes de seção usam o par canônico.
9. A ordem do primeiro nível deriva de frequência medida.
10. Configuração global e de contexto estão nos lares corretos.
11. A informação necessária à tarefa aparece onde a tarefa acontece.

---

## 11. Checklist do capítulo

- [ ] Agrupei por tarefa, não por estrutura interna.
- [ ] Nada essencial ficou além do terceiro nível.
- [ ] Sei apontar o lar canônico de cada informação editável.
- [ ] Declarei o que é essencial, contextual e secundário nesta tela.
- [ ] Não adicionei item à navegação principal sem os cinco critérios.
- [ ] Todo item de navegação leva a conteúdo próprio.
- [ ] A informação é alcançável também por busca.
- [ ] Configurações estão no lar correto conforme o alcance.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 8 (simplicidade), 15 (agrupamento), 20 (modelo), 21
(ontologia).

**É pré-requisito de.** Capítulos 23 (navegação), 24 (composição), 36 (densidade),
47 (busca).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Navegação principal | `src/components/layout/sidebar.tsx` |
| Seções de primeiro nível | Rotas em `src/app/(dashboard)/` |
| Configuração global | `src/app/(dashboard)/settings/` |
| Configuração de contexto | Painéis e formulários dentro de cada domínio |
| Nomes de seção | Chave `navigation` em `src/i18n/messages/pt-BR.json` |
