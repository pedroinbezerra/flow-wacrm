# Capítulo 28 — Fundamentos do Design System

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 7 (P5), 8, 12, 24 |
| É pré-requisito de | Capítulos 29–40 |
| Artigos | `FH-28.01` a `FH-28.10` |

---

## 0. Núcleo Normativo

**`FH-28.01`** — O design system é **aplicação obrigatória** da Constituição, não
catálogo de estilo. Ele não cria regra de experiência; materializa as que já
existem.
> **Verificação:** esta decisão do design system deriva de artigo constitucional existente? → SIM = cumpre | NÃO = viola.

**`FH-28.02`** — **Reutilização antes de criação.** Criar componente novo exige
demonstrar que nenhum existente resolve, nem por composição (`FH-07.06`).
> **Verificação:** foi demonstrado que nenhuma primitiva existente resolve, isolada ou composta? → SIM = cumpre | NÃO = viola.

**`FH-28.03`** — Todo componente tem **ciclo de vida declarado**: proposta →
experimental → estável → depreciado → removido. Componente sem estágio declarado
não existe no sistema.
> **Verificação:** o estágio deste componente está declarado? → SIM = cumpre | NÃO = viola.

**`FH-28.04`** — Variante local não registrada é proibida. Toda variação visual ou
comportamental **DEVE** existir no sistema, com nome e critério de uso.
> **Verificação:** esta variação está registrada no sistema? → SIM = cumpre | NÃO = viola.

**`FH-28.05`** — Proposta de componente novo **DEVE** declarar: o problema, as
alternativas descartadas, os estados obrigatórios (`FH-34`) e o custo permanente
(`FH-12.06`).
> **Verificação:** os quatro itens estão declarados? → SIM = cumpre | NÃO = viola.

**`FH-28.06`** — **Composição antes de configuração.** Resolver por combinação de
primitivas é preferível a acrescentar opções a um componente existente.
> **Verificação:** a solução por composição foi considerada antes de adicionar opção? → SIM = cumpre | NÃO = viola.

**`FH-28.07`** — Nenhum componente decide **regra de negócio**. Ele apresenta,
recebe e comunica; a decisão vive na camada de domínio.
> **Verificação:** este componente contém regra de negócio? → NÃO = cumpre | SIM = viola.

**`FH-28.08`** — Uma responsabilidade por componente. Dois componentes que resolvem
o mesmo problema **DEVEM** ser fundidos ou ter fronteiras redefinidas no mesmo
ciclo.
> **Verificação:** existe outro componente resolvendo o mesmo problema? → NÃO = cumpre | SIM = viola.

**`FH-28.09`** — **Tokens são a única fonte de valores visuais.** Cor, espaço,
raio, tipografia e elevação vêm sempre do sistema (`FH-24.08`).
> **Verificação:** algum valor visual foi escrito diretamente, fora do sistema de tokens? → NÃO = cumpre | SIM = viola.

**`FH-28.10`** — Depreciação exige **prazo e substituto declarados**. Componente
depreciado sem caminho de migração permanece em uso por inércia (`FH-66`).
> **Verificação:** a depreciação declara prazo e substituto? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo estabelece o design system como **consequência da filosofia**, com
autoridade sobre implementações locais e regras de crescimento. Ele define quem
pode criar, quando reutilizar, e como um componente nasce e morre.

---

## 2. Perguntas que este capítulo responde

- Quando posso criar algo novo?
- Quando devo reutilizar?
- Como um padrão local vira sistema?
- Como um componente morre?
- Componente pode conter regra de negócio?

---

## 3. Definições

**Primitiva** — componente base, sem conhecimento de domínio.

**Componente de feature** — componente que compõe primitivas para resolver um caso
de domínio.

**Variante** — variação registrada de aparência ou comportamento de um componente.

**Composição** — resolver um caso combinando primitivas existentes.

**Configuração** — resolver um caso adicionando opções a um componente.

**Estágio** — posição do componente no ciclo de vida (`FH-28.03`).

---

## 4. Fundamento

**Por que o design system está no penúltimo lugar da hierarquia.** Ele vem depois de
identidade, ser humano, comportamento e estrutura (§0.8) porque é **consequência**
delas. Um design system tratado como origem produz o erro clássico: interfaces
internamente consistentes e externamente sem sentido — coerentes com o próprio
catálogo e desconectadas do trabalho real do usuário. `FH-28.01` fixa a direção da
derivação.

**Por que reutilizar antes de criar.** Cada componente novo tem custo permanente
(`FH-12.06`) e, pior, cria uma segunda forma de resolver o mesmo problema. Duas
formas divergem com o tempo — em comportamento, em estados tratados, em
acessibilidade. O usuário percebe como inconsistência; a equipe percebe como
manutenção dobrada.

**Por que composição vence configuração.** Adicionar opções a um componente parece
mais barato e é a principal causa de sua degradação: cada opção multiplica os
estados possíveis, e as combinações raras nunca são testadas. Composição mantém
cada peça simples e testável, e transfere a complexidade para o ponto de uso, onde
ela é visível.

**Por que componente não decide negócio.** Um componente que sabe quando algo pode
ser enviado precisa ser alterado sempre que a regra mudar, e a mesma regra tende a
ser reimplementada em outros componentes — divergindo. Além disso, regra em
componente é regra que só existe no cliente, o que colide com `FH-51.10`.

