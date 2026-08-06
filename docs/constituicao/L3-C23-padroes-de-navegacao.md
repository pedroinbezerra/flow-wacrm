# Capítulo 23 — Padrões de Navegação

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P7), 10, 14, 22 |
| É pré-requisito de | Capítulos 24, 35, 37, 41, 46 |
| Artigos | `FH-23.01` a `FH-23.11` |

---

## 0. Núcleo Normativo

**`FH-23.01`** — Existem **cinco superfícies** de navegação, e apenas cinco:
**página**, **painel lateral**, **modal**, **inline** e **sobreposição efêmera**. A
escolha entre elas segue a matriz de §6, nunca preferência.
> **Verificação:** a superfície escolhida corresponde à matriz de §6? → SIM = cumpre | NÃO = viola.

**`FH-23.02`** — **Endereçabilidade.** Todo estado relevante — item aberto, filtro
aplicado, aba selecionada, painel visível — **DEVE** ter endereço próprio,
compartilhável e restaurável.
> **Verificação:** este estado pode ser reaberto a partir do seu endereço? → SIM = cumpre | NÃO = viola.

**`FH-23.03`** — Toda saída **DEVE** ter volta previsível. O gesto de voltar do
navegador e do sistema operacional **DEVE** produzir o resultado que o usuário
espera, sempre.
> **Verificação:** voltar retorna ao ponto anterior, sem saltos nem perda? → SIM = cumpre | NÃO = viola.

**`FH-23.04`** — **NUNCA** existe modal sobre modal. Uma sobreposição bloqueante de
cada vez.
> **Verificação:** este fluxo abre uma sobreposição bloqueante sobre outra? → NÃO = cumpre | SIM = viola.

**`FH-23.05`** — Ao retornar a uma lista, **DEVEM** ser preservados: filtros,
ordenação, seleção, posição de rolagem e item em foco (`FH-10.05`).
> **Verificação:** ao voltar, os cinco estados da lista foram preservados? → SIM = cumpre | NÃO = viola.

**`FH-23.06`** — Modal **NUNCA** contém fluxo de múltiplos passos, edição longa ou
conteúdo que o usuário possa perder ao fechar acidentalmente.
> **Verificação:** este modal contém fluxo de múltiplos passos ou trabalho perdível? → NÃO = cumpre | SIM = viola.

**`FH-23.07`** — Navegação **NUNCA** descarta trabalho sem aviso explícito e sem
oferecer preservação (`FH-10.01`).
> **Verificação:** sair desta tela com trabalho pendente avisa e preserva? → SIM = cumpre | NÃO = viola.

**`FH-23.08`** — O usuário **DEVE** sempre saber onde está: a superfície indica sua
posição na estrutura, sem depender de memória.
> **Verificação:** é possível saber a localização atual apenas olhando a tela? → SIM = cumpre | NÃO = viola.

**`FH-23.09`** — Navegar para o detalhe de um item **NUNCA** destrói o contexto da
lista quando o usuário está percorrendo vários itens em sequência.
> **Verificação:** é possível percorrer vários itens sem reconstruir o contexto a cada um? → SIM = cumpre | NÃO = viola.

**`FH-23.10`** — Endereços compartilháveis **DEVEM** respeitar permissão e
isolamento por conta. Um endereço **NUNCA** revela existência de dado que o
destinatário não pode ver (`FH-10.06`).
> **Verificação:** o endereço, aberto por quem não tem acesso, revela existência ou conteúdo? → NÃO = cumpre | SIM = viola.

**`FH-23.11`** — Nenhuma navegação **PODE** ocorrer sem ação deliberada do usuário.
Redirecionamento automático é permitido apenas para autenticação, permissão e
recurso inexistente — sempre com explicação do motivo.
> **Verificação:** houve navegação automática fora dos três casos permitidos? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **como o usuário se move** pelo produto, como sabe onde está e
como volta. Ele converte a arquitetura do Capítulo 22 em comportamento observável.

---

## 2. Perguntas que este capítulo responde

- Quando uso página, painel, modal ou inline?
- Como preservo contexto ao navegar?
- O botão voltar do navegador precisa funcionar?
- Como funciona a URL?
- Posso abrir um modal dentro de outro?
- Posso redirecionar o usuário automaticamente?

---

## 3. Definições

**Página** — superfície de primeira classe, com endereço próprio e substituição
completa do conteúdo.

**Painel lateral** — superfície complementar que preserva o contexto de origem
visível.

**Modal** — sobreposição bloqueante que exige decisão antes de continuar.

