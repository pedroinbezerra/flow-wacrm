# Capítulo 58 — Microcopy: Regras de Escrita de Interface

| Campo | Valor |
| --- | --- |
| Livro | VII — Linguagem |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 30, 42, 44, 45, 51, 57 |
| É pré-requisito de | Capítulos 59, 60, 63 |
| Artigos | `FH-58.01` a `FH-58.11` |

---

## 0. Núcleo Normativo

**`FH-58.01`** — Todo rótulo de ação descreve o **resultado**, não o mecanismo nem a
intenção genérica.
> **Verificação:** o rótulo descreve o que acontecerá? → SIM = cumpre | NÃO = viola.

**`FH-58.02`** — Cada elemento tem **limite de extensão** (§6). Texto acima do
limite **DEVE** ser reescrito, nunca truncado.
> **Verificação:** o texto respeita o limite do seu tipo de elemento? → SIM = cumpre | NÃO = viola.

**`FH-58.03`** — Jargão técnico interno e tradução literal são **proibidos**
(`FH-08.08`). O vocabulário é o do usuário (Anexo A).
> **Verificação:** todo termo pertence ao vocabulário do usuário? → SIM = cumpre | NÃO = viola.

**`FH-58.04`** — Texto de exemplo dentro do campo **NUNCA** substitui o rótulo. Todo
campo tem rótulo permanente e visível.
> **Verificação:** o campo tem rótulo visível, independente do texto de exemplo? → SIM = cumpre | NÃO = viola.

**`FH-58.05`** — Data, hora, moeda, telefone, quantidade e porcentagem seguem
**formatos fixos** do sistema, aplicados igualmente em todo o produto.
> **Verificação:** os formatos correspondem ao padrão do sistema? → SIM = cumpre | NÃO = viola.

**`FH-58.06`** — Capitalização e pontuação seguem regras normatizadas (§6). Variação
por preferência é proibida.
> **Verificação:** capitalização e pontuação seguem a norma? → SIM = cumpre | NÃO = viola.

**`FH-58.07`** — Voz **ativa** e ordem direta. Construções passivas e inversões que
adiam a informação principal são proibidas.
> **Verificação:** a informação principal vem primeiro, em voz ativa? → SIM = cumpre | NÃO = viola.

**`FH-58.08`** — Rótulo de campo nomeia **o dado**, não a ação de preenchê-lo.
> **Verificação:** o rótulo nomeia o dado? → SIM = cumpre | NÃO = viola.

**`FH-58.09`** — Textos de erro, confirmação e vazio seguem as anatomias já
definidas (`FH-44.02`, `FH-45.03`, `FH-42.02`).
> **Verificação:** o texto contém todos os elementos da anatomia aplicável? → SIM = cumpre | NÃO = viola.

**`FH-58.10`** — Todo texto é **autossuficiente** no seu contexto: compreensível sem
depender de informação que não está visível.
> **Verificação:** o texto é compreensível sem conhecimento não exibido? → SIM = cumpre | NÃO = viola.

**`FH-58.11`** — Conteúdo produzido pelo usuário — nomes, etiquetas, mensagens —
**NUNCA** é normalizado, corrigido ou reescrito na exibição (`FH-30.06`).
> **Verificação:** algum conteúdo do usuário é exibido alterado? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo transforma **escrita de interface em disciplina objetiva**. Ele
existe porque microcopy é a camada mais lida do produto e a mais frequentemente
decidida por gosto individual.

---

## 2. Perguntas que este capítulo responde

- Como nomeio um botão? Quantas palavras?
- Uso ponto final?
- Como escrevo rótulo, dica, exemplo e título?
- Como escrevo números, datas e valores?

---

## 3. Definições

**Rótulo** — texto permanente que identifica um elemento.

**Texto de exemplo** — conteúdo ilustrativo exibido dentro de um campo vazio.

**Dica** — texto auxiliar revelado por apontamento ou foco.

**Anatomia** — estrutura obrigatória de um tipo de texto (erro, confirmação,
vazio).

