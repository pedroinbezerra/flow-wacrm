# Capítulo 35 — Catálogo Normativo de Componentes

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 23, 24, 28, 33, 34, 43, 45 |
| É pré-requisito de | Capítulos 36, 37, 40 |
| Artigos | `FH-35.01` a `FH-35.10` |

---

## 0. Núcleo Normativo

**`FH-35.01`** — Todo componente pertence a uma das **sete famílias** (§5). Família
nova exige emenda a este capítulo.
> **Verificação:** este componente pertence a uma família existente? → SIM = cumpre | NÃO = viola.

**`FH-35.02`** — **Botão executa; link navega.** Um elemento que muda de lugar é
link; um que produz efeito é botão. Aparência **NUNCA** determina a escolha.
> **Verificação:** o elemento é botão porque age, e link porque navega? → SIM = cumpre | NÃO = viola.

**`FH-35.03`** — A hierarquia de ação é fechada: **primária, secundária, terciária
e destrutiva**. Uma primária por contexto (`FH-24.02`).
> **Verificação:** as ações usam a hierarquia fechada, com uma única primária? → SIM = cumpre | NÃO = viola.

**`FH-35.04`** — **Alternância aplica na hora; formulário aplica ao confirmar.** Um
controle de alternância **NUNCA** aguarda confirmação, e um formulário **NUNCA**
aplica alterações antes de confirmado.
> **Verificação:** o momento de aplicação corresponde ao tipo de controle? → SIM = cumpre | NÃO = viola.

**`FH-35.05`** — A escolha entre **tabela, lista e cartão** segue a tarefa (§6):
comparar, percorrer ou reconhecer.
> **Verificação:** a escolha corresponde à tarefa dominante? → SIM = cumpre | NÃO = viola.

**`FH-35.06`** — Abas **NUNCA** separam conteúdos que precisam ser vistos ao mesmo
tempo para uma decisão (`FH-15.05`).
> **Verificação:** alguma decisão exige comparar conteúdos que estão em abas diferentes? → NÃO = cumpre | SIM = viola.

**`FH-35.07`** — A escolha entre **alerta, mensagem temporária e faixa persistente**
segue urgência e persistência (§6), nunca conveniência.
> **Verificação:** o tipo escolhido corresponde à urgência e à persistência exigidas? → SIM = cumpre | NÃO = viola.

**`FH-35.08`** — A escolha do controle de seleção segue a **cardinalidade e o
tamanho do conjunto** (§6).
> **Verificação:** o controle corresponde à cardinalidade e ao tamanho do conjunto? → SIM = cumpre | NÃO = viola.

**`FH-35.09`** — Componentes de **feedback** **NUNCA** são usados para conteúdo
permanente, e componentes de **exibição** **NUNCA** são usados para comunicar
estado transitório.
> **Verificação:** a família usada corresponde à natureza do conteúdo? → SIM = cumpre | NÃO = viola.

**`FH-35.10`** — Todo componente do catálogo **DEVE** declarar seus anti-padrões
conhecidos, para que erros já cometidos não se repitam.
> **Verificação:** os anti-padrões do componente estão documentados? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo fixa **quando usar cada família de componente** e, sobretudo, quando
não usar. Ele converte a decisão mais frequente do desenho — "com que peça eu
resolvo isto?" — em consulta.

---

## 2. Perguntas que este capítulo responde

- Botão, link ou item de menu?
- Tabela, lista ou cartão?
- Alerta, mensagem temporária ou faixa?
- Seleção simples ou múltipla?
- Quando abas atrapalham?

---

## 3. Definições

**Família** — agrupamento de componentes com o mesmo papel estrutural.

**Cardinalidade** — quantas opções podem ser escolhidas.

**Persistência** — por quanto tempo a informação deve permanecer visível.

**Conteúdo transitório** — informação que deixa de ser relevante após ser vista.

---

## 4. Fundamento

**Por que o catálogo é normativo.** A escolha de componente é decidida dezenas de
vezes por semana, quase sempre por familiaridade de quem constrói. O resultado
sem norma é previsível: a mesma situação resolvida com peças diferentes em áreas
diferentes, e o usuário perdendo a capacidade de prever comportamento pela
aparência.

