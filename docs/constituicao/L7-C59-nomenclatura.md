# Capítulo 59 — Nomenclatura e Vocabulário Canônico

| Campo | Valor |
| --- | --- |
| Livro | VII — Linguagem |
| Versão | 1.1.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 20, 21, 22, 57, 58 |
| É pré-requisito de | Capítulo 60, Anexo A |
| Artigos | `FH-59.01` a `FH-59.11` |

---

## 0. Núcleo Normativo

**`FH-59.01`** — O **Anexo A** é o dicionário controlado do produto e a fonte única
de nomes. Termo fora dele não é usado.
> **Verificação:** todo termo usado consta do Anexo A? → SIM = cumpre | NÃO = viola.

**`FH-59.02`** — **Um conceito, um termo.** Sinônimos para o mesmo conceito são
proibidos em qualquer camada (`FH-05.10`, `FH-21.02`).
> **Verificação:** este conceito é chamado por mais de um termo em algum lugar? → NÃO = cumpre | SIM = viola.

**`FH-59.03`** — Termos **proibidos** são declarados no Anexo A, com o motivo e o
termo correto que os substitui.
> **Verificação:** algum termo proibido aparece? → NÃO = cumpre | SIM = viola.

**`FH-59.04`** — Introduzir termo novo exige **registro no Anexo A** com definição,
motivo e alternativas descartadas.
> **Verificação:** o termo novo foi registrado antes do uso? → SIM = cumpre | NÃO = viola.

**`FH-59.05`** — Renomear exige **transição comunicada** e atualização simultânea de
todas as camadas (`FH-16.09`, `FH-21.09`). Coexistência permanente é proibida.
> **Verificação:** a renomeação atualizou todas as camadas e foi comunicada? → SIM = cumpre | NÃO = viola.

**`FH-59.06`** — O termo é o mesmo em **interface, código, banco, documentação e
suporte**, respeitado o par canônico de idiomas (`FH-21.02`).
> **Verificação:** o termo é consistente em todas as camadas? → SIM = cumpre | NÃO = viola.

**`FH-59.07`** — Termos criados pelo usuário — etiquetas, campos, funis, etapas —
**NUNCA** são normalizados, corrigidos ou reinterpretados pelo sistema
(`FH-58.11`).
> **Verificação:** algum termo do usuário é alterado pelo sistema? → NÃO = cumpre | SIM = viola.

**`FH-59.08`** — O nome descreve **o que a coisa é para o usuário**, não como ela é
implementada (`FH-08.08`).
> **Verificação:** o nome faz sentido para quem não conhece a implementação? → SIM = cumpre | NÃO = viola.

**`FH-59.09`** — Siglas e abreviações **NUNCA** aparecem sem estarem definidas no
Anexo A e explicadas no primeiro uso em cada contexto.
> **Verificação:** toda sigla usada está definida e explicada? → SIM = cumpre | NÃO = viola.

**`FH-59.10`** — Nome de canal, provedor ou tecnologia aparece **apenas onde é a
informação**, nunca como nome de conceito, entidade ou seção (`FH-05.06`).
> **Verificação:** algum nome de canal ou tecnologia nomeia conceito ou seção? → NÃO = cumpre | SIM = viola.

**`FH-59.11`** — Termos de **tecnologia, arquitetura, segurança e conformidade** —
e suas siglas — **NUNCA** aparecem em comunicação destinada ao usuário final sem
justificativa explícita registrada. Na documentação técnica são livres; como
argumento, título, cartão, dica ou benefício, são proibidos (`FH-57.11`,
`FH-59.09`). A lista vive no Anexo A, §6.
> **Verificação:** algum termo técnico, de fornecedor ou de conformidade aparece em texto de usuário sem justificativa registrada? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo garante que **cada conceito tenha um nome**, em toda a interface, em
todo o código, para sempre. Ele é a condição prática de existência do modelo mental
do Capítulo 20 — um modelo com vocabulário instável não é aprendível.

---

## 2. Perguntas que este capítulo responde

- Como nomeio algo novo?
- Como resolvo dois nomes para a mesma coisa?
- Como renomeio sem quebrar o modelo mental do usuário?
- Nome de interface pode diferir do nome de código?
- Posso usar sigla?

