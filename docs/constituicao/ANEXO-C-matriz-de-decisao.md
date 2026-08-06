# Anexo C — Matrizes de Decisão Rápida

> **Artefato vivo.** Converte os artigos vigentes nas escolhas concretas que
> aparecem todos os dias. É o segundo nível de carregamento de contexto para
> agentes (`FH-68.08`), logo depois do Anexo B.
>
> **Estas matrizes não criam obrigação.** Elas aplicam artigos existentes. Em
> divergência entre uma matriz e o capítulo, **prevalece o capítulo**
> (`FH-01.09`).

| Campo | Valor |
| --- | --- |
| Versão | 1.1.0 |
| Matrizes ativas | 14 |
| Base normativa | Capítulos 1–19 e 68 |
| Matrizes pendentes | 6 (dependem de capítulos ainda não escritos — ver §Pendentes) |

---

## C1 — Construir ou recusar

Aplique os quatro testes **na ordem**. A primeira reprovação encerra a análise.

| # | Teste | Pergunta | Reprovou → |
| --- | --- | --- | --- |
| 1 | Pertencimento (`FH-05.05`) | Encaixa em Pessoa → Conversa → Processo → Resultado? | Recusar como **"nunca"**, salvo emenda ao Cap. 5/20 |
| 2 | Direção (`FH-06.01`) | Tira trabalho do usuário, ou transfere trabalho a ele? | Redesenhar; se não for possível, recusar |
| 3 | Princípios (`FH-07.01`) | Contraria algum dos dez princípios? | Redesenhar; recusar se persistir |
| 4 | Custo Permanente (`FH-12.06`) | Manutenção + suporte + carga cognitiva + restrição futura compensam? | Recusar como **"não agora"** |

**Justificativas que não valem:** número de pedidos (`FH-12.02`) • concorrente tem
(`FH-12.07`) • cliente grande pediu (`FH-01.03`) • um único cliente usa
(`FH-12.05`) • "é assim que CRMs fazem" (`FH-05.03`).

---

## C2 — Perguntar ao usuário ou decidir pelo sistema

| Situação | Decisão | Artigo |
| --- | --- | --- |
| O sistema já observou ou pode derivar o dado | **Decidir.** Perguntar é proibido | `FH-06.02` |
| Existe valor que funciona para a maioria | **Decidir** com padrão inteligente; permitir divergir depois | `FH-08.03`, `FH-06.04` |
| A informação só existe na cabeça do usuário | **Perguntar** — no momento em que importa, não antes | `FH-06.02` |
| Errar produz efeito externo, irreversível ou sobre terceiros | **Perguntar** (confirmação explícita) | `FH-07.03` |
| Já há 3 decisões na tarefa dominante | **Decidir** ou adiar a pergunta | `FH-08.02` |

---

## C3 — Escala de autonomia do sistema e da IA

Norma: `FH-18.01`. Escolha o **menor** nível que resolve (`FH-18.02`).

| Nível | O sistema… | Permitido quando | Nunca quando |
| --- | --- | --- | --- |
| 1 — Informar | Mostra algo relevante | Sempre | — |
| 2 — Sugerir | Prepara e deixa pronto para aceitar | Alta confiança; aceitação sempre editável | A sugestão vira ruído por frequência |
| 3 — Agir com desfazer | Executa e oferece reversão imediata | Efeito interno, reversível, sem terceiros | Há efeito externo ou irreversível |
| 4 — Agir com confirmação | Pergunta antes de executar | Efeito externo, irreversível ou de alcance amplo | Ação frequente e reversível (confirmação vira ruído) |
| 5 — Nunca agir | Só o usuário executa | Comunicação com terceiros sem revisão; ampliação de permissão; exclusão definitiva | — |

**Regras transversais:** rastro sempre consultável (`FH-18.03`) • ação automática
sempre perceptível no contexto (`FH-18.07`) • nível 3+ com efeito externo entra
**desligado** (`FH-18.08`) • autonomia **nunca** aumenta por histórico de acerto
(`FH-18.11`) • o que a IA leu, gerou e executou é consultável (`FH-11.06`) •
automatizar repetição exige oferta e consentimento (`FH-06.11`).

---

## C4 — Conflito entre artigos

| # | Pergunta | Se sim → |
| --- | --- | --- |
| 1 | O conflito é real (os valores se excluem) ou falta desenho? | Falta desenho → procure a solução que cumpre ambos (`FH-03.11`) |
| 2 | Toca isolamento de dados, acessibilidade, reversibilidade ou compreensão? | Esses vencem sempre (`FH-03.02`) |
| 3 | Consta da tabela de arbitragens permanentes (§6 do Cap. 3)? | Aplicar a decisão da tabela (`FH-03.09`) |
| 4 | Os artigos são do mesmo livro? | Vence o mais específico (`FH-03.03`) |
| 5 | São de livros diferentes? | I → II → V → III → VI → IV → VII → VIII (`FH-03.01`) |
| 6 | Ainda empatado? | Vence o reversível (`FH-03.04`) |
| 7 | Nada resolveu? | Emenda com prazo; até lá, o reversível (`FH-03.10`) |