**Inline** — edição ou revelação no próprio lugar do conteúdo.

**Sobreposição efêmera** — elemento transitório sem bloqueio: menu, dica,
sugestão.

**Contexto de origem** — a tela e o estado de onde o usuário partiu.

---

## 4. Fundamento

**Por que a escolha de superfície é normativa.** É uma das decisões mais frequentes
do desenho e uma das mais decididas por gosto. A consequência de escolher errado é
concreta: modal para trabalho longo produz perda de conteúdo; página para consulta
rápida destrói contexto; painel para decisão bloqueante permite que o usuário
ignore o que precisava decidir. `FH-23.01` transforma a escolha em consulta de
matriz.

**Por que endereçabilidade importa.** Um estado sem endereço não pode ser
compartilhado com um colega, não pode ser retomado depois, não sobrevive a um
recarregamento e não é alcançável pelo histórico. Em um produto de trabalho
colaborativo, "me manda o link disso" é operação cotidiana — e sua ausência força o
usuário a explicar por escrito o caminho de navegação.

**Por que voltar precisa funcionar.** O gesto de voltar é o mais automatizado que
existe na web: o usuário o executa sem pensar. Quando ele produz resultado
inesperado — sai do produto, perde o formulário, pula duas telas —, o custo não é
o passo perdido: é a hesitação permanente que se instala, e o usuário passa a
evitar navegar.

**Por que modal sobre modal é proibido.** Cada camada bloqueante adiciona um estado
que o usuário precisa manter na memória de trabalho, e o caminho de volta se torna
ambíguo — fechar leva para onde? Além disso, a segunda camada quase sempre indica
que a primeira estava resolvendo algo grande demais para um modal (`FH-23.06`).

**Por que a preservação de lista é crítica.** O padrão de trabalho do Operador é
percorrer itens em sequência: abrir, resolver, voltar, abrir o próximo. Se cada
retorno reinicia filtros e rolagem, o custo se multiplica pelo número de itens — e
o usuário abandona o fluxo, passando a abrir tudo em abas separadas, o que fragmenta
seu contexto ainda mais.

**Por que redirecionamento automático é quase sempre proibido.** Navegação não
solicitada é a forma mais literal de surpresa (P4): o usuário estava em um lugar e
passou a estar em outro sem ter pedido. As três exceções de `FH-23.11` — autenticação,
permissão, recurso inexistente — são casos em que permanecer é impossível, e mesmo
nelas a explicação do motivo é obrigatória.

---

## 5. Princípios

**Superfície é decisão de conteúdo, não de estética.**

**Todo estado relevante tem endereço.**

**Voltar sempre funciona.**

**Quem percorre uma lista não deve reconstruí-la a cada item.**

---

## 6. Matriz de escolha de superfície

| Use… | Quando | Nunca quando |
| --- | --- | --- |
| **Página** | O conteúdo é o trabalho principal; a permanência é longa; precisa de endereço próprio e de espaço | A tarefa é uma consulta rápida dentro de outro contexto |
| **Painel lateral** | O usuário precisa do detalhe **sem perder** a lista ou o contexto de origem; vai percorrer vários itens | O conteúdo exige espaço amplo ou é o trabalho principal |
| **Modal** | Exige decisão imediata e bloqueante: confirmação, escolha curta, aviso crítico | Há múltiplos passos, edição longa, ou conteúdo perdível (`FH-23.06`) |
| **Inline** | A alteração é pequena, local e no próprio objeto | A alteração afeta muitos itens ou exige contexto adicional |
| **Sobreposição efêmera** | Informação complementar, menu de ações, sugestão | A informação é essencial para a tarefa (`FH-15.05`) |

**Regra de decisão em uma linha:** se o usuário vai **percorrer vários**, use
painel; se vai **decidir uma vez**, use modal; se vai **trabalhar**, use página; se
vai **ajustar**, use inline.

### `FH-23.02` — Endereçabilidade

**Quando NÃO aplicar.** Sobreposições efêmeras e estados puramente transitórios
(menu aberto, dica visível) não exigem endereço.

**Certo.** Filtro aplicado e item aberto refletidos no endereço; recarregar
restaura tudo.

**Errado.** Estado mantido apenas em memória — recarregar devolve o usuário ao
início.

### `FH-23.09` — Percurso de lista

**Certo.** Painel lateral com navegação para o próximo item sem voltar à lista.

**Errado.** Cada item abre uma página que, ao voltar, recarrega a lista do topo,
sem filtro.

### `FH-23.11` — Sem navegação automática

**Certo.** Após autenticar, retornar ao destino pretendido, informando que houve
redirecionamento.

