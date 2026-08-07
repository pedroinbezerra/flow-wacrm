# Capítulo 48 — Sistema de Comandos e Teclado

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P8), 13, 16, 19, 45, 47 |
| É pré-requisito de | Capítulos 38, 49 |
| Artigos | `FH-48.01` a `FH-48.10` |

---

## 0. Núcleo Normativo

**`FH-48.01`** — O produto **DEVE** oferecer uma **paleta de comandos** como acesso
universal a ações e destinos, alcançável de qualquer lugar pelo mesmo gesto
(`FH-47.08`).
> **Verificação:** existe paleta de comandos alcançável de qualquer área pelo mesmo gesto? → SIM = cumpre | NÃO = viola.

**`FH-48.02`** — Toda ação frequente **DEVE** ser executável integralmente por
teclado, com resultado idêntico ao do ponteiro (`FH-16.03`).
> **Verificação:** esta ação é executável só com teclado, com o mesmo resultado? → SIM = cumpre | NÃO = viola.

**`FH-48.03`** — **Consistência global de teclas.** A mesma combinação tem o mesmo
significado em todo o produto. Reatribuição por contexto é proibida (`FH-07.08`).
> **Verificação:** esta combinação significa a mesma coisa nas demais áreas? → SIM = cumpre | NÃO = viola.

**`FH-48.04`** — **Reserva de teclas.** O produto **NUNCA** sobrescreve combinações
do navegador, do sistema operacional ou de tecnologias assistivas.
> **Verificação:** alguma combinação usada conflita com navegador, sistema ou tecnologia assistiva? → NÃO = cumpre | SIM = viola.

**`FH-48.05`** — Todo atalho **DEVE** ser exibido junto da ação que executa
(`FH-16.04`). Lista de atalhos em documentação **não** satisfaz esta regra.
> **Verificação:** o atalho aparece ao lado da ação correspondente? → SIM = cumpre | NÃO = viola.

**`FH-48.06`** — Ação destrutiva acionada por teclado **DEVE** ter a mesma proteção
do caminho por ponteiro (`FH-16.07`, `FH-45`).
> **Verificação:** o atalho oferece a mesma proteção que o caminho completo? → SIM = cumpre | NÃO = viola.

**`FH-48.07`** — O **foco é sempre visível**, em qualquer elemento interativo, e
**NUNCA** é suprimido por razão estética (`FH-38`).
> **Verificação:** o foco é visível em todos os elementos interativos? → SIM = cumpre | NÃO = viola.

**`FH-48.08`** — A **ordem de foco** segue a ordem de leitura e de uso
(`FH-19.05`), sem saltos e sem elementos inalcançáveis.
> **Verificação:** a navegação por teclado percorre a tela na ordem de uso, sem saltos nem elementos inalcançáveis? → SIM = cumpre | NÃO = viola.

**`FH-48.09`** — A tecla de escape **sempre** cancela ou fecha o contexto atual, sem
efeito colateral e sem perda de trabalho (`FH-10.01`).
> **Verificação:** escape cancela o contexto atual sem perder trabalho? → SIM = cumpre | NÃO = viola.

**`FH-48.10`** — A paleta de comandos **DEVE** respeitar permissão: **NUNCA** lista
ações que o usuário não pode executar nem destinos que ele não pode acessar
(`FH-10.06`, `FH-51`).
> **Verificação:** a paleta exibe ações ou destinos inacessíveis ao usuário? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo garante o **caminho da fluência**: operar o produto sem tirar as mãos
do teclado. Ele serve simultaneamente ao arquétipo de maior volume (A1) e à
acessibilidade — as duas exigências convergem na mesma implementação.

---

## 2. Perguntas que este capítulo responde

- O que precisa de atalho?
- Como escolho a tecla?
- Como o usuário descobre?
- Como evito conflito com o navegador e com leitores de tela?
- Comandos podem executar ações destrutivas?

---

## 3. Definições