**Nunca desempatam:** prazo, urgência, tamanho do cliente, senioridade
(`FH-03.07`).

---

## C5 — Classificar uma recusa

| A proposta… | Classificação | Consequência |
| --- | --- | --- |
| Contraria identidade, princípio ou fronteira permanente | **Nunca** | Só volta por emenda (`FH-12.04`) |
| É compatível, mas prematura, dependente ou de baixa prioridade | **Não agora** | Continua válida; registrar condição de reabertura |
| Serve a um único cliente | **Nunca** | `FH-12.05` |
| Só se justifica por paridade ou volume de pedidos | **Nunca** nessa forma | Extrair o problema e reavaliar (`FH-12.02`) |

Toda recusa: registrada com motivo (`FH-12.03`) e comunicada com o critério
(`FH-12.10`).

---

## C6 — Expressividade por momento do usuário

| Momento | Expressividade | O que fazer | Artigo |
| --- | --- | --- | --- |
| Erro, falha, perda, cobrança, limite, permissão negada | **Mínima** | Uma linha: o que houve + como resolver. Sem ilustração, sem humor, sem desculpa | `FH-09.02`, `FH-09.05`, `FH-09.07` |
| Trabalho rotineiro | **Nenhuma** | Resultado visível, sem mensagem | `FH-07.07` |
| Conclusão de tarefa trivial | **Nenhuma** | Nunca celebrar | `FH-09.04` |
| Conquista real e rara | **Discreta** | Reconhecimento breve, uma vez | `FH-09.04` |
| Estado vazio, primeiro uso | **Leve** | Leveza permitida; sem tutela | `FH-09.10` |

---

## C7 — Esconder, revelar ou remover

| Situação | Decisão | Artigo |
| --- | --- | --- |
| Elemento não informa decisão, não permite ação, não revela estado | **Remover** | `FH-08.06` |
| Capacidade usada por poucos, mas real | **Esconder** com descoberta no ponto de uso, a 1 nível | `FH-08.04`, `FH-08.05` |
| Capacidade sem uso e sem propósito | **Depreciar** por decisão registrada | `FH-12.09` |
| Informação sobre o estado do sistema | **Nunca esconder** | `FH-08.07` |
| Tela cheia demais | **Priorizar antes de dividir** — abas não substituem decisão | `FH-08.10` |
| Usuário se confundiu | **Remover / agrupar / decidir** antes de adicionar qualquer coisa | `FH-08.11`, `FH-06.08` |

---

## C8 — Falta regra: o que fazer

| # | Etapa | Ação |
| --- | --- | --- |
| 1 | Analogia | Existe artigo para caso estruturalmente equivalente? Aplique e registre a analogia |
| 2 | Hierarquia | Princípio mais específico → Livro I → Capítulo 7 |
| 3 | Reversível | Entre soluções defensáveis, escolha aquela da qual o usuário volta |
| 4 | Não inventar | **Proibido** criar padrão inédito. Reutilizar imperfeitamente > fraturar o produto |
| 5 | Registrar | Lacuna no Anexo E: caso, artigo que faltou, decisão, etapa aplicada |

Base: §0.11 do Volume 0, `FH-02.08`, `FH-68.05`, `FH-68.09`.
**Terceira ocorrência da mesma lacuna → emenda obrigatória** (`FH-02.10`).

---

## C9 — Dado: derivar, perguntar ou não coletar

| Pergunta | Se sim → |
| --- | --- |
| O sistema pode derivar do trabalho real? | **Derivar.** Perguntar é violação (`FH-06.02`) |
| Tem finalidade declarada e atual? | Se não: **não coletar** (`FH-11.04`) |
| É dado de terceiro (contato do cliente)? | Mesma proteção do dado do usuário (`FH-11.05`) |
| Vai para provedor externo, log ou modelo? | Exige finalidade, base legal e prazo declarados (`FH-11.11`) |
| É inferido? | Exibir como distinguível de dado confirmado (`FH-06.10`) |

---

## C10 — Checagem rápida das sete promessas

Antes de entregar qualquer fluxo, responda sete vezes "sim":

