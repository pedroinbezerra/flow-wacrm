# Capítulo 29 — Tokens: Cor, Tema e Modo

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 24, 28, 38 |
| É pré-requisito de | Capítulos 30–37, 39, 56 |
| Artigos | `FH-29.01` a `FH-29.10` |

---

## 0. Núcleo Normativo

**`FH-29.01`** — **Nenhuma cor literal.** Toda cor vem de token semântico do
sistema. Valores diretos são proibidos em qualquer camada (`FH-28.09`).
> **Verificação:** existe cor escrita fora do sistema de tokens? → NÃO = cumpre | SIM = viola.

**`FH-29.02`** — Cada token tem **significado semântico fixo**. Usar um token pelo
seu valor aparente, e não pelo seu significado, é proibido.
> **Verificação:** o token foi escolhido pelo significado, e não pela aparência? → SIM = cumpre | NÃO = viola.

**`FH-29.03`** — **Ortogonalidade obrigatória:** o eixo **modo** (claro/escuro)
define superfícies neutras; o eixo **acento** define a cor primária. Os dois
conjuntos são disjuntos e compõem livremente.
> **Verificação:** algum token de modo define cor de acento, ou vice-versa? → NÃO = cumpre | SIM = viola.

**`FH-29.04`** — Cor **NUNCA** é o único portador de significado. Todo estado
comunicado por cor **DEVE** ter também texto, forma ou posição (`FH-15.08`,
`FH-24.05`).
> **Verificação:** removendo a cor, a informação permanece compreensível? → SIM = cumpre | NÃO = viola.

**`FH-29.05`** — O contraste mínimo **DEVE** ser satisfeito em **todos os modos e
todos os acentos**, sem exceção (`FH-38`).
> **Verificação:** o contraste foi verificado em todas as combinações de modo e acento? → SIM = cumpre | NÃO = viola.

**`FH-29.06`** — Token novo exige emenda ao design system e **definição completa**
em todos os modos e acentos existentes. Token parcialmente definido é proibido.
> **Verificação:** o token novo está definido em todas as combinações? → SIM = cumpre | NÃO = viola.

**`FH-29.07`** — As cores de **estado** — sucesso, atenção, erro, neutro — formam
conjunto fechado e **NUNCA** variam por acento. Estado significa o mesmo em
qualquer tema.
> **Verificação:** a cor de estado usada pertence ao conjunto fechado e é invariante ao acento? → SIM = cumpre | NÃO = viola.

**`FH-29.08`** — Cores de **visualização de dados** seguem paleta própria, com ordem
fixa e significado estável entre gráficos. Reatribuir cores entre séries é
proibido (`FH-56`).
> **Verificação:** a mesma série mantém a mesma cor entre gráficos e sessões? → SIM = cumpre | NÃO = viola.

**`FH-29.09`** — Derivações por transparência ou mistura são permitidas **apenas
sobre tokens**, nunca sobre valores literais, e **DEVEM** preservar o contraste
exigido.
> **Verificação:** a derivação parte de token e preserva o contraste mínimo? → SIM = cumpre | NÃO = viola.

**`FH-29.10`** — Toda tela **DEVE** ser verificada nos dois modos e em todos os
acentos antes da entrega.
> **Verificação:** a verificação cobriu todos os modos e acentos? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **todo uso de cor** por meio de tokens semânticos, sobre um
sistema bidimensional: **modo** (claro/escuro) × **acento** (identidade
cromática). Ele garante que qualquer tela funcione em todas as combinações sem
ajuste manual.

---

## 2. Perguntas que este capítulo responde

- Posso usar uma cor literal?
- O que cada token significa?
- Como garanto que a tela funcione nos dois modos e em todos os acentos?
- Como uso cor para significado sem depender só dela?
- Cor de sucesso muda conforme o tema?

---

## 3. Definições

**Token semântico** — variável cujo nome descreve **função**, não aparência.

**Modo** — dimensão claro/escuro. Governa superfícies neutras.

