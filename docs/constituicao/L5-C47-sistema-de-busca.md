# Capítulo 47 — Sistema de Busca

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 20, 21, 22, 42, 46 |
| É pré-requisito de | Capítulos 48, 51 |
| Artigos | `FH-47.01` a `FH-47.10` |

---

## 0. Núcleo Normativo

**`FH-47.01`** — A busca alcança **entidades e ações**. Procurar "criar contato"
**DEVE** levar à ação, não apenas a registros que contenham essas palavras.
> **Verificação:** a busca retorna ações além de entidades? → SIM = cumpre | NÃO = viola.

**`FH-47.02`** — A busca responde **de forma incremental**, a cada caractere, dentro
da faixa instantânea (`FH-46.01`), sem exigir confirmação para começar a buscar.
> **Verificação:** resultados aparecem enquanto o usuário digita, sem ação de confirmação? → SIM = cumpre | NÃO = viola.

**`FH-47.03`** — A ordenação dos resultados **DEVE** ser explicável: relevância,
recência ou frequência declaradas. Ordem arbitrária é proibida.
> **Verificação:** é possível declarar o critério de ordenação aplicado? → SIM = cumpre | NÃO = viola.

**`FH-47.04`** — O **escopo** da busca **DEVE** estar sempre visível e ser alterável
sem sair do fluxo.
> **Verificação:** o usuário sabe onde está buscando e consegue mudar ali mesmo? → SIM = cumpre | NÃO = viola.

**`FH-47.05`** — A busca **DEVE** tolerar termos parciais, acentuação ausente,
maiúsculas e erros simples de digitação.
> **Verificação:** termo parcial e sem acento encontra o registro? → SIM = cumpre | NÃO = viola.

**`FH-47.06`** — Resultado vazio **DEVE** seguir o tratamento de vazio por filtro
(`FH-42.04`): mostrar o termo, o escopo e oferecer ampliação ou correção.
> **Verificação:** o vazio de busca mostra termo, escopo e caminho? → SIM = cumpre | NÃO = viola.

**`FH-47.07`** — A busca **DEVE** respeitar permissão e isolamento por conta, e
**NUNCA** revelar existência de dado inacessível — nem por resultado, nem por
contagem, nem por diferença de tempo de resposta (`FH-10.06`).
> **Verificação:** é possível inferir a existência de dado inacessível a partir da busca? → NÃO = cumpre | SIM = viola.

**`FH-47.08`** — A busca **DEVE** ser alcançável de qualquer lugar do produto, pelo
mesmo caminho, com o mesmo gesto (`FH-07.08`).
> **Verificação:** o acesso à busca é o mesmo em todas as áreas? → SIM = cumpre | NÃO = viola.

**`FH-47.09`** — Cada resultado **DEVE** trazer contexto suficiente para escolher
sem precisar abri-lo: identidade, tipo e um dado discriminante.
> **Verificação:** é possível escolher o resultado certo sem abrir vários? → SIM = cumpre | NÃO = viola.

**`FH-47.10`** — A busca **NUNCA** é o único caminho para alcançar algo. Toda
informação continua acessível por navegação estrutural (`FH-22.07`).
> **Verificação:** esta informação é alcançável sem usar a busca? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define a busca como **caminho universal de acesso** — a rota que
funciona quando o usuário sabe o que quer e não quer navegar. Ela é a superfície
que mais depende de coerência com o modelo mental (Capítulo 20), porque expõe o
produto inteiro em uma lista.

---

## 2. Perguntas que este capítulo responde

- Onde a busca vive?
- O que ela alcança?
- Como ordena resultados?
- Como lida com erro de digitação?
- O que faz quando não acha nada?
- Ela busca ações, além de dados?

---

## 3. Definições

**Entidade** — registro do domínio (Capítulo 21).

**Ação** — operação executável, com ou sem alvo.

**Escopo** — conjunto sobre o qual a busca opera.

**Termo discriminante** — dado que permite distinguir resultados semelhantes entre
si.

**Busca incremental** — resposta que se atualiza à medida que o termo é digitado.

---

## 4. Fundamento

**Por que a busca alcança ações.** Um usuário que sabe o que quer fazer não deveria
precisar descobrir onde aquilo fica. Buscar ações converte a busca em atalho
universal e reduz a dependência da navegação — o que é especialmente valioso para
o Visitante (A5), que não conhece a estrutura, e para o Operador (A1), que não quer
navegar. É também o que conecta este capítulo ao 48: a busca e a paleta de comandos
são a mesma superfície vista de dois ângulos.

**Por que a resposta é incremental.** Exigir confirmação para buscar transforma cada
tentativa em uma transação: digitar, confirmar, avaliar, corrigir, confirmar de
novo. A busca incremental permite refinar o termo pela observação do resultado, que
é mais rápido e mais preciso — o usuário corrige antes de terminar de digitar.

**Por que a ordenação precisa ser explicável.** Quando o usuário não entende por que
um resultado veio antes de outro, ele deixa de confiar na lista e passa a percorrer
tudo — o que anula o ganho da busca. Ordenação explicável não significa exibir o
algoritmo; significa que o critério é declarável em uma frase e coerente entre
buscas.

**Por que o escopo precisa ser visível.** A causa mais comum de "a busca não
encontra" é buscar no lugar errado sem saber. Escopo visível transforma um mistério
em um ajuste de um clique.

**Por que a tolerância é obrigatória.** Nomes reais têm acentuação variável,
abreviações e erros de digitação — tanto na base quanto na consulta. Uma busca
literal falha em uma proporção alta de casos reais e ensina o usuário a não confiar
nela. Depois disso, ele não volta.

