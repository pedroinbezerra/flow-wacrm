# Capítulo 37 — Responsividade e Adaptação de Contexto

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 13, 14, 19, 24, 31, 36 |
| É pré-requisito de | Capítulos 38, 39 |
| Artigos | `FH-37.01` a `FH-37.10` |

---

## 0. Núcleo Normativo

**`FH-37.01`** — **Paridade de capacidade.** Toda tarefa é possível em qualquer
superfície, ainda que por caminho diferente (`FH-14.05`).
> **Verificação:** esta tarefa é possível em superfície pequena, por algum caminho? → SIM = cumpre | NÃO = viola.

**`FH-37.02`** — A **ordem de degradação** é fixa: **compactar → agrupar →
mover para detalhe → nunca remover**. Remover capacidade por falta de espaço é
proibido.
> **Verificação:** a adaptação seguiu a ordem, sem remover capacidade? → SIM = cumpre | NÃO = viola.

**`FH-37.03`** — A adaptação considera o **contexto de uso** — tipo de entrada,
alcance físico, condição de rede —, e não apenas a largura da tela.
> **Verificação:** a adaptação considera o contexto de uso, e não só a largura? → SIM = cumpre | NÃO = viola.

**`FH-37.04`** — Em superfícies de toque, **NUNCA** se depende de estados que exigem
ponteiro. Toda informação revelada por apontamento **DEVE** ter caminho equivalente
por toque.
> **Verificação:** existe caminho por toque para tudo que o apontamento revela? → SIM = cumpre | NÃO = viola.

**`FH-37.05`** — A ação primária **DEVE** permanecer alcançável em qualquer
superfície, respeitando o alcance de uma mão em toque (`FH-19.01`, `FH-19.10`).
> **Verificação:** a ação primária é alcançável, com uma mão em superfície de toque? → SIM = cumpre | NÃO = viola.

**`FH-37.06`** — Nenhuma capacidade **essencial** é exclusiva de tela grande. Se algo
é indispensável à operação, existe em todas as superfícies.
> **Verificação:** alguma capacidade essencial existe apenas em tela grande? → NÃO = cumpre | SIM = viola.

**`FH-37.07`** — Conteúdo **NUNCA** rola horizontalmente por acidente. Rolagem
horizontal só existe onde é deliberada e sinalizada (tabelas amplas, faixas).
> **Verificação:** existe rolagem horizontal não intencional em alguma superfície? → NÃO = cumpre | SIM = viola.

**`FH-37.08`** — O **modelo mental é idêntico** em todas as superfícies: mesmos
conceitos, mesmos nomes, mesma organização (`FH-20.06`, `FH-05.02`).
> **Verificação:** o modelo e o vocabulário são os mesmos em todas as superfícies? → SIM = cumpre | NÃO = viola.

**`FH-37.09`** — Mudança de superfície, tamanho ou orientação **NUNCA** descarta
estado: filtros, seleção, rascunho e posição são preservados (`FH-10.05`).
> **Verificação:** mudar de tamanho ou orientação preserva o estado? → SIM = cumpre | NÃO = viola.

**`FH-37.10`** — Toda entrega **DEVE** ser verificada em superfície pequena, com
entrada por toque (`FH-14.10`).
> **Verificação:** a verificação incluiu superfície pequena com toque? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define adaptação por **contexto de uso**, e não apenas por largura de
tela. Ele garante que o produto continue completo quando o espaço encolhe — em vez
de virar uma versão reduzida de si mesmo.

---

## 2. Perguntas que este capítulo responde

- O que muda no celular?
- O que nunca pode sumir?
- É legítimo remover funcionalidade em tela pequena?
- Como priorizo quando o espaço acaba?
- Hover funciona em toque?

---

## 3. Definições

**Superfície** — combinação de tamanho de tela, tipo de entrada e contexto físico.

**Paridade de capacidade** — a mesma tarefa é possível em qualquer superfície.

**Degradação** — adaptação do conteúdo à restrição de espaço.

**Alcance** — área confortável para o polegar em uso com uma mão.

---

## 4. Fundamento

**Por que paridade de capacidade, e não paridade de layout.** Exigir que tudo pareça
igual em toda superfície produz interfaces ruins nas duas pontas. O que precisa ser
preservado é a **possibilidade de fazer**, não a forma de fazer: uma tarefa pode
exigir três toques onde exigia um clique, e continuar sendo possível.

**Por que a ordem de degradação é fixa.** Sem ordem declarada, a primeira reação à
falta de espaço é esconder — e o que se esconde é decidido caso a caso, geralmente
pelo que é mais fácil de remover. A ordem obriga a esgotar compactação e
agrupamento antes, e proíbe o passo final: remover capacidade. Note que "mover para
detalhe" não é esconder — é a aplicação de `FH-08.05`, com a informação a um nível.

**Por que contexto, e não largura.** Uma tela pequena com ponteiro e uma tela pequena
com toque exigem coisas diferentes: alvos, hover, alcance. Adaptar só por largura
produz interfaces que cabem e não funcionam. É a mesma lógica do Capítulo 14 — o
contexto real determina o desenho.

**Por que hover não pode carregar informação.** Em toque não existe estado
intermediário entre não tocar e acionar. Informação revelada apenas por apontamento
é inacessível para uma parte dos usuários — e a mesma regra protege quem navega por
teclado (`FH-38.03`).

**Por que o modelo é idêntico.** Se a organização muda entre superfícies, o usuário
mantém dois mapas mentais do mesmo produto e perde a capacidade de transferir
conhecimento — exatamente o que `FH-05.02` proíbe. O que muda é a apresentação;
nunca a estrutura conceitual.