**Acento** — dimensão de identidade cromática. Governa a cor primária e derivadas.

**Cor de estado** — cor com significado semântico fixo: sucesso, atenção, erro,
neutro.

**Derivação** — variação obtida por transparência ou mistura a partir de um token.

---

## 4. Fundamento

**Por que token semântico e não token de aparência.** Um token chamado pela função
sobrevive à mudança de valor; um token chamado pela cor mente assim que o valor
muda. Além disso, o nome semântico obriga quem constrói a declarar a **intenção**:
usar o token de superfície secundária comunica algo; usar "cinza claro" não comunica
nada e será usado em contextos incompatíveis.

**Por que a ortogonalidade é regra.** Quando modo e acento definem variáveis
disjuntas, as duas dimensões compõem livremente: qualquer acento funciona em
qualquer modo, sem combinações especiais. Se um token de modo definisse cor de
acento, cada par exigiria ajuste — e o número de combinações a manter cresceria
multiplicativamente. A ortogonalidade é o que mantém o sistema viável com múltiplos
acentos.

**Por que cor nunca basta sozinha.** Percepção cromática varia entre pessoas;
telas variam em calibração; ambientes variam em luz. Um estado comunicado apenas
por cor é invisível para uma parte dos usuários em uma parte das condições — e
essa parte não é pequena. A verificação de `FH-29.04` é operacional: remova a cor
e veja se a informação sobrevive.

**Por que estado não varia por acento.** Se a cor de erro mudasse conforme o tema
escolhido, o usuário precisaria reaprender o significado ao trocar de acento — e o
significado seria diferente entre membros da mesma equipe. Estados formam um
vocabulário compartilhado; vocabulário não pode depender de preferência
individual.

**Por que cor de série de dados é estável.** Em gráficos, a cor **é** o
identificador da série. Se ela muda entre visualizações ou sessões, toda comparação
exige releitura da legenda, e conclusões erradas se tornam prováveis — o que colide
com `FH-56` (honestidade na apresentação de dados).

**Por que verificar todas as combinações.** Com dois modos e vários acentos, o
número de combinações é alto e nenhuma delas é hipotética: cada uma é a experiência
real de alguém. Verificar apenas o padrão significa entregar sem verificar a maior
parte dos casos.

---

## 5. Princípios

**Token nomeia função, nunca aparência.**

**Modo e acento compõem; não se misturam.**

**Cor é reforço; nunca é a única mensagem.**

**Estado é vocabulário compartilhado — não muda por preferência.**

---

## 6. Regras normativas

### Famílias de token e seus significados (`FH-29.02`)

| Família | Significado | Nunca use para |
| --- | --- | --- |
| **Fundo / superfície** | Plano de base e superfícies empilhadas | Comunicar estado |
| **Conteúdo** | Texto e ícones sobre superfícies | Decoração |
| **Primário** | Ação principal e identidade do acento | Estado, alerta ou dado |
| **Secundário / atenuado** | Ação de apoio e conteúdo de menor peso | Texto essencial |
| **Borda / entrada** | Limite de superfícies e campos | Hierarquia principal |
| **Destrutivo** | Ação com consequência de perda | Qualquer ênfase que não seja destruição |
| **Anel de foco** | Indicação de foco (`FH-48.07`) | Decoração |
| **Estado** | Sucesso, atenção, erro, neutro | Identidade ou acento |
| **Dados** | Séries de visualização | Interface geral |

**Regra de escolha.** Pergunte "que função isto exerce?", nunca "que cor eu quero?".

### `FH-29.03` — Ortogonalidade na prática

- Tokens de **modo**: superfícies, conteúdo, bordas, neutros.
- Tokens de **acento**: primário e suas derivações, foco, destaque de identidade.
- Os dois conjuntos **não** compartilham variáveis, e por isso a ordem de aplicação
  entre eles é irrelevante.

**Errado.** Um acento que redefine a cor de fundo — a partir daí, cada combinação
precisa ser projetada separadamente.

### `FH-29.10` — Verificação de combinações