**Errado.** Concluir uma ação e ser levado a outra tela sem ter pedido. Mesmo
quando o destino é "útil", o usuário perde o contexto que tinha.

---

## 7. Anti-padrões

**Modal-formulário.** Fluxo longo dentro de sobreposição bloqueante.

**Voltar quebrado.** Gesto de voltar com resultado imprevisível.

**Lista amnésica.** Retorno que descarta filtro, ordenação e posição.

**Estado sem endereço.** Nada é compartilhável nem restaurável.

**Empilhamento.** Modal sobre modal, painel sobre painel.

**Redirecionamento gentil.** Levar o usuário para "onde é melhor" sem que ele peça.

**Endereço indiscreto.** Link que revela existência de dado a quem não tem acesso.

---

## 8. Impactos

**Cognitivo.** Superfícies previsíveis eliminam a necessidade de reconstruir o
mapa mental a cada navegação. `FH-23.05` remove a reconstrução repetida de
contexto de lista.

**Emocional.** Navegação previsível produz segurança; navegação que surpreende
produz hesitação — o usuário passa a "salvar antes de clicar".

**Produtividade.** `FH-23.09` afeta diretamente o padrão de trabalho dominante do
Operador: percorrer itens em sequência.

**Percepção de qualidade.** Voltar quebrado e perda de filtro são dois dos defeitos
mais associados a produtos amadores, mesmo quando todo o resto funciona.

**Curva de aprendizagem.** Cinco superfícies com critérios fixos permitem que o
usuário preveja o que acontecerá antes de clicar — previsão é a base do aprendizado
por exploração.

---

## 9. Riscos e trade-offs

**Risco: rigidez da matriz.** Casos legítimos podem não encaixar. Mitigação: a
matriz decide por **natureza do conteúdo**, que cobre a quase totalidade dos casos;
o resto vai para o fallback (§0.11).

**Risco: complexidade de endereçamento.** Refletir todo estado no endereço custa
implementação. Custo assumido: é o que torna o produto compartilhável e retomável.

**Risco: painéis sobrecarregados.** Preservar contexto pode levar a acumular
informação lateral. Mitigação: os limites do Capítulo 15 continuam valendo.

**Trade-off central.** Trocamos liberdade de composição de fluxo por
previsibilidade de navegação. Alguns fluxos ficam mais longos; nenhum surpreende.

---

## 10. Critérios de verificação

1. Toda superfície escolhida corresponde à matriz.
2. Todo estado relevante tem endereço restaurável.
3. Voltar produz o resultado esperado em todos os fluxos.
4. Nenhuma sobreposição bloqueante abre sobre outra.
5. Retorno a listas preserva filtro, ordenação, seleção, rolagem e foco.
6. Nenhum modal contém fluxo longo ou trabalho perdível.
7. Nenhuma navegação descarta trabalho sem aviso e preservação.
8. A localização atual é sempre visível.
9. Percorrer vários itens não exige reconstruir contexto.
10. Nenhum endereço revela dado inacessível.
11. Nenhuma navegação automática ocorre fora dos três casos permitidos.

---

## 11. Checklist do capítulo

- [ ] Escolhi a superfície pela matriz, não por preferência.
- [ ] O estado está no endereço e é restaurável.
- [ ] Testei o botão voltar em todos os caminhos.
- [ ] Não empilhei sobreposições bloqueantes.
- [ ] Voltei à lista: filtro, ordenação, seleção, rolagem e foco intactos.
- [ ] Nenhum modal contém fluxo longo.
- [ ] Sair com trabalho pendente avisa e preserva.
- [ ] Consigo percorrer vários itens sem reconstruir o contexto.
- [ ] Nenhum redirecionamento automático fora dos casos permitidos.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P7), 10 (continuidade), 14 (retomada), 22
(arquitetura).

**É pré-requisito de.** Capítulos 24 (composição), 35 (componentes), 37
(responsividade), 41 (estados), 46 (desempenho percebido). Alimenta a matriz
pendente de superfície no Anexo C.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Roteamento e endereços | `src/app/(dashboard)/`, App Router do Next.js |
| Página | `page.tsx` de cada rota |
| Painel lateral | `src/components/ui/sheet.tsx` |
| Modal | `src/components/ui/dialog.tsx` |
| Sobreposição efêmera | `src/components/ui/popover.tsx`, `dropdown-menu.tsx`, `tooltip.tsx` |
| Guardas de acesso e redirecionamento | `src/middleware.ts`, `src/app/auth/callback/route.ts` |