---

## 3. Definições

**Dicionário controlado** — conjunto fechado de termos permitidos (Anexo A).

**Termo canônico** — o único nome admitido para um conceito.

**Termo proibido** — sinônimo banido, com substituto declarado.

**Par canônico** — dupla interface (pt-BR) / código (inglês) de uma entidade
(`FH-21.02`).

**Termo do usuário** — nome criado por ele dentro do produto.

---

## 4. Fundamento

**Por que vocabulário é infraestrutura.** O nome é a interface do conceito: se ele
muda, o usuário acredita estar diante de outra coisa. Um produto com sinônimos
espalhados obriga cada pessoa a manter um mapa de tradução mental — e esse mapa não
é transmissível, o que impede que usuários se ajudem entre si e torna o suporte
mais caro.

**Por que o dicionário é controlado.** Nomes surgem naturalmente durante a
construção: alguém precisa chamar algo de alguma coisa e escolhe rápido. Sem um
registro obrigatório, o produto acumula termos criados em contextos diferentes,
todos plausíveis, todos divergentes. O custo aparece anos depois, quando renomear
já é caro.

**Por que termos proibidos são declarados.** Saber o que **não** usar é tão
importante quanto saber o que usar — especialmente quando o termo proibido é o mais
óbvio, herdado de outras categorias de software. Sem a lista, ele reaparece a cada
nova pessoa que chega (`FH-05.03`).

**Por que renomear exige transição.** O nome antigo está na memória do usuário, na
documentação dele, nos processos internos da empresa dele e na comunicação da
equipe. Trocar em silêncio quebra tudo isso de uma vez. E manter os dois nomes
"para não incomodar" cria duas verdades — o que `FH-05.10` proíbe.

**Por que termos do usuário são intocáveis.** Uma etiqueta escrita em maiúsculas
pode significar urgência para aquela equipe; um funil com nome próprio carrega
convenções internas. Normalizar é apagar informação que o sistema não entende — e a
decisão de nomear pertence a quem opera.

**Por que o nome não descreve a implementação.** Nomes técnicos vazam a arquitetura
para a interface, violando P1, e envelhecem junto com a tecnologia. Um nome
centrado no significado para o usuário sobrevive a reescritas inteiras do sistema.

---

## 5. Princípios

**O nome é a interface do conceito.**

**Saber o que não dizer vale tanto quanto saber o que dizer.**

**Renomear é caro — e quem paga é o usuário.**

**O vocabulário do usuário pertence ao usuário.**

---

## 6. Regras normativas

### Ciclo de um termo

| Etapa | Obrigação | Artigo |
| --- | --- | --- |
| Proposta | Definição, motivo e alternativas descartadas | `FH-59.04` |
| Registro | Entrada no Anexo A, com par canônico | `FH-59.01`, `FH-21.02` |
| Uso | Idêntico em todas as camadas | `FH-59.06` |
| Renomeação | Transição comunicada, atualização simultânea | `FH-59.05` |
| Banimento | Termo antigo vira proibido, com substituto | `FH-59.03` |

### `FH-59.08` — Nome pelo significado

| Errado (implementação) | Certo (significado) |
| --- | --- |
| Nome derivado da estrutura de dados | Nome do objeto no mundo do usuário |
| Nome derivado do serviço que o produz | Nome do resultado que ele obtém |
| Nome derivado do provedor externo | Nome da capacidade, com o canal como atributo |

### `FH-59.09` — Siglas

**Certo.** Sigla registrada no Anexo A, com a forma completa no primeiro uso de
cada contexto.

**Errado.** Sigla interna da equipe aparecendo na interface — o usuário não
participa das conversas em que ela foi criada.

---

## 7. Anti-padrões

**Sinônimo por área.** O mesmo conceito com nomes diferentes por domínio.

**Termo herdado.** Vocabulário importado de outra categoria de software sem exame
(`FH-05.03`).

**Nome de implementação.** Termo que descreve como funciona, não o que é.

**Renomeação parcial.** Nome novo na interface, antigo no restante.

**Convivência eterna.** Dois nomes válidos ao mesmo tempo.

