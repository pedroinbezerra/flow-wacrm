# Capítulo 60 — Internacionalização e Localização

| Campo | Valor |
| --- | --- |
| Livro | VII — Linguagem |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 30, 57, 58, 59 |
| É pré-requisito de | Capítulos 62, 63 |
| Artigos | `FH-60.01` a `FH-60.10` |

---

## 0. Núcleo Normativo

**`FH-60.01`** — Texto fixo dentro de componente é **proibido**. Todo texto exibido
vem do sistema de traduções.
> **Verificação:** existe texto de interface escrito diretamente no componente? → NÃO = cumpre | SIM = viola.

**`FH-60.02`** — As chaves seguem **estrutura hierárquica por domínio**, espelhando
a organização do produto (`FH-22.01`).
> **Verificação:** a chave está no domínio correto da hierarquia? → SIM = cumpre | NÃO = viola.

**`FH-60.03`** — Todo layout **DEVE** tolerar **expansão de texto** por tradução, sem
quebra, sobreposição ou truncamento não previsto (`FH-30.10`, `FH-34.03`).
> **Verificação:** o layout foi verificado com texto expandido? → SIM = cumpre | NÃO = viola.

**`FH-60.04`** — Plural, gênero e variáveis são resolvidos pelo **sistema de
traduções**, **NUNCA** por concatenação de fragmentos.
> **Verificação:** existe texto montado por concatenação de fragmentos traduzidos? → NÃO = cumpre | SIM = viola.

**`FH-60.05`** — **pt-BR é o idioma canônico.** Traduções derivam dele e **NUNCA**
têm valor normativo próprio (`FH-01.09`).
> **Verificação:** o texto pt-BR é a origem, e as traduções derivam dele? → SIM = cumpre | NÃO = viola.

**`FH-60.06`** — Formatos regionais — data, hora, número, moeda, telefone —
**DEVEM** seguir a convenção do idioma ativo, sem exceção por tela.
> **Verificação:** os formatos seguem a convenção do idioma ativo? → SIM = cumpre | NÃO = viola.

**`FH-60.07`** — Nomes próprios do produto e termos canônicos de entidade **NUNCA**
são traduzidos de forma divergente do Anexo A.
> **Verificação:** os termos canônicos foram preservados conforme o Anexo A? → SIM = cumpre | NÃO = viola.

**`FH-60.08`** — Chave ausente **NUNCA** é exibida ao usuário. O sistema **DEVE**
recorrer ao idioma canônico, e a ausência **DEVE** ser detectável em verificação.
> **Verificação:** chave ausente exibe a chave crua ao usuário? → NÃO = cumpre | SIM = viola.

**`FH-60.09`** — Conteúdo produzido pelo usuário **NUNCA** é traduzido
automaticamente sem solicitação explícita (`FH-30.06`, `FH-58.11`).
> **Verificação:** algum conteúdo do usuário é traduzido sem pedido? → NÃO = cumpre | SIM = viola.

**`FH-60.10`** — Toda chave nova entra com o texto **pt-BR completo e revisado**
conforme os Capítulos 57 e 58. Chave com texto provisório é proibida.
> **Verificação:** o texto canônico está completo e conforme? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula a existência do produto em **mais de um idioma** sem perda de
identidade, estrutura ou qualidade de texto. Ele existe mesmo enquanto houver um
único idioma, porque as decisões que tornam a tradução possível são tomadas antes
dela — e são caras de retroagir.

---

## 2. Perguntas que este capítulo responde

- Todo texto precisa de chave?
- Como estruturo as chaves?
- Como lido com plural, gênero e variáveis?
- O que nunca se traduz?
- Como trato formatos regionais?

---

## 3. Definições

**Chave** — identificador de um texto no sistema de traduções.

**Idioma canônico** — pt-BR; origem de todas as traduções.

**Expansão** — crescimento do texto ao ser traduzido.

**Concatenação** — montagem de uma frase a partir de fragmentos traduzidos
separadamente.

**Formato regional** — convenção local de data, número, moeda e telefone.

---

## 4. Fundamento

**Por que nada de texto fixo, mesmo com um idioma.** Texto fixo em componente é
invisível para auditoria: não aparece no dicionário, não passa por revisão de
microcopy e não é encontrado quando um termo é renomeado (`FH-59.05`). O custo de
extrair depois é muito maior que o de escrever certo desde o início — e o benefício
existe antes de qualquer tradução.

**Por que hierarquia de chaves.** Chaves planas viram um depósito em que ninguém
encontra nada e todos duplicam. A hierarquia por domínio espelha a organização do
produto (`FH-22.01`), o que torna a chave localizável pela mesma lógica com que o
usuário localiza a tela.

**Por que layout tolerante à expansão.** Traduções expandem de forma imprevisível, e
o texto mais longo tende a aparecer justamente em rótulos curtos — botões, abas,
colunas. Um layout dimensionado pelo texto canônico quebra na primeira tradução, e
a quebra aparece em produção, para o usuário daquele idioma.

**Por que concatenação é proibida.** Idiomas ordenam frases de formas diferentes,
flexionam por gênero e têm regras de plural distintas. Uma frase montada por
fragmentos funciona no idioma em que foi pensada e produz texto incorreto em
qualquer outro — e o defeito é invisível para quem não fala aquele idioma.

**Por que pt-BR é canônico.** Sem uma origem declarada, correções entram em idiomas
diferentes e divergem. Com origem declarada, existe uma única versão verdadeira e
as demais são derivadas — o que também define onde a revisão de microcopy acontece
(`FH-60.10`).

