# Anexo D — Modelos de Documento

> Modelos prontos para os cinco documentos que a Constituição exige. Copie,
> preencha, registre no local indicado.

| Campo | Valor |
| --- | --- |
| Versão | 1.0.0 |
| Modelos | 5 |

| Modelo | Quando usar | Onde registrar |
| --- | --- | --- |
| **D1 — Bloco de Conformidade** | Toda entrega com efeito perceptível | Na própria entrega |
| **D2 — RFC de experiência** | Antes de construir algo novo | Anexo E |
| **D3 — Revisão** | Ao revisar trabalho de pessoa ou agente | Na revisão |
| **D4 — Proposta de componente** | Antes de criar componente novo | Anexo E |
| **D5 — Proposta de emenda** | Ao propor alteração da Constituição | Emenda formal |

---

## D1 — Bloco de Conformidade

Obrigatório em toda entrega com efeito perceptível (`FH-68.02`, `FH-62.06`).
Seção sem item recebe "nenhuma"; omitir seção é descumprimento.

```markdown
## Conformidade constitucional

**Artigos aplicados:** FH-XX.NN, FH-YY.MM

**Decisões constitucionais:**
- <decisão tomada> — fundamento: FH-XX.NN

**Interpretações adotadas:** <se houve ambiguidade — FH-68.14>

**Checklist aplicada:** <C-A / C-B / C-C / C-D / C-E / C-F / C-G / C-H>

**Bloqueios absolutos verificados:** 8/8 — nenhum presente

**Lacunas encontradas:** <caso + artigo que faltou + etapa do §0.11 aplicada>

**Dívidas identificadas:** <desconformidade preexistente encontrada, não corrigida>

**Não verificado:** <critério + motivo pelo qual não foi possível verificar>
```

---

## D2 — RFC de experiência

Antes de construir (`FH-12.01`, `FH-67.04`, `FH-06.03`).

```markdown
# RFC — <título>

## Problema
<o problema real, com evidência. Não descreva a solução aqui.>

## Evidência
| Fonte | O que mostra | Peso |
| --- | --- | --- |
| <observação / métrica / suporte / dívida> | <achado> | <alto/baixo> |

> Volume de pedidos não é justificativa (`FH-12.02`, `FH-67.02`).

## Filtro constitucional (FH-12.01)
- [ ] **Pertencimento** — posição no eixo: <Pessoa/Conversa/Processo/Resultado>
- [ ] **Direção** — trabalho que **remove** do usuário: <o quê>
- [ ] **Princípios** — princípios servidos: <P#> · princípios em risco: <P#>
- [ ] **Custo Permanente** — manutenção: <> · suporte: <> · carga cognitiva
      adicionada a todos: <> · restrição futura: <>

## Arquétipos (FH-13.03)
- Primário: <A1–A5>
- Impacto sobre os demais: <>

## Autonomia (FH-18.09)
- Nível: <1–5> · justificativa se > 2: <>

## Efeito esperado (FH-67.05)
- O que deve mudar: <>
- Como será verificado: <métrica de FH-64 + evidência qualitativa>

## Alternativas descartadas
<o que foi considerado e por que não>
```

---

## D3 — Revisão

Usado por pessoa ou agente (`FH-63.06`, `FH-65.06`).

```markdown
# Revisão — <entrega>

**Checklist aplicada:** <C-A…C-H>
**Heurísticas percorridas:** H1…H10 (`FH-61.01`)
**Tarefa percorrida:** <qual, do início ao fim> (`FH-61.07`)
**Estados adversos testados:** erro · vazio · sem permissão · rede ruim · volume

## Achados

| # | Heurística | Artigo | Evidência observável | Gravidade |
| --- | --- | --- | --- | --- |
| 1 | H<n> | FH-XX.NN | <sinal concreto> | bloqueio / correção / melhoria |

> Objeção sem artigo é **sugestão** e não bloqueia (`FH-02.07`).

## Bloqueios absolutos (FH-62.01)
- [ ] Acessibilidade · [ ] Perda de trabalho · [ ] Tenancy · [ ] Estado não tratado
- [ ] Destrutivo sem saída · [ ] Efeito externo sem autorização
- [ ] Texto fora do dicionário · [ ] Estado exibido falso

## Resultado
<aprovado / aprovado com dívidas registradas / bloqueado>

**Dívidas registradas:** <IDs no Anexo F>
```

---

## D4 — Proposta de componente

Antes de criar (`FH-28.05`).

```markdown
# Componente — <nome>

## Problema
<o que nenhum componente existente resolve>

## Reutilização esgotada (FH-28.02, FH-28.06)
- Primitiva existente considerada: <qual> — por que não serve: <>
- Composição considerada: <qual> — por que não serve: <>
- Variante registrada considerada: <qual> — por que não serve: <>

## Contrato (FH-34)
- Estados implementados: padrão · apontado · focado · ativo · desabilitado ·
  carregando · erro · somente leitura
- Operação por teclado: <como>
- Conteúdo mínimo / típico / extremo: <verificações>
- Posse do estado: controlado / não controlado / ambos

## Família e estágio
- Família (FH-35.01): <ação/entrada/exibição/navegação/sobreposição/feedback/estrutura>
- Estágio (FH-28.03): proposta

## Custo permanente (FH-12.06)
<manutenção, suporte, carga, restrição futura>

## Anti-padrões conhecidos (FH-35.10)
<o que já se sabe que dá errado com este componente>
```

---

## D5 — Proposta de emenda

Rito do Capítulo 4. Agentes **propõem**; nunca aplicam (`FH-68.04`).

```markdown
# Emenda — <artigo ou capítulo afetado>

**Tipo (FH-04.01):** MAIOR / MENOR / CORREÇÃO

## Os seis itens obrigatórios (FH-04.02)
1. **O que muda:** <>
2. **Por que muda:** <>
3. **Evidência que motivou (FH-04.03):** <caso real, métrica, incidente, lacuna
   com 3+ ocorrências>
4. **O que passa a ser proibido:** <>
5. **O que deixa de ser proibido:** <>
6. **Impacto sobre o produto existente:** <>

## Análise do existente (obrigatória)
- Capítulo lido integralmente, incluindo §7 (anti-padrões) e §9 (riscos): <sim>
- O trade-off já havia sido considerado e descartado? <sim/não — se sim, o que
  mudou desde então>

## Análise de impacto (FH-04.07 — obrigatória em MAIOR)
| O que passa a estar em desconformidade | Gravidade | Dívida registrada |
| --- | --- | --- |

## Vigência (FH-04.11)
<vale só para o que começar depois / exige revisão do que está em execução>

## Cláusulas pétreas (FH-04.12)
- [ ] Confirmo que a emenda **não reduz** isolamento de dados, acessibilidade,
      reversibilidade ou compreensão.

## Legitimação retroativa (FH-04.09)
- [ ] Confirmo que esta emenda **não** tem como efeito principal validar entrega
      anterior em desconformidade.

## Artefatos vivos a atualizar (FH-04.08)
- [ ] Anexo B · [ ] Anexo A · [ ] Anexo C · [ ] Anexo F · [ ] Checklists (C-A…C-H)
```

---

*Anexo D v1.0.0. Modelos são atualizados a cada emenda que altere os requisitos que
eles coletam (`FH-04.08`).*
