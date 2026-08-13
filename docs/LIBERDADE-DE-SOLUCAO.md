# FlowHub — Liberdade de Solução

> **Preservar a intenção, as regras e as garantias do produto. Não preservar,
> necessariamente, os fluxos, telas ou estruturas atuais.**

| Campo | Valor |
| --- | --- |
| Origem | Direcional para Evolução e Reinvenção da Experiência do FlowHub |
| Versão | 1.0 |
| Natureza | **Carta de intenção.** Não cria regra, não é citável como fundamento |
| Autoridade | Nenhuma sobre conflitos entre artigos. Toda exigibilidade continua vivendo na Constituição |
| Governa | **Quanta liberdade criativa existe** ao evoluir, redesenhar ou reconstruir qualquer parte do FlowHub |
| Alcance | Tudo que for construído para o FlowHub, dentro e fora do produto (`FH-01.02`) |
| Ordem de leitura | Junto com `docs/PRINCIPIO-FUNDADOR.md`, antes de qualquer trabalho de evolução ou reinvenção |

---

## Como este documento é usado

Este documento existe para uma falha específica de quem — pessoa ou agente —
evolui um produto com documentação extensa: tratar a implementação atual, ou a
própria documentação, como o limite da criatividade. Documentação descreve o
que não pode ser comprometido. Ela não deveria descrever, e nunca deve ser lida
como descrevendo, a única forma válida de chegar lá.

| Momento | O que fazer com este documento |
| --- | --- |
| **Antes** de evoluir, redesenhar ou reconstruir qualquer parte do produto | Leia. Ele autoriza explicitamente questionar a solução atual |
| **Durante** | Use as perguntas de liberdade com responsabilidade (§4) antes de propor uma reconstrução |
| **Ao verificar se algo pode ser feito** | Use a Constituição (`docs/constituicao/`) — este documento nunca decide o que é permitido, apenas quanta forma é livre |
| **Ao justificar** (Bloco de Conformidade, RFC de experiência) | Cite os artigos que sustentam a decisão, nunca este documento como fundamento |

**Regra de conflito.** Este documento nunca vence um artigo `DEVE` ou `NUNCA`.
Se uma reinvenção parecer exigir violar um desses, a regra de parada de
`FH-68.03` continua valendo integralmente: interromper, sinalizar, propor a
alternativa conforme, aguardar decisão humana. Liberdade de solução é liberdade
sobre a **forma**, nunca sobre a **garantia**.

---

## Onde este documento se encaixa

```
PRINCÍPIO FUNDADOR  (docs/PRINCIPIO-FUNDADOR.md)   → a intenção. Por que existimos
        │
        ↓
CONSTITUIÇÃO DO PRODUTO (docs/constituicao/)       → o que construir e por quê. Exigível
        │                                             Artigos FH-XX.NN com verificação
        │
        ├──→ LIBERDADE DE SOLUÇÃO (este documento)  → quanta liberdade existe sobre COMO
        │                                             chegar ao resultado exigido acima
        │
        ↓
DIREÇÃO ARTÍSTICA (docs/direcao-criativa/)         → como a página se parece
        │
        ↓
AGENTS.md                                          → como implementar neste repositório
```

Este documento não está entre a Constituição e a Direção Artística por acaso:
ele se aplica **depois** de saber o que é obrigatório e **antes** de decidir a
forma concreta. Os mapas de evolução em `docs/evolucao-experiencia/` são onde
essa liberdade, exercida, vira proposta registrada.

Obrigação legal (`docs/legal/`, `docs/business-rules/`) continua vencendo tudo.

---

# O princípio

Este documento não pede para melhorar visualmente a interface atual. Pede para
compreender o que o FlowHub precisa entregar e determinar como essa entrega
deveria funcionar — mesmo que o resultado seja uma estrutura completamente
diferente da que existe hoje.

A implementação atual é **contexto para compreensão**, nunca **autoridade sobre
a experiência**. Código existente, componentes existentes e fluxos existentes
ajudam a entender como o sistema funciona hoje. Eles não respondem como o
sistema deveria funcionar.

A pergunta que orienta qualquer evolução não é:

> "Como fazemos essa mudança mantendo o fluxo atual?"

É:

> **"Qual é a melhor experiência para o usuário atingir esse objetivo,
> considerando as capacidades, restrições e princípios do FlowHub?"**

---

## O que precisa ser preservado

A documentação existente é a fonte de verdade para o que não pode ser
comprometido. Isso inclui, quando aplicável:

- regras de negócio;
- segurança, permissões e controle de acesso;
- isolamento multi-tenant (`account_id`, RLS);
- privacidade, LGPD e demais requisitos legais;
- integridade dos dados e consistência transacional;
- contratos de API, eventos e integrações externas;
- requisitos de auditoria;
- invariantes de domínio e arquitetura sem efeito perceptível cuja alteração
  exigiria decisão fora do escopo de UX (`FH-01.07`).

Essas são **guardrails**, não instruções para preservar a interface atual.
Preservar o comportamento de negócio nunca significa preservar a tela, o
número de etapas ou a sequência de navegação que hoje o entrega.

## O que pode ser reinventado

A experiência tem liberdade muito maior que o guardrail sugere à primeira
vista. Podem ser questionados, quando isso produzir um resultado melhor:

- a estrutura das telas e a arquitetura da informação;
- a quantidade de etapas e a ordem das ações;
- a navegação e a relação entre áreas do produto;
- a forma de criação e edição de qualquer entidade;
- como estados, erros e confirmações são apresentados;
- quanta informação aparece simultaneamente;
- os padrões de interação e os componentes utilizados;
- o fluxo completo de uma operação, do início ao fim.

Se um fluxo atual é excessivamente complexo, a primeira pergunta não é "como
organizamos melhor essa complexidade" — é **"essa complexidade precisa existir
dessa forma?"**

---

## Continuidade não é qualidade

Um processo funcionar hoje não é evidência de que seu fluxo é a melhor
experiência possível — é evidência de como o sistema funciona hoje. Tratar o
comportamento atual como requisito de UX é o erro mais comum ao evoluir um
produto com documentação madura: a documentação vira desculpa para não
questionar.

Consequências concretas dessa distinção:

- uma operação hoje concentrada em uma tela pode ser dividida em etapas, se
  isso reduzir carga cognitiva;
- etapas hoje fragmentadas podem ser consolidadas, se a fragmentação atual for
  fricção sem propósito;
- informação hoje exibida cedo demais pode ser adiada;
- uma decisão hoje manual pode ser automatizada, contextualizada ou removida;
- um conceito técnico hoje exposto ao usuário pode ser escondido atrás da
  interface, sem perder capacidade (`FH-08.01`).

---

## Pensar em resultado, não em tela

A ordem de raciocínio correta não começa em "como redesenhamos esta tela".
Começa em:

1. O que o usuário está tentando realizar?
2. Qual seria a maneira mais natural de permitir que ele consiga isso, dado
   tudo o que o FlowHub já sabe sobre ele e sobre a operação?
3. Só então: quais telas, etapas, componentes e interações essa maneira exige?

A estrutura resultante pode ser inteiramente diferente da atual. Isso é
esperado, não um risco a ser evitado.

## Complexidade progressiva

O FlowHub atende operações que podem ficar complexas. A interface não deve
despejar essa complexidade de uma vez. Quando uma tarefa envolve muitas
decisões, considerar `progressive disclosure`, etapas, contexto,
recomendações, automações e agrupamento lógico — a complexidade aparece quando
é necessária, não porque o sistema já possui aquela informação
(`FH-08.01`, `FH-15`).

---

# Método: três leituras de qualquer fluxo relevante

Antes de propor mudança em um fluxo importante, considerar explicitamente três
leituras — a terceira é a que mais frequentemente falta:

1. **Como funciona hoje.** Levantamento honesto, sem julgamento.
2. **Como melhora mantendo a estrutura geral.** O caminho incremental.
3. **Como funcionaria reconstruído do zero**, sabendo o que se sabe hoje sobre
   o FlowHub e seus usuários, sem a implementação atual como restrição.

A terceira leitura não é a resposta obrigatória — é a comparação obrigatória.
Uma proposta que nunca chegou a considerá-la não decidiu manter o fluxo atual;
apenas não olhou para a alternativa.