**Paleta de comandos** — superfície de busca que executa ações e navega, acionada
por teclado.

**Atalho** — combinação que executa uma ação diretamente.

**Foco** — elemento que receberá a próxima entrada de teclado.

**Ordem de foco** — sequência em que os elementos recebem foco.

**Tecla reservada** — combinação pertencente ao navegador, ao sistema ou a
tecnologia assistiva.

---

## 4. Fundamento

**Por que a paleta é o centro do capítulo.** Ela resolve três problemas de uma vez:
dá acesso universal a ações sem consumir território de navegação (`FH-22.05`),
elimina a memorização de dezenas de atalhos e permite descobrir capacidades por
busca. É a materialização de P8 — profundidade acessível no mesmo lugar da
superfície, sem modo avançado.

**Por que atalhos importam apesar da baixa adoção.** Quem os usa é o Operador, cuja
produtividade se multiplica pela frequência. Mas há um segundo motivo, mais
importante: garantir operação completa por teclado **é** o requisito de
acessibilidade (Capítulo 38). Um produto navegável por teclado é utilizável por
quem não usa ponteiro — por escolha, por deficiência ou por contexto. As duas
exigências têm a mesma implementação, e é por isso que `FH-48.02` não admite
"poucos usam" como argumento.

**Por que a consistência é global.** Um atalho que muda de função conforme a área
transforma a memória motora em risco: a mão executa a sequência aprendida e produz
outro efeito. É a mesma lógica de `FH-16.02`, aplicada ao teclado.

**Por que teclas são reservadas.** Sobrescrever combinações do navegador ou de
leitores de tela quebra ferramentas das quais o usuário depende — e frequentemente
quebra justamente para quem mais precisa delas. Nenhum ganho de conveniência
justifica.

**Por que o atalho não pode ser mais perigoso.** Fluência significa executar sem
ler. Um atalho destrutivo sem proteção equivalente é uma armadilha construída
especificamente para quem mais usa o produto.

**Por que a paleta respeita permissão.** Uma paleta que lista tudo e falha ao
executar revela a existência de capacidades e destinos que o usuário não deveria
conhecer — o mesmo vazamento de `FH-47.07`, em outra superfície.

---

## 5. Princípios

**A paleta substitui a memorização de atalhos.**

**Teclado não é atalho para poucos: é acesso para todos.**

**Uma tecla, um significado, em todo o produto.**

**Atalho nunca é mais perigoso que o caminho longo.**

---

## 6. Regras normativas

### Camadas de acesso por teclado

| Camada | O que oferece | Obrigatoriedade |
| --- | --- | --- |
| **Navegação por foco** | Alcançar e acionar qualquer elemento interativo | Sempre (`FH-38`) |
| **Paleta de comandos** | Buscar e executar ações e destinos | Sempre (`FH-48.01`) |
| **Atalhos diretos** | Executar ações frequentes sem intermediário | Para ações de alta frequência |

**Ordem de decisão.** Antes de criar um atalho direto, verifique se a paleta já
resolve. Atalhos diretos são recurso escasso: cada um consome uma combinação e
adiciona algo a memorizar.

### `FH-48.03` — Consistência de significado

**Certo.** A combinação que salva salva em todo lugar; a que fecha fecha em todo
lugar.

**Errado.** A mesma combinação salvando em uma área e criando em outra.

### `FH-48.09` — Escape previsível

**Certo.** Escape fecha a sobreposição atual, preservando o que foi digitado
(`FH-10.01`).

**Errado.** Escape fechando e descartando um formulário preenchido — perde-se
trabalho por um gesto que o usuário considera seguro.

### `FH-48.10` — Paleta e permissão

**Errado.** Listar uma ação administrativa para quem não é administrador, com erro
ao executar. A listagem já revelou a existência da capacidade e da área.

---

## 7. Anti-padrões

**Atalho secreto.** Existe, é útil, não aparece em lugar nenhum.

