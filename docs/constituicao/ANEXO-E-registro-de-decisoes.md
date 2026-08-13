# Anexo E — Registro de Decisões, Exceções e Lacunas

> **Artefato vivo.** Este anexo é a memória institucional da Constituição.
> Decisão que não está aqui **não vincula ninguém** (`FH-02.06`).
>
> Três tipos de entrada convivem neste arquivo, cada um com seu formato:
> **precedente**, **exceção** e **lacuna**.

| Campo | Valor |
| --- | --- |
| Versão | 1.0.0 |
| Entradas ativas | 1 |
| Exceções vigentes | 0 |
| Lacunas abertas | 0 |

---

## Quando registrar

| Situação | Tipo de entrada | Artigo que obriga |
| --- | --- | --- |
| Decidi um caso não previsto (fallback) | Lacuna | `FH-02.08`, §0.11 |
| Resolvi um conflito entre artigos | Precedente | `FH-03.08` |
| Não vou cumprir um **DEVERIA** | Exceção | `FH-04.06` |
| Apliquei artigo por analogia | Precedente | §0.11, item 1 |
| Distingui um precedente existente | Precedente | `FH-02.06` |
| A mesma dúvida apareceu pela 3ª vez | Lacuna + emenda obrigatória | `FH-02.10` |

**Nunca** se registra aqui: decisão de implementação sem efeito perceptível,
preferência pessoal, ou cumprimento normal de artigo.

---

## Formato: Precedente

```markdown
### PRE-0001 — <título curto do caso>

- **Data:** AAAA-MM-DD
- **Responsável:** <nome>
- **Artigos envolvidos:** FH-XX.NN, FH-YY.MM
- **Situação:** <o caso concreto, em 2–4 linhas>
- **Critério aplicado:** <qual regra de desempate resolveu>
- **Decisão:** <o que foi decidido, de forma verificável>
- **Alcance:** <em que casos futuros este precedente vincula>
- **Status:** vigente | revogado por PRE-XXXX | convertido em FH-XX.NN
```

Um precedente vincula casos estruturalmente equivalentes até ser revogado ou
convertido em artigo. Para não segui-lo é obrigatório escrever a **distinção** —
por que o caso atual não é equivalente (`FH-02.06`).

---

## Formato: Exceção

```markdown
### EXC-0001 — <título curto>

- **Data:** AAAA-MM-DD
- **Responsável:** <nome — pessoa, nunca equipe>
- **Artigo não cumprido:** FH-XX.NN (obrigatoriamente um DEVERIA)
- **Motivo:** <por que não é possível cumprir agora>
- **Escopo:** <exatamente onde vale — nunca "no produto todo">
- **Prazo de revisão:** AAAA-MM-DD (máximo 90 dias após a data)
- **O que precisa acontecer para encerrar:** <condição concreta>
- **Status:** vigente | encerrada | caducada
```

**Exceção nunca se aplica a DEVE ou NUNCA** — esses só cedem por emenda
(`FH-01.03`). Vencido o prazo sem revisão, a exceção **caduca automaticamente** e
a regra volta a valer integralmente (`FH-04.06`). Caducidade não precisa de ato
de ninguém: ela simplesmente ocorre.

---

## Formato: Lacuna

```markdown
### LAC-0001 — <a pergunta que ficou sem resposta>

- **Data:** AAAA-MM-DD
- **Responsável:** <nome ou identificação do agente>
- **Situação:** <o caso concreto>
- **Artigo que faltou:** <nenhum, ou o mais próximo e por que não bastou>
- **Decisão tomada por fallback:** <o quê e com base em qual etapa do §0.11>
- **Ocorrências:** 1 (incrementar a cada repetição)
- **Status:** aberta | convertida em FH-XX.NN pela emenda vX.Y.Z
```

Ao atingir **3 ocorrências**, a lacuna obriga proposta de emenda (`FH-02.10`).
O contador é cumulativo e não reinicia por troca de pessoa, de time ou de agente.

---

## Precedentes

### PRE-0001 — Invariância Estrutural e Sinalização Atmosférica de Destino de Ação

- **Data:** 2026-08-13
- **Responsável:** Responsável de Produto & Antigravity Agent
- **Artigos envolvidos:** `FH-13.02` (Prioridade do Operador), `L2-C15` (Psicologia Cognitiva & Carga Cognitiva), `L2-C16` (Hábito e Fluência), `FH-57.11` (Comunicação Sem Fricção)
- **Situação:** Ao alternar modos de ação no mesmo componente de entrada que possuem destinos/impactos distintos (ex.: enviar mensagem pública ao cliente vs. registrar nota interna confidencial na conversa), a interface precisa tornar o destino evidente sem alterar a estrutura, os ícones ou a posição dos controles.
- **Critério aplicado:** *Princípio da Invariância Estrutural e Mínima Carga Cognitiva*. A estrutura física (posição do textarea, botões de ação e ícones de envio) deve permanecer rigorosamente idêntica para evitar a perda do mapa mental e a curva de aprendizado. O destino da ação é comunicado exclusivamente por acentos cromáticos sutis (borda/foco do campo e tom do botão de ação).
- **Decisão:**
  1. **Estrutura e Iconografia Invariantes:** O campo de texto, a área de escrita e a iconografia de envio (`Send`) não mudam de posição, tamanho ou formato ao alternar modos de uso.
  2. **Indicação Semântica por Acento:** O destino da ação (ex.: cliente = tom `primary`; nota interna = tom `amber`) é indicado apenas pela variação cromática do acento da borda/foco do campo de texto e da cor do botão principal.
  3. **Preservação de Fundo Neutro:** O interior dos campos e o container externo permanecem em tom neutro padrão (`bg-muted` e `bg-card`), evitando blocos coloridos pesados que causam ruído cognitivo e fadiga visual.
- **Alcance:** Vincula a caixa de entrada (composer), formulários de dupla finalidade, alternadores de escopo (público vs. privado) e qualquer elemento de interface de alta frequência no FlowHub onde a mesma estrutura executa ações de públicos/destinos diferentes.
- **Status:** vigente

---

## Exceções vigentes

*Nenhuma exceção vigente.*

---

## Lacunas abertas

*Nenhuma lacuna registrada.*

---

## Arquivo histórico

Entradas encerradas, caducadas, revogadas ou convertidas em artigo permanecem
aqui, **nunca são apagadas**. O motivo é o mesmo de `FH-04.04`: quem chegar
depois precisa saber o que já foi tentado, o que falhou e por quê. Uma decisão
apagada será retomada do zero, com o mesmo custo e, provavelmente, com o mesmo
erro.

*Nenhuma entrada arquivada.*