Este método se registra como **RFC de experiência** (modelo D2,
`docs/constituicao/ANEXO-D-modelos.md`) — no campo "Alternativas descartadas",
as três leituras e por que a escolhida venceu as outras duas. Para trabalho de
reinvenção mais amplo que uma tela isolada, o formato estendido é um **Mapa de
Evolução de Experiência** (`docs/evolucao-experiencia/00-INDICE.md`).

---

# Liberdade com responsabilidade

Liberdade de solução não é ausência de critério. Toda mudança estrutural
proposta deve conseguir responder:

1. Qual problema da experiência atual está sendo resolvido?
2. Qual resultado o usuário precisa alcançar?
3. Por que a nova abordagem é melhor que a atual e melhor que uma melhoria
   incremental dela?
4. Quais invariantes do sistema (§ "O que precisa ser preservado") precisam
   ser preservadas, e como a proposta as preserva?
5. Quais impactos técnicos a mudança implica?
6. Quais impactos existem sobre segurança, dados, tenancy e integrações?
7. Como a solução pode evoluir depois, sem exigir nova reconstrução completa?

Uma proposta que não responde a essas sete perguntas não está exercendo
liberdade — está pulando a análise que a liberdade pressupõe.

## O produto como um todo

Uma alteração não se analisa isolada na tela em que será implementada.
Considerar também: o que vem antes e depois do fluxo; navegação relacionada;
estados vazios, de carregamento e de erro; permissões; notificações;
responsividade; acessibilidade; consistência com outros módulos; impacto sobre
processos vizinhos. Uma boa solução pode exigir mudança além do ponto
inicialmente pedido — isso é aceitável quando necessário para coerência, e deve
ser declarado explicitamente, nunca implementado silenciosamente
(`FH-68.10` continua se aplicando: escopo ampliado se relata e se confirma,
não se implementa por conta própria sem alinhamento).

---

# Critério de decisão

Quando houver conflito entre preservar a experiência atual e propor uma
experiência significativamente melhor, prioriza-se a experiência melhor.
Quando houver conflito entre uma experiência melhor e uma garantia do sistema,
a ordem de prioridade é:

1. Segurança e conformidade legal.
2. Integridade de dados e regras de negócio.
3. Contratos e invariantes do sistema (APIs, integrações, tenancy).
4. Objetivo funcional da evolução.
5. Experiência do usuário.
6. Coerência arquitetural.
7. Manutenibilidade.
8. Compatibilidade com a implementação existente.

A implementação existente ocupa a última posição — abaixo dos princípios e
objetivos que justificam sua própria existência, nunca acima deles.

---

# Regra para agentes

Ao receber um pedido de evolução, alteração ou "melhoria" de qualquer parte do
FlowHub — não apenas quando o pedido usa a palavra "reinventar" — interpretar a
implementação atual como ponto de partida para compreensão, não como limite
criativo. Isso vale mesmo para pedidos pequenos: a pergunta "isso deveria
continuar sendo três telas?" cabe em uma alteração pontual tanto quanto em uma
reconstrução completa de área.

Se uma solução diferente da atual produzir uma experiência substancialmente
melhor e continuar respeitando as invariantes técnicas, de negócio, segurança
e conformidade — ela é uma opção válida a propor, mesmo que exija reconstruir
partes significativas da implementação existente. Propor não é implementar sem
alinhamento: mudanças de escopo maior que o pedido se declaram e se confirmam
antes de codar, na mesma lógica de `FH-68.10` e do protocolo de agentes
(`docs/constituicao/L8-C68-protocolo-para-agentes.md`).

O FlowHub deve evoluir a experiência, não apenas modificar a implementação.

---

# Objetivo final

O objetivo não é fazer o FlowHub parecer uma versão mais bonita do produto
atual. É fazer o FlowHub parecer uma versão mais madura do produto que ele
pode se tornar.

Não preservar o fluxo por ser familiar. Não mudar o fluxo apenas por ser
diferente. Mudá-lo quando existir uma experiência melhor — e existir uma
experiência melhor é algo que só se descobre perguntando, a cada fluxo
relevante, como ele seria se estivéssemos construindo hoje.

A documentação técnica estabelece os limites. A visão de produto estabelece o
destino. A responsabilidade de quem constrói — pessoa ou agente — é descobrir
o melhor caminho entre os dois.