**Por que botão e link não se confundem.** A distinção é funcional, não estética: o
usuário espera poder abrir um link em outra aba, copiar seu endereço e voltar com o
gesto de voltar. Um botão estilizado como link quebra essas três expectativas; um
link que executa ação destrói a reversibilidade esperada da navegação
(`FH-23.03`).

**Por que alternância aplica na hora.** Um controle que parece imediato e exige
confirmação produz o pior dos dois mundos: o usuário acredita ter alterado e não
alterou. O inverso — formulário que aplica antes de confirmar — remove a chance de
revisar antes do efeito.

**Por que abas exigem cuidado.** Elas escondem conteúdo mantendo a ilusão de que
tudo está acessível. Quando a decisão exige comparar informações em abas
diferentes, o usuário passa a alternar repetidamente, carregando valores na
memória de trabalho — exatamente o que `FH-15.05` proíbe.

**Por que família de feedback não vira conteúdo.** Componentes de feedback são
projetados para desaparecer; usá-los para informação permanente significa que a
informação some quando ainda era necessária. O inverso — estado transitório em
componente de exibição — acumula avisos antigos que nunca somem.

---

## 5. As sete famílias

| Família | Papel | Componentes típicos |
| --- | --- | --- |
| **Ação** | Executar ou navegar | Botão, link, item de menu |
| **Entrada** | Coletar dados | Campo, área de texto, seleção, alternância, opção |
| **Exibição** | Apresentar conteúdo | Cartão, lista, tabela, avatar, etiqueta |
| **Navegação** | Mover entre contextos | Abas, navegação lateral, trilha |
| **Sobreposição** | Conteúdo acima do plano | Modal, painel, popover, dica |
| **Feedback** | Comunicar estado ou resultado | Alerta, mensagem temporária, indicador de status |
| **Estrutura** | Organizar espaço | Separador, acordeão, agrupamento |

---

## 6. Regras normativas — critérios de escolha

### Exibição: tabela × lista × cartão (`FH-35.05`)

| Use… | Quando a tarefa é | Nunca quando |
| --- | --- | --- |
| **Tabela** | Comparar valores entre itens | Os itens têm poucos atributos comparáveis |
| **Lista** | Percorrer e agir item a item | A comparação numérica é o objetivo |
| **Cartão** | Reconhecer por identidade visual | O volume é alto (custo de espaço) |

### Feedback: alerta × temporária × faixa (`FH-35.07`)

| Use… | Urgência | Persistência | Exemplo de situação |
| --- | --- | --- | --- |
| **Mensagem temporária** | Baixa | Some sozinha | Resultado de ação concluída fora da vista |
| **Alerta em linha** | Média | Permanece enquanto a condição existir | Erro de campo, aviso de contexto |
| **Faixa persistente** | Alta | Permanece até resolução | Degradação de serviço, limite atingido |

**Nunca:** usar mensagem temporária para informação que o usuário precisará depois
(`FH-45.06`).

### Entrada: controle por cardinalidade (`FH-35.08`)

| Situação | Controle |
| --- | --- |
| Duas opções mutuamente exclusivas, efeito imediato | Alternância |
| Poucas opções exclusivas, todas relevantes | Grupo de opções |
| Muitas opções exclusivas | Seleção |
| Muitas opções, com busca necessária | Seleção com busca |
| Múltipla escolha, poucas opções | Caixas de seleção |
| Múltipla escolha, muitas opções | Seleção múltipla com busca |

### Ação: hierarquia (`FH-35.03`)

| Nível | Uso | Quantidade por contexto |
| --- | --- | --- |
| **Primária** | A ação esperada | Exatamente uma (`FH-24.02`) |
| **Secundária** | Alternativas legítimas | Poucas |
| **Terciária** | Ações de apoio, baixa frequência | Sem limite, em menu |
| **Destrutiva** | Perda de dado ou efeito irreversível | Afastada da primária (`FH-19.03`) |