**Autossuficiência** — propriedade de ser compreensível no próprio contexto.

---

## 4. Fundamento

**Por que o rótulo descreve o resultado.** "Confirmar" não diz o que acontecerá;
"Enviar para 312 contatos" diz. O usuário decide com base no rótulo, e um rótulo
genérico transfere a ele o trabalho de deduzir a consequência — exatamente o que
`FH-45.03` e `FH-17.09` proíbem. Rótulos específicos também eliminam a necessidade
de ler o restante da tela em ações repetidas.

**Por que limitar extensão.** Textos longos em elementos pequenos são ignorados: o
usuário lê as primeiras palavras e infere o resto. Se a informação essencial está
no fim, ela não é lida. O limite força a decisão sobre o que é essencial — que é
trabalho de quem escreve, não de quem lê.

**Por que texto de exemplo não substitui rótulo.** Ele desaparece quando o usuário
começa a digitar — justamente quando ele mais precisa saber o que está preenchendo.
Além disso, é frequentemente invisível para tecnologias assistivas e tem contraste
reduzido, o que colide com `FH-38.05`.

**Por que formatos são fixos.** Data e valor aparecem em dezenas de telas
diferentes. Se cada uma escolher seu formato, o usuário precisa reinterpretar a
cada contexto, e comparações entre telas ficam sujeitas a erro. Formato fixo é
vocabulário, e vocabulário não varia (`FH-05.10`).

**Por que autossuficiência.** Textos são frequentemente lidos fora do contexto em
que foram escritos: em uma notificação, em uma lista, em um registro de execução.
Um texto que só faz sentido quando acompanhado da tela em que nasceu vira
incompreensível assim que viaja.

**Por que não normalizar conteúdo do usuário.** Nomes têm grafias legítimas que um
normalizador consideraria erradas. Etiquetas com capitalização própria carregam
significado para quem as criou. Alterar na exibição é alterar o dado aos olhos de
quem o produziu — e `FH-30.06` já estabeleceu que texto do usuário é dele.

---

## 5. Princípios

**O rótulo é a decisão; o resto da tela é contexto.**

**Se não cabe, reescreva — não corte.**

**Formato é vocabulário: não varia por tela.**

**Todo texto viaja; escreva para ser lido fora de casa.**

---

## 6. Regras normativas

### Limites de extensão (`FH-58.02`)

| Elemento | Limite | Observação |
| --- | --- | --- |
| Rótulo de ação | 1 a 4 palavras | Verbo + objeto quando necessário |
| Rótulo de campo | 1 a 3 palavras | Nomeia o dado (`FH-58.08`) |
| Título de tela ou seção | Até 5 palavras | Identifica, não descreve |
| Mensagem de erro | Até 2 frases | Anatomia de `FH-44.02` |
| Confirmação | Até 3 frases | Anatomia de `FH-45.03` |
| Estado vazio | Até 3 frases | Anatomia de `FH-42.02` |
| Dica | 1 frase | Complementa; nunca essencial (`FH-15.05`) |

### Capitalização e pontuação (`FH-58.06`)

| Elemento | Regra |
| --- | --- |
| Rótulos, títulos e botões | Apenas a primeira letra maiúscula; nomes próprios preservados |
| Frases completas | Ponto final |
| Rótulos e títulos | Sem ponto final |
| Listas de itens curtos | Sem pontuação final |
| Perguntas | Interrogação apenas quando há pergunta real |
| Ênfase | Por peso tipográfico (`FH-30.02`), nunca por maiúsculas |

### `FH-58.01` — Rótulo pelo resultado

| Errado | Certo |
| --- | --- |
| "Confirmar" | "Excluir 3 etapas" |
| "Enviar" (em disparo) | "Enviar para 312 contatos" |
| "OK" | "Entendi" ou a ação concreta |
| "Salvar alterações" (quando aplica na hora) | Nenhum botão — a alternância aplica direto (`FH-35.04`) |

### `FH-58.08` — Rótulo de campo