**Por que chave ausente nunca aparece.** Exibir um identificador técnico ao usuário
é a forma mais literal de vazar implementação (`FH-08.08`) e comunica defeito de
forma imediata. O recurso correto é recorrer ao idioma canônico e tornar a ausência
detectável na verificação, não no uso.

**Por que não traduzir o conteúdo do usuário.** A mensagem que ele escreveu vai para
um cliente dele, e a tradução automática pode alterar sentido, tom e acordos
comerciais. Traduzir sem pedido é alterar o conteúdo dele — proibido desde
`FH-30.06`.

---

## 5. Princípios

**Extrair texto é barato agora e caro depois.**

**Frase é unidade; fragmento não se traduz.**

**Uma origem verdadeira; o resto deriva.**

**A chave é para nós; o usuário nunca a vê.**

---

## 6. Regras normativas

### Estrutura de chaves (`FH-60.02`)

| Nível | Conteúdo | Exemplo de agrupamento |
| --- | --- | --- |
| 1 | Domínio | Área do produto ou grupo transversal |
| 2 | Contexto | Tela, componente ou situação |
| 3 | Elemento | Rótulo, título, mensagem, estado |

**Grupos transversais** — termos comuns, erros, tempo, papéis — pertencem a
domínios próprios e **NUNCA** são duplicados dentro de domínios específicos.

### `FH-60.04` — Plural, gênero e variáveis

**Certo.** Uma chave que expressa a frase inteira, com variável e regra de plural
resolvidas pelo sistema de traduções.

**Errado.** Montar a frase somando pedaços traduzidos separadamente — a ordem e a
flexão mudam entre idiomas, e o resultado fica gramaticalmente errado sem que
ninguém perceba.

### `FH-60.03` — Verificação de expansão

Verificar, no mínimo: rótulos de botão e aba; títulos de coluna; mensagens de
erro; itens de navegação. São os elementos em que a expansão mais quebra layout.

---

## 7. Anti-padrões

**Texto solto.** Frase escrita direto no componente.

**Chave plana.** Dicionário sem hierarquia, com duplicatas.

**Frase montada.** Texto por concatenação de fragmentos.

**Layout justo.** Dimensionado pelo texto canônico.

**Chave visível.** Identificador técnico exibido ao usuário.

**Tradução do usuário.** Conteúdo dele traduzido sem pedido.

**Texto provisório.** Chave criada com conteúdo a revisar depois.

**Formato importado.** Data ou moeda em convenção de outro idioma.

---

## 8. Impactos

**Cognitivo.** Formatos regionais corretos evitam releitura e erro de
interpretação — especialmente em data e valor.

**Emocional.** Chave crua exibida ou frase gramaticalmente errada comunicam
descuido de forma imediata e desproporcional ao defeito.

**Produtividade.** Dicionário hierárquico reduz o tempo de localizar e alterar
textos, que é uma das operações mais frequentes de manutenção.

**Percepção de qualidade.** Qualidade de tradução é julgada com severidade: um
texto ruim no idioma do usuário contamina a percepção do produto inteiro.

**Curva de aprendizagem.** Vocabulário consistente entre idiomas permite que
material de apoio e suporte sirvam a todos.

---

## 9. Riscos e trade-offs

**Risco: custo com um único idioma.** Manter dicionário parece desnecessário agora.
Mitigação: o benefício imediato é auditoria e consistência de microcopy — a
tradução é consequência, não a única razão.

**Risco: chaves genéricas demais.** Reutilizar chaves entre contextos produz textos
inadequados quando um contexto muda. Mitigação: a hierarquia por contexto
desencoraja a reutilização indevida.

**Risco: layout excessivamente folgado.** Tolerar expansão pode desperdiçar espaço.
Mitigação: os limites de `FH-58.02` mantêm textos curtos, o que reduz a expansão
absoluta.

**Trade-off central.** Trocamos velocidade de escrita por rastreabilidade e
consistência. Escrever direto no componente é mais rápido — e torna o texto
invisível para toda a governança de linguagem.

---

## 10. Critérios de verificação

1. Nenhum texto de interface está fixo em componente.
2. Todas as chaves seguem a hierarquia por domínio.
3. Os layouts foram verificados com texto expandido.
4. Nenhum texto é montado por concatenação.
5. pt-BR é a origem de todas as traduções.
6. Os formatos regionais seguem o idioma ativo.
7. Termos canônicos são preservados conforme o Anexo A.
8. Nenhuma chave crua é exibida ao usuário.
9. Nenhum conteúdo do usuário é traduzido sem solicitação.
10. Toda chave nova entra com texto canônico completo e revisado.

---

## 11. Checklist do capítulo

- [ ] Nenhum texto escrito direto no componente.
- [ ] A chave está no domínio e contexto certos.
- [ ] Testei o layout com texto bem mais longo.
- [ ] Nenhuma frase montada por pedaços.
- [ ] Data, número e moeda seguem o idioma ativo.
- [ ] Os termos canônicos foram preservados.
- [ ] Chave ausente recorre ao canônico, sem aparecer.
- [ ] O texto pt-BR está completo e revisado.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 30 (`FH-30.10`), 57 (voz), 58 (microcopy), 59
(nomenclatura).

**É pré-requisito de.** Capítulos 62 (qualidade), 63 (checklists).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Dicionário canônico | `src/i18n/messages/pt-BR.json` |
| Configuração de i18n | `next-intl.config.ts`, `src/lib/i18n/` |
| Auditoria de chaves | `audit-translations.js` |
| Formatos de moeda | `src/lib/currency.ts` |
| Formatos de tempo | Chave `time` em `src/i18n/messages/pt-BR.json` |