**Por que estado sobrevive à mudança de superfície.** Girar o aparelho ou
redimensionar a janela são ações triviais e frequentes. Descartar estado nesses
momentos é perder trabalho por um gesto que o usuário considera inofensivo — o
mesmo raciocínio de `FH-48.09`.

---

## 5. Princípios

**Preserva-se a capacidade, não o layout.**

**Esconder é o último passo; remover não é passo nenhum.**

**Largura não é contexto.**

**O modelo é o mesmo; a apresentação se adapta.**

---

## 6. Regras normativas

### Ordem de degradação (`FH-37.02`)

| # | Estratégia | O que fazer | Limite |
| --- | --- | --- | --- |
| 1 | **Compactar** | Reduzir espaçamento e tamanho de elementos não críticos | Alvos permanecem acima do mínimo (`FH-31.08`) |
| 2 | **Agrupar** | Reunir ações em menu; combinar campos | Sem esconder o essencial |
| 3 | **Mover para detalhe** | Campos contextuais e secundários vão para a visão do item | Máximo um nível (`FH-08.05`) |
| 4 | **~~Remover~~** | **Proibido** | Capacidade nunca é removida por falta de espaço |

**Regra de decisão.** Aplique na ordem. Só passe ao próximo quando o anterior
estiver esgotado, e nunca chegue ao quarto.

### `FH-37.04` — Toque e ponteiro

| Recurso | Em ponteiro | Em toque |
| --- | --- | --- |
| Informação revelada por apontamento | Dica ao apontar | Acesso por toque explícito |
| Ações reveladas ao apontar linha | Aparecem no apontamento | Sempre visíveis ou em menu do item |
| Alvo | Tamanho mínimo de ponteiro | Tamanho mínimo de toque (`FH-19.04`) |

### `FH-37.07` — Rolagem horizontal

**Permitida** em tabelas amplas e faixas de conteúdo, com indicação visual de que
há mais conteúdo. **Proibida** como consequência acidental de conteúdo que não cabe
— nesse caso, aplique a ordem de degradação.

---

## 7. Anti-padrões

**Versão reduzida.** Superfície pequena com menos capacidade.

**Adaptação por largura.** Ignorar tipo de entrada e alcance.

**Hover essencial.** Informação disponível só ao apontar.

**Ação fora de alcance.** Primária no topo de tela grande, em uso com uma mão.

**Rolagem lateral acidental.** Conteúdo transbordando sem intenção.

**Dois modelos.** Organização diferente por superfície.

**Estado perdido ao girar.** Rotação descartando filtros e rascunho.

**Verificação só em tela grande.**

---

## 8. Impactos

**Cognitivo.** Modelo único entre superfícies elimina a manutenção de dois mapas
mentais.

**Emocional.** Descobrir que uma tarefa é impossível no celular, quando é
justamente onde se está, produz frustração e desconfiança sobre o que mais faltará.

**Produtividade.** O Gestor (A2) usa o produto em movimento; paridade de capacidade
é o que torna o uso móvel real e não simbólico.

**Percepção de qualidade.** Produtos que funcionam integralmente em superfície
pequena são percebidos como bem construídos — a maioria não funciona.

**Curva de aprendizagem.** Transferência total de conhecimento entre superfícies:
aprender em uma é aprender em todas.

---

## 9. Riscos e trade-offs

**Risco: fluxos longos em tela pequena.** Preservar capacidade pode gerar caminhos
extensos. Mitigação: a ordem de degradação prioriza compactar e agrupar; caminhos
mais longos são aceitáveis, ausência de caminho não.

**Risco: densidade insuficiente.** Alvos de toque consomem espaço. Mitigação:
`FH-31.08` separa densidade visual de área sensível.

**Risco: custo de verificação.** Mais superfícies a testar. Mitigação: `FH-37.10`
exige o cenário que concentra os defeitos — pequeno e por toque.

**Trade-off central.** Trocamos otimização por superfície por completude
universal. Nenhuma superfície é perfeitamente otimizada; todas permitem trabalhar.

---

## 10. Critérios de verificação

1. Toda tarefa é possível em qualquer superfície.
2. A adaptação seguiu a ordem de degradação, sem remover capacidade.
3. A adaptação considerou contexto de uso, não apenas largura.
4. Tudo revelado por apontamento tem caminho por toque.
5. A ação primária é alcançável, com uma mão em toque.
6. Nenhuma capacidade essencial é exclusiva de tela grande.
7. Não há rolagem horizontal acidental.
8. O modelo e o vocabulário são idênticos em todas as superfícies.
9. Mudança de tamanho ou orientação preserva o estado.
10. A verificação incluiu superfície pequena com toque.

---

## 11. Checklist do capítulo

- [ ] Consigo executar esta tarefa em tela pequena.
- [ ] Compactei e agrupei antes de mover para detalhe.
- [ ] Não removi nenhuma capacidade.
- [ ] Tudo que aparece no apontamento tem caminho por toque.
- [ ] A ação primária está ao alcance do polegar.
- [ ] Nada rola para o lado sem querer.
- [ ] Girei a tela: o estado se manteve.
- [ ] Testei com toque, não só redimensionando a janela.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 13 (arquétipos), 14 (`FH-14.05`), 19 (alcance), 24
(composição), 31 (densidade), 36 (prioridade de campos).

**É pré-requisito de.** Capítulos 38 (acessibilidade), 39 (movimento).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Estrutura adaptativa | `src/app/(dashboard)/dashboard-shell.tsx` |
| Navegação em superfície pequena | `src/components/layout/sidebar.tsx`, `src/components/ui/sheet.tsx` |
| Primitivas responsivas | `src/components/ui/` |
| Tabelas amplas | `src/components/ui/table.tsx`, `scroll-area.tsx` |