---

## 7. Anti-padrões

**Link que age.** Navegação executando efeito.

**Botão que navega.** Ação que apenas muda de tela.

**Alternância com confirmação.** Controle imediato que não aplica na hora.

**Aba comparativa.** Decisão que exige alternar entre abas.

**Temporária essencial.** Informação necessária depois exibida em mensagem que
some.

**Tabela de reconhecimento.** Grade usada onde o objetivo é identificar, não
comparar.

**Primárias múltiplas.** Vários destaques competindo.

**Destrutivo adjacente.** Excluir ao lado da ação frequente.

---

## 8. Impactos

**Cognitivo.** Componentes previsíveis permitem inferir comportamento pela
aparência — o usuário sabe o que acontecerá antes de agir.

**Emocional.** Confusão entre link e botão produz hesitação e cliques defensivos.

**Produtividade.** Critérios explícitos eliminam a deliberação recorrente de qual
peça usar.

**Percepção de qualidade.** Escolhas coerentes de componente são percebidas como
sistema; escolhas variadas, como colagem.

**Curva de aprendizagem.** Sete famílias com papéis fixos formam um vocabulário
pequeno e suficiente.

---

## 9. Riscos e trade-offs

**Risco: rigidez de catálogo.** Casos legítimos podem não encaixar. Mitigação:
`FH-35.01` prevê emenda; a maioria dos casos se resolve por composição
(`FH-28.06`).

**Risco: critérios simplificados.** Tabelas de escolha não cobrem toda nuance.
Mitigação: o critério é a **tarefa dominante**, que é declarável (`FH-08.09`).

**Risco: proliferação de variantes.** Cada exceção vira variante. Mitigação:
`FH-28.04` exige registro.

**Trade-off central.** Trocamos liberdade de escolha por previsibilidade de
comportamento. Algumas telas seriam mais elegantes com outra peça — e menos
previsíveis.

---

## 10. Critérios de verificação

1. Todo componente pertence a uma das sete famílias.
2. Botões executam; links navegam.
3. As ações seguem a hierarquia fechada, com uma única primária.
4. O momento de aplicação corresponde ao tipo de controle.
5. Tabela, lista e cartão foram escolhidos pela tarefa.
6. Nenhuma decisão exige comparar conteúdos em abas distintas.
7. O tipo de feedback corresponde à urgência e à persistência.
8. Os controles de seleção correspondem à cardinalidade e ao tamanho do conjunto.
9. Nenhuma família é usada fora do seu papel.
10. Os anti-padrões de cada componente estão documentados.

---

## 11. Checklist do capítulo

- [ ] Este elemento age (botão) ou navega (link)?
- [ ] Existe exatamente uma ação primária.
- [ ] A alternância aplica na hora; o formulário, ao confirmar.
- [ ] Escolhi tabela/lista/cartão pela tarefa dominante.
- [ ] Nada que precisa ser comparado ficou em abas separadas.
- [ ] O feedback corresponde à urgência e à persistência.
- [ ] O controle de seleção corresponde à cardinalidade.
- [ ] O destrutivo está longe da ação primária.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 23 (superfícies), 24 (ação primária), 28, 33 (status),
34 (contratos), 43 (feedback), 45 (destrutivo).

**É pré-requisito de.** Capítulos 36 (dados), 37 (responsividade), 40
(notificação).

---

## 13. Aterrissagem

| Família | Onde vive hoje |
| --- | --- |
| Ação | `button.tsx`, `dropdown-menu.tsx` |
| Entrada | `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx` |
| Exibição | `card.tsx`, `table.tsx`, `avatar.tsx`, `badge.tsx` |
| Navegação | `tabs.tsx`, `src/components/layout/sidebar.tsx` |
| Sobreposição | `dialog.tsx`, `sheet.tsx`, `popover.tsx`, `tooltip.tsx` |
| Feedback | `alert.tsx`, `themed-toaster.tsx` |
| Estrutura | `separator.tsx`, `accordion.tsx`, `scroll-area.tsx` |