| Errado | Certo |
| --- | --- |
| "Digite o telefone" | "Telefone" |
| "Informe a data de retorno" | "Data de retorno" |
| "Selecione uma etapa" | "Etapa" |

---

## 7. Anti-padrões

**Botão genérico.** "Confirmar", "OK", "Continuar" sem dizer o quê.

**Rótulo-instrução.** "Digite seu nome" como rótulo de campo.

**Exemplo como rótulo.** Campo identificado apenas pelo texto interno.

**Parágrafo em elemento pequeno.** Texto longo que ninguém lê.

**Formato livre.** Cada tela com seu jeito de mostrar data ou valor.

**Passiva burocrática.** "A operação foi realizada com sucesso."

**Texto dependente.** Mensagem incompreensível fora da tela de origem.

**Normalização.** Nome ou etiqueta do usuário exibido alterado.

---

## 8. Impactos

**Cognitivo.** Rótulos específicos eliminam a leitura de contexto em ações
repetidas — o usuário decide pelo botão.

**Emocional.** Textos claros e diretos produzem competência percebida; textos vagos
produzem hesitação antes de cada clique.

**Produtividade.** Microcopy é lido centenas de vezes por dia; cada palavra
desnecessária é paga em toda leitura.

**Percepção de qualidade.** Formatos inconsistentes e rótulos genéricos são dos
sinais mais rápidos de produto pouco cuidado.

**Curva de aprendizagem.** Rótulos que descrevem resultado ensinam o que cada ação
faz sem documentação.

---

## 9. Riscos e trade-offs

**Risco: rótulos longos.** Descrever resultado pode não caber. Mitigação: o limite
de 4 palavras força escolha; se não cabe, a ação provavelmente faz coisas demais.

**Risco: rigidez de formato.** Casos específicos podem pedir variação. Mitigação:
se a variação é legítima e recorrente, é lacuna — vira emenda, não exceção local.

**Risco: verbosidade nas anatomias.** Erros e confirmações com todos os elementos
podem ficar longos. Mitigação: os limites de §6 se aplicam simultaneamente —
anatomia completa em até três frases.

**Trade-off central.** Trocamos liberdade de escrita por previsibilidade verbal.
Nenhum texto é brilhante; todos são compreensíveis à primeira leitura.

---

## 10. Critérios de verificação

1. Todo rótulo de ação descreve o resultado.
2. Todo texto respeita o limite de extensão do seu elemento.
3. Nenhum jargão técnico ou tradução literal aparece.
4. Todo campo tem rótulo visível permanente.
5. Datas, valores e quantidades seguem os formatos do sistema.
6. Capitalização e pontuação seguem a norma.
7. Todos os textos usam voz ativa e ordem direta.
8. Rótulos de campo nomeiam o dado.
9. Erros, confirmações e vazios seguem suas anatomias.
10. Todo texto é autossuficiente no contexto.
11. Nenhum conteúdo do usuário é exibido alterado.

---

## 11. Checklist do capítulo

- [ ] O botão diz o que vai acontecer.
- [ ] O texto cabe no limite do elemento.
- [ ] Nenhum termo técnico interno.
- [ ] O campo tem rótulo visível.
- [ ] Data, valor e telefone seguem o formato do sistema.
- [ ] Sem ponto final em rótulos; com ponto em frases.
- [ ] O texto faz sentido lido isoladamente.
- [ ] Nada do que o usuário escreveu foi alterado.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 30 (`FH-30.06`), 42 (`FH-42.02`), 44 (`FH-44.02`), 45
(`FH-45.03`), 51 (`FH-51.01`), 57 (voz).

**É pré-requisito de.** Capítulos 59 (nomenclatura), 60 (i18n), 63 (checklists).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Todos os textos | `src/i18n/messages/pt-BR.json` |
| Formatos de moeda | `src/lib/currency.ts` |
| Formatos de data e hora | Chave `time` em `src/i18n/messages/pt-BR.json` |
| Rótulos de ação | Componentes de domínio em `src/components/` |
| Auditoria de textos | `audit-translations.js` |