| # | Promessa | Pergunta |
| --- | --- | --- |
| 1 | Preservação | O que o usuário digitou sobrevive a erro, navegação e falha de rede? |
| 2 | Reversibilidade | Toda ação é desfazível ou foi confirmada? |
| 3 | Não-surpresa | Nenhum efeito externo sem autorização específica? |
| 4 | Veracidade | Falha parcial aparece como falha parcial? |
| 5 | Continuidade | Ao voltar, o contexto é o mesmo (posição, filtro, seleção, rascunho)? |
| 6 | Isolamento | Nada revela existência ou conteúdo de outra conta — nem por contagem ou erro? |
| 7 | Saída | Exportar e encerrar sem obstáculo? |

Um "não" = quebra de promessa = **incidente** (`FH-10.08`), não defeito comum.

---

## C11 — Consentimento e destinatário

| Situação | Regra | Artigo |
| --- | --- | --- |
| Conceder × retirar consentimento | Retirar custa **igual ou menos** | `FH-11.02` |
| Destinatário recusou receber | Global, imediato, permanente, irreversível pelo remetente | `FH-11.03` |
| Recusa × nova importação de lista | A recusa prevalece | `FH-11.03` |
| Eficiência de envio × controle de quem recebe | Vence o destinatário | `FH-11.10` |
| Opção de recusa menos visível que a de aceite | Padrão escuro — proibido | `FH-11.01` |
| Métrica individual da equipe | Coordenar sim, julgar não | `FH-11.07` |

---

## C12 — Conflito entre arquétipos

| Contexto da decisão | Arquétipo que decide | Artigo |
| --- | --- | --- |
| Tarefa executada diariamente | **Operador** | `FH-13.02`, `FH-13.04` |
| Diagnóstico e acompanhamento | Gestor | `FH-13.03` |
| Construção de automação/processo | Construtor | `FH-13.08` |
| Conta, custo, permissão, risco | Responsável | `FH-13.03` |
| Tarefa pontual de quem não usa o produto | Visitante | `FH-13.07` |

**Teto obrigatório:** qualquer que seja o arquétipo primário, a tela precisa ser
utilizável pelo arquétipo de **menor familiaridade com acesso legítimo**
(`FH-13.09`). **Nunca:** criar modo ou versão separada por arquétipo
(`FH-13.05`); usar papel de permissão como proxy de necessidade (`FH-13.06`).

---

## C13 — Posso mudar isto de lugar (ou de comportamento)?

| Pergunta | Se sim → |
| --- | --- |
| É uma ação de uso frequente? | Só muda por emenda ao padrão **e** com comunicação prévia (`FH-16.02`, `FH-16.09`) |
| A posição atual viola a Constituição (ex.: destrutivo ao lado de frequente)? | Corrigir é obrigatório; aplicar transição comunicada (`FH-19.03`) |
| É melhoria estética sem violação? | **Não mudar** (`FH-16.02`) |
| A mudança criaria duas formas coexistentes? | Proibido (`FH-05.10`, `FH-16.09`) |
| É correção de defeito que restaura o esperado? | Muda sem rito |

---

## C14 — Custo de um fluxo: como declarar

| Grandeza | Como medir | Limite |
| --- | --- | --- |
| Passos | Contagem de ações até concluir | Não pode crescer no fluxo principal (`FH-06.07`) |
| Decisões simultâneas | Escolhas exigidas na tarefa dominante | ≤ 3 (`FH-08.02`) |
| Blocos de informação | Unidades a interpretar | ≤ 7 (`FH-15.01`) |
| Trocas teclado↔ponteiro | Alternâncias de dispositivo | ≤ 1 em fluxo frequente (`FH-19.06`) |
| Profundidade | Níveis até a capacidade | ≤ 1 (`FH-08.05`) |

Declaração obrigatória em alteração de fluxo frequente: **antes e depois**
(`FH-19.02`).

---

## Matrizes pendentes

As seis matrizes abaixo dependem de capítulos ainda não escritos. Criá-las agora
produziria decisões que os capítulos poderiam contradizer — proibido por
`FH-04.10` (a Constituição nunca contém duas verdades). Até lá, esses casos se
resolvem por **C8 — falta regra**.

| Matriz | Depende de | Onda |
| --- | --- | --- |
| Superfície: página, painel, modal ou inline | Cap. 23 | 4 |
| Confirmar, desfazer ou nada — matriz completa | Cap. 45 | 5 |
| Tipo de feedback e onde aparece | Cap. 43 | 5 |
| Tipo de estado vazio | Cap. 42 | 5 |
| Urgência de notificação | Cap. 40 | 6 |
| Esconder × desabilitar (permissões) | Cap. 51 | 5 |

---

*Anexo C v1.1.0 — atualizado na Onda 3 (Livro II). Atualização obrigatória a cada
capítulo que produza nova escolha recorrente (`FH-04.08`).*