**Por que a busca é o ponto mais delicado de tenancy.** É a superfície que consulta
o produto inteiro, e por isso a que mais facilmente vaza. `FH-47.07` cobre
explicitamente os três canais de vazamento: resultado, contagem e **tempo de
resposta** — este último é o mais esquecido e permite inferir existência por
medição.

---

## 5. Princípios

**Quem sabe o que quer não deve precisar navegar.**

**Busca que não explica sua ordem não é usada — é percorrida.**

**Termo parcial é o caso normal, não a exceção.**

**A busca é a superfície que mais facilmente vaza.**

---

## 6. Regras normativas

### O que a busca alcança

| Tipo | Exemplo de intenção | Resultado esperado |
| --- | --- | --- |
| **Entidade** | Nome de pessoa, negócio, automação | O registro, com contexto discriminante |
| **Ação** | "criar", "importar", "exportar" | A ação, executável dali |
| **Navegação** | Nome de uma área | O destino |
| **Configuração** | Nome de um ajuste | O ajuste, no seu lar canônico (`FH-22.10`) |

### `FH-47.03` — Critérios de ordenação aceitos

| Critério | Use quando |
| --- | --- |
| Correspondência exata primeiro | Sempre, como primeiro nível |
| Recência | Entidades com atividade recente são mais prováveis |
| Frequência de acesso do usuário | Há histórico suficiente e estável |
| Proximidade do contexto atual | O usuário está dentro de um domínio |

Combinações são permitidas desde que a ordem entre critérios seja fixa e
declarável. Ordem que varia sem explicação viola `FH-07.08`.

### `FH-47.09` — Contexto discriminante

**Certo.** Resultado de contato exibindo nome, meio de contato e última interação —
o suficiente para distinguir dois homônimos.

**Errado.** Lista de nomes iguais sem nenhum dado que os diferencie. O usuário abre
um a um, e a busca deixou de economizar trabalho.

---

## 7. Anti-padrões

**Busca só de registros.** Ações inalcançáveis por busca.

**Busca transacional.** Exigir confirmação a cada tentativa.

**Ordem misteriosa.** Resultados sem critério declarável.

**Escopo oculto.** Usuário buscando no lugar errado sem saber.

**Busca literal.** Falha por acento, maiúscula ou termo parcial.

**Resultado homônimo.** Itens indistinguíveis entre si.

**Vazamento por contagem.** Total revelando existência de dado inacessível.

**Vazamento por tempo.** Diferença de resposta permitindo inferir existência.

---

## 8. Impactos

**Cognitivo.** A busca substitui recordação de localização por reconhecimento de
resultado — a troca cognitiva mais vantajosa disponível (`FH-15.02`).

**Emocional.** Uma busca que encontra produz sensação de domínio imediato; uma que
falha produz desconfiança que se estende ao produto inteiro.

**Produtividade.** Para o Operador, é o caminho mais curto até qualquer coisa —
elimina navegação inteira, com ganho proporcional à frequência.

**Percepção de qualidade.** Qualidade de busca é um dos julgamentos mais rápidos que
um usuário faz sobre um sistema, e um dos mais difíceis de reverter.

**Curva de aprendizagem.** Busca que alcança ações permite usar o produto antes de
aprender sua estrutura — encurta a curva no ponto mais crítico.

---

## 9. Riscos e trade-offs

**Risco: complexidade de tolerância.** Busca tolerante exige mais que comparação
literal. Custo assumido: busca literal falha em uma proporção alta de casos reais.

**Risco: excesso de resultados.** Alcançar tudo pode produzir listas longas.
Mitigação: `FH-47.03` (ordenação explicável) e `FH-47.04` (escopo ajustável).

**Risco: vazamento sutil.** Otimizações de desempenho podem introduzir diferenças
de tempo que revelam existência. Mitigação: `FH-47.07` cobre explicitamente o
canal temporal — é o mais fácil de introduzir por acidente.

**Trade-off central.** Trocamos simplicidade de implementação por redução drástica
de navegação. Uma busca boa custa muito mais que uma busca literal — e economiza
mais que qualquer atalho.

---

## 10. Critérios de verificação

1. A busca retorna entidades e ações.
2. A resposta é incremental, sem confirmação.
3. O critério de ordenação é declarável.
4. O escopo é visível e alterável no fluxo.
5. Termos parciais, sem acento e com erro simples encontram resultados.
6. O vazio de busca mostra termo, escopo e caminho.
7. Nenhuma existência de dado inacessível é inferível — por resultado, contagem ou
   tempo.
8. O acesso à busca é idêntico em todo o produto.
9. Cada resultado traz contexto discriminante.
10. Toda informação é alcançável também sem busca.

---

## 11. Checklist do capítulo

- [ ] Ações aparecem nos resultados, não só registros.
- [ ] Os resultados aparecem enquanto digito.
- [ ] Sei explicar por que este resultado veio antes daquele.
- [ ] O escopo está visível e posso mudá-lo aqui.
- [ ] Testei termo parcial, sem acento e com erro de digitação.
- [ ] O vazio mostra o termo, o escopo e um caminho.
- [ ] Verifiquei resultado, contagem e tempo de resposta para dado inacessível.
- [ ] Consigo distinguir resultados semelhantes sem abrir.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10 (`FH-10.06`), 20 (modelo), 21 (entidades), 22
(`FH-22.07`), 42 (vazio), 46 (resposta incremental).

**É pré-requisito de.** Capítulos 48 (comandos), 51 (permissões).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Busca por domínio | Componentes de listagem em `src/components/contacts/`, `inbox/` |
| Consultas e escopo por conta | Filtros `account_id` e políticas RLS em `supabase/migrations/` |
| Entidades pesquisáveis | `src/types/index.ts` |
| Textos de busca e vazio | `src/i18n/messages/pt-BR.json` |