**Por que o ciclo de vida é declarado.** Sem estágio, todo componente é tratado como
definitivo. Componentes experimentais se espalham antes de amadurecer, e
componentes obsoletos permanecem porque ninguém sabe que foram substituídos.

---

## 5. Princípios

**O design system materializa a Constituição; não a substitui.**

**Duas formas de resolver o mesmo problema divergem — sempre.**

**Compor mantém simples; configurar acumula.**

**Componente apresenta; domínio decide.**

---

## 6. Regras normativas

### Ciclo de vida (`FH-28.03`)

| Estágio | Significa | Pode ser usado? |
| --- | --- | --- |
| **Proposta** | Ainda em avaliação | Não |
| **Experimental** | Em uso limitado, sujeito a mudança | Sim, com registro do uso |
| **Estável** | Contrato garantido (`FH-34`) | Sim, sem restrição |
| **Depreciado** | Substituto declarado, prazo definido | Apenas onde já existe |
| **Removido** | Fora do sistema | Não |

### Ordem de decisão antes de criar (`FH-28.02`, `FH-28.06`)

1. Existe primitiva que resolve? → use.
2. Uma **composição** de primitivas resolve? → componha.
3. Uma **variante registrada** resolve? → use a variante.
4. Nada resolve → proposta com os quatro itens de `FH-28.05`.

Pular para o passo 4 sem registrar 1–3 viola `FH-28.02`.

### `FH-28.07` — Fronteira do componente

**Certo.** O componente recebe "desabilitado" e o motivo; quem decide se está
desabilitado é a camada de domínio.

**Errado.** O componente consulta plano, cota ou permissão para decidir o que
exibir.

---

## 7. Anti-padrões

**Design system como origem.** Decisões de experiência nascendo do catálogo visual.

**Componente-canivete.** Uma peça com dezenas de opções para cobrir todos os casos.

**Variante clandestina.** Estilo local criado no componente de feature.

**Componente onisciente.** Peça que conhece regra de negócio.

**Duplicata silenciosa.** Dois componentes para o mesmo problema, em pastas
diferentes.

**Depreciação sem saída.** Marcar como obsoleto sem substituto nem prazo.

---

## 8. Impactos

**Cognitivo.** Reuso reduz o número de padrões que o usuário precisa aprender —
efeito que se compõe a cada tela nova.

**Emocional.** Consistência de peças produz a sensação de solidez descrita em
`FH-17.05`.

**Produtividade.** O ganho é para quem constrói: compor peças estáveis é mais
rápido do que decidir tudo de novo — e o resultado já nasce conforme.

**Percepção de qualidade.** É o capítulo que sustenta `FH-07.06` (coerência acima
de novidade) no nível material.

**Curva de aprendizagem.** Para novos integrantes, um sistema com ciclo de vida
declarado responde sozinho o que usar e o que evitar.

---

## 9. Riscos e trade-offs

**Risco: rigidez.** Exigir proposta atrasa casos legítimos. Mitigação: a ordem de
decisão resolve a maioria antes da proposta.

**Risco: componentes genéricos demais.** Reutilizar à força produz peças que não
servem bem a ninguém. Mitigação: `FH-28.08` — se as responsabilidades divergiram, a
resposta é redefinir fronteiras, não empilhar opções.

**Risco: acúmulo de experimentais.** Componentes que nunca amadurecem. Mitigação:
`FH-28.10` e o ciclo de depreciação do Capítulo 66.

**Trade-off central.** Trocamos liberdade de criação por coerência material. Criar
é mais rápido que procurar — e é assim que sistemas de design morrem.

---

## 10. Critérios de verificação

1. Toda decisão do design system deriva de artigo constitucional.
2. Nenhum componente novo foi criado sem esgotar reutilização e composição.
3. Todo componente tem estágio declarado.
4. Nenhuma variante local não registrada existe.
5. Toda proposta declara problema, alternativas, estados e custo permanente.
6. Nenhum componente contém regra de negócio.
7. Nenhum par de componentes resolve o mesmo problema.
8. Nenhum valor visual foi escrito fora do sistema de tokens.
9. Toda depreciação declara prazo e substituto.

---

## 11. Checklist do capítulo

- [ ] Procurei primitiva existente antes de criar.
- [ ] Tentei resolver por composição antes de adicionar opção.
- [ ] Declarei o estágio do componente.
- [ ] Registrei a variante no sistema.
- [ ] Nenhuma regra de negócio entrou no componente.
- [ ] Todos os valores visuais vieram de tokens.
- [ ] Se depreciei algo, declarei substituto e prazo.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5 (`FH-05.02`), 7 (P5), 8, 12 (`FH-12.06`), 24
(composição).

**É pré-requisito de.** Capítulos 29–40, especialmente 34 (contratos) e 35
(catálogo).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Primitivas | `src/components/ui/` |
| Componentes de feature | `src/components/<domínio>/` |
| Variantes registradas | `cva` em cada primitiva (ex.: `button.tsx`) |
| Composição de classes | `cn` em `src/lib/utils.ts` |
| Tokens | `src/app/globals.css`, `src/lib/themes.ts` |
| Configuração do sistema | `components.json` |