**Tecla polissêmica.** Mesma combinação, significados diferentes por área.

**Sequestro de tecla.** Sobrescrita de combinação do navegador ou de leitor de
tela.

**Foco invisível.** Contorno removido por estética.

**Ordem caótica.** Foco saltando pela tela fora da ordem de uso.

**Escape destrutivo.** Cancelar perdendo trabalho.

**Atalho armadilha.** Destruição sem confirmação, disponível a um toque.

**Paleta indiscreta.** Ações inacessíveis listadas.

---

## 8. Impactos

**Cognitivo.** A paleta transforma recordação em reconhecimento: o usuário não
precisa lembrar o atalho, apenas o nome aproximado da ação.

**Emocional.** Fluência por teclado produz a sensação mais forte de domínio que uma
ferramenta de trabalho pode oferecer.

**Produtividade.** É o maior ganho disponível para o arquétipo de maior volume, e o
único que cresce com a familiaridade.

**Percepção de qualidade.** Suporte completo a teclado é lido como sinal de produto
profissional — e sua ausência, como produto para uso ocasional.

**Curva de aprendizagem.** `FH-48.05` faz a descoberta acontecer durante o uso
normal: o usuário aprende o atalho enquanto usa o mouse, sem esforço dedicado.

---

## 9. Riscos e trade-offs

**Risco: proliferação de atalhos.** Muitas combinações sobrecarregam e conflitam.
Mitigação: a ordem de decisão de §6 — a paleta primeiro, atalho direto só para alta
frequência.

**Risco: conflito com tecnologias assistivas.** Nem sempre óbvio na construção.
Mitigação: `FH-48.04` e verificação com leitor de tela no Capítulo 38.

**Risco: poluição visual.** Exibir atalhos adiciona informação. Mitigação: exibição
discreta, contando como parte do bloco da própria ação (`FH-15.01`).

**Trade-off central.** Trocamos simplicidade de implementação por acesso universal.
Manter paridade entre teclado e ponteiro em toda ação custa — e é o que torna o
produto utilizável por quem não pode usar ponteiro.

---

## 10. Critérios de verificação

1. Existe paleta de comandos alcançável de qualquer área pelo mesmo gesto.
2. Toda ação frequente é executável só por teclado, com resultado idêntico.
3. Cada combinação tem significado único em todo o produto.
4. Nenhuma combinação conflita com navegador, sistema ou tecnologia assistiva.
5. Todo atalho é exibido junto da sua ação.
6. Atalhos destrutivos têm a mesma proteção do caminho completo.
7. O foco é visível em todos os elementos interativos.
8. A ordem de foco segue a ordem de uso, sem saltos.
9. Escape cancela sem efeito colateral e sem perda.
10. A paleta não lista ações nem destinos inacessíveis.

---

## 11. Checklist do capítulo

- [ ] Consegui executar a tarefa inteira sem o ponteiro.
- [ ] O foco está visível em cada parada.
- [ ] A ordem de foco acompanha a ordem de uso.
- [ ] O atalho aparece ao lado da ação.
- [ ] A combinação significa o mesmo em todo o produto.
- [ ] Nenhuma tecla do navegador ou do leitor de tela foi sobrescrita.
- [ ] Escape cancela sem perder o que foi digitado.
- [ ] A paleta não mostra o que este usuário não pode fazer.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P8), 13 (Operador), 16 (`FH-16.03`, `FH-16.04`,
`FH-16.07`), 19 (ordem de uso), 45 (proteção), 47 (busca).

**É pré-requisito de.** Capítulos 38 (acessibilidade), 49 (produtividade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Navegação por teclado | Primitivas em `src/components/ui/` (dialog, dropdown, select, tabs, popover) |
| Foco e anel de foco | Tokens `--ring` em `src/app/globals.css` |
| Gestos e atalhos | `src/hooks/` |
| Permissões aplicadas à interface | `src/components/ui/gated-button.tsx`, guards de rota |