**Sigla interna.** Abreviação da equipe exposta ao usuário.

**Normalização de etiqueta.** Sistema "corrigindo" termos criados pelo usuário.

**Canal como conceito.** Nome de provedor nomeando seção ou entidade.

---

## 8. Impactos

**Cognitivo.** Vocabulário único elimina a tradução mental permanente entre o que o
usuário vê e o que ele entende — a carga extrínseca mais persistente do produto.

**Emocional.** Termos consistentes produzem a sensação de um sistema coerente;
sinônimos geram a suspeita de dados duplicados em algum lugar.

**Produtividade.** O maior ganho é para suporte e equipe: quando usuário, atendente
e engenheiro usam a mesma palavra, o tempo de resolução cai drasticamente.

**Percepção de qualidade.** Inconsistência de nomenclatura é notada rapidamente por
avaliadores experientes e interpretada como falta de cuidado.

**Curva de aprendizagem.** Cada sinônimo é um conceito extra a aprender. Um
vocabulário enxuto é o que permite aprender o produto explorando.

---

## 9. Riscos e trade-offs

**Risco: burocracia de registro.** Exigir entrada no Anexo A antes do uso adiça
atrito. Mitigação: a entrada é curta, e o custo de não tê-la é renomeação futura.

**Risco: nomes imperfeitos congelados.** Um termo ruim registrado é difícil de
mudar. Mitigação: `FH-59.05` prevê renomeação com transição — cara, mas possível.

**Risco: rigidez com o vocabulário do usuário.** Não normalizar produz variação nos
dados dele. Trade-off assumido: a variação é informação dele, não ruído nosso.

**Trade-off central.** Trocamos liberdade de nomeação por estabilidade de
significado. Nomear rápido é fácil; renomear é caro e cobrado do usuário.

---

## 10. Critérios de verificação

1. Todo termo usado consta do Anexo A.
2. Nenhum conceito tem mais de um termo.
3. Nenhum termo proibido aparece.
4. Todo termo novo foi registrado antes do uso.
5. Toda renomeação foi comunicada e aplicada em todas as camadas.
6. O termo é consistente entre interface, código, banco, documentação e suporte.
7. Nenhum termo do usuário é alterado pelo sistema.
8. Todo nome descreve significado, não implementação.
9. Toda sigla está definida e explicada no primeiro uso.
10. Nenhum nome de canal ou tecnologia nomeia conceito ou seção.

---

## 11. Checklist do capítulo

- [ ] Consultei o Anexo A antes de nomear.
- [ ] O conceito tem um único termo, em todas as camadas.
- [ ] Não usei nenhum termo da lista de proibidos.
- [ ] Se criei termo novo, registrei com definição e motivo.
- [ ] Se renomeei, atualizei tudo e comuniquei.
- [ ] O nome faz sentido para quem não conhece o código.
- [ ] Nenhuma sigla apareceu sem definição.
- [ ] Nada que o usuário nomeou foi alterado.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5 (`FH-05.06`, `FH-05.10`), 20 (modelo), 21 (ontologia),
22 (nomes de seção), 57–58 (linguagem).

**É pré-requisito de.** Capítulo 60 (i18n) e Anexo A (glossário canônico).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Dicionário canônico | `docs/constituicao/ANEXO-A-glossario.md` |
| Termos de interface | `src/i18n/messages/pt-BR.json` |
| Termos de código | `src/types/index.ts` |
| Termos de banco | `supabase/migrations/` |
| Termos do usuário | Etiquetas, campos personalizados, funis e etapas |

---

## 14. Histórico de emendas

### v1.1.0 — Característica não é mensagem

Emenda **MENOR** em cadeia (`FH-04.10`), derivada da emenda v1.1.0 do Capítulo 57,
onde está o registro completo dos seis itens de `FH-04.02`.

`FH-59.11` estende `FH-59.09` (siglas) e `FH-59.10` (nome de tecnologia) da
**interface** para **toda comunicação ao usuário final**, e transfere o ônus:
antes bastava definir a sigla; agora é preciso justificar sua presença. Anexo A §6
atualizado no mesmo ciclo (`FH-04.08`).