Antes de entregar, verifique: **cada modo × cada acento**, observando contraste de
texto, visibilidade do foco, legibilidade de estados e distinção entre superfícies
empilhadas.

---

## 7. Anti-padrões

**Cor literal.** Valor escrito diretamente no componente.

**Token pela aparência.** Escolher o token porque "a cor ficou boa".

**Acento invasivo.** Identidade cromática redefinindo superfícies neutras.

**Estado temático.** Cor de erro variando com o tema.

**Só cor.** Estado comunicado exclusivamente por cor.

**Série instável.** Cores de gráfico mudando entre visualizações.

**Token parcial.** Definido em um modo, ausente em outro.

**Verificação padrão.** Testar apenas na combinação inicial.

---

## 8. Impactos

**Cognitivo.** Tokens semânticos consistentes permitem que o usuário associe cor a
significado uma vez e aplique em todo o produto.

**Emocional.** Coerência cromática entre áreas é um dos principais componentes da
percepção de solidez (`FH-17.05`).

**Produtividade.** Para quem constrói, tokens eliminam a decisão de cor —
transformando uma escolha estética recorrente em consulta.

**Percepção de qualidade.** Falhas de contraste e combinações não verificadas são
percebidas como descuido imediato, mesmo por quem não sabe nomear a causa.

**Curva de aprendizagem.** Vocabulário cromático estável permite prever o
significado de um elemento nunca visto.

---

## 9. Riscos e trade-offs

**Risco: proliferação de tokens.** Cada caso especial vira um token novo.
Mitigação: `FH-29.06` exige emenda e definição completa — o custo desencoraja o
supérfluo.

**Risco: limitação expressiva.** A paleta fechada restringe soluções visuais.
Trade-off assumido: expressividade individual em troca de coerência e
acessibilidade.

**Risco: verificação custosa.** Muitas combinações a checar. Mitigação: a
ortogonalidade reduz o problema — verificar os tokens neutros por modo e os de
acento por acento cobre a maior parte.

**Trade-off central.** Trocamos liberdade cromática por previsibilidade e acesso.
Nenhuma tela é exatamente como seria com cor livre; todas funcionam para todo mundo.

---

## 10. Critérios de verificação

1. Nenhuma cor literal existe fora do sistema de tokens.
2. Todo token foi escolhido pelo significado.
3. Nenhum token de modo define acento, nem o contrário.
4. Nenhuma informação depende exclusivamente de cor.
5. O contraste mínimo é satisfeito em todos os modos e acentos.
6. Todo token novo está definido em todas as combinações.
7. Cores de estado pertencem ao conjunto fechado e não variam por acento.
8. Séries de dados mantêm cor estável entre gráficos e sessões.
9. Derivações partem de tokens e preservam contraste.
10. A verificação cobriu todos os modos e acentos.

---

## 11. Checklist do capítulo

- [ ] Nenhuma cor escrita à mão.
- [ ] Escolhi o token pela função, não pela aparência.
- [ ] Não misturei tokens de modo com tokens de acento.
- [ ] Removi a cor mentalmente: a informação sobrevive.
- [ ] Verifiquei contraste em todos os modos e acentos.
- [ ] Estados usam o conjunto fechado.
- [ ] Séries de dados mantêm as mesmas cores.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (`FH-09.09`), 24 (`FH-24.05`), 28 (`FH-28.09`), 38
(contraste).

**É pré-requisito de.** Capítulos 30–37, 39 (movimento), 56 (dados).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Definição de tokens | `src/app/globals.css` (blocos `html[data-mode]` e `html[data-theme]`) |
| Catálogo de acentos | `src/lib/themes.ts` (`THEME_IDS`, `MODES`) |
| Mapeamento para utilitários | Bloco `@theme inline` em `src/app/globals.css` |
| Aplicação em tempo de execução | `document.documentElement.dataset.mode` / `.theme` |
| Seleção pelo usuário | `src/components/settings/` |
| Cores de dados | Tokens `--chart-*`, componentes em `src/components/tremor/` |
