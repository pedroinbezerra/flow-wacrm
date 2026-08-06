# Anexo E — Registro de Decisões, Exceções e Lacunas

> **Artefato vivo.** Este anexo é a memória institucional da Constituição.
> Decisão que não está aqui **não vincula ninguém** (`FH-02.06`).
>
> Três tipos de entrada convivem neste arquivo, cada um com seu formato:
> **precedente**, **exceção** e **lacuna**.

| Campo | Valor |
| --- | --- |
| Versão | 1.0.0 |
| Entradas ativas | 0 |
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

*Nenhum registro. O primeiro precedente será criado quando houver o primeiro
conflito real entre artigos.*

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
