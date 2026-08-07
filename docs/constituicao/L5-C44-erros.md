# Capítulo 44 — Erros: Prevenção, Tratamento e Recuperação

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 10, 17, 41, 43 |
| É pré-requisito de | Capítulos 45, 49, 51, 54, 58 |
| Artigos | `FH-44.01` a `FH-44.11` |

---

## 0. Núcleo Normativo

**`FH-44.01`** — **Prevenção antes de mensagem.** Diante de um erro possível, a
primeira solução considerada **DEVE** ser impedir que ele ocorra. Escrever a
mensagem é a última alternativa, não a primeira.
> **Verificação:** a prevenção foi considerada e descartada por escrito antes de se optar pela mensagem? → SIM = cumpre | NÃO = viola.

**`FH-44.02`** — Toda mensagem de erro **DEVE** conter quatro elementos: **o que
aconteceu**, **por que**, **o que fazer agora** e **como sair**.
> **Verificação:** os quatro elementos estão presentes? → SIM = cumpre | NÃO = viola.

**`FH-44.03`** — O erro **DEVE** aparecer no ponto onde pode ser corrigido, e não em
área genérica distante (`FH-43.02`).
> **Verificação:** a mensagem aparece onde a correção acontece? → SIM = cumpre | NÃO = viola.

**`FH-44.04`** — A validação ocorre **no momento certo**: nunca enquanto o usuário
ainda digita um campo, nunca apenas no envio final. O critério é validar quando o
usuário conclui aquela unidade de entrada.
> **Verificação:** a validação ocorre ao concluir a unidade de entrada, e não durante nem só no final? → SIM = cumpre | NÃO = viola.

**`FH-44.05`** — **Preservação absoluta.** Nenhum erro **PODE** destruir, limpar ou
tornar inacessível o conteúdo produzido pelo usuário (`FH-10.01`).
> **Verificação:** após o erro, todo o conteúdo digitado continua presente e editável? → SIM = cumpre | NÃO = viola.

**`FH-44.06`** — Mensagens de erro **NUNCA** culpam o usuário (`FH-17.04`) e
**NUNCA** expõem detalhe interno: código técnico, nome de tabela, caminho, rastro
de execução ou mensagem de biblioteca.
> **Verificação:** a mensagem culpa o usuário ou expõe detalhe interno? → NÃO = cumpre | SIM = viola.

**`FH-44.07`** — **Erro sem saída é proibido.** Toda mensagem **DEVE** oferecer pelo
menos um caminho: repetir, corrigir, contornar ou voltar.
> **Verificação:** existe ao menos um caminho de saída oferecido? → SIM = cumpre | NÃO = viola.

**`FH-44.08`** — Em operação sobre vários itens, o erro **DEVE** ser reportado **por
item**, com caminho para reprocessar apenas os que falharam (`FH-41.05`).
> **Verificação:** o relatório identifica cada item que falhou e permite reprocessar só eles? → SIM = cumpre | NÃO = viola.

**`FH-44.09`** — **Erro de permissão nunca é erro de sistema.** É tratado como
estado (`FH-41.08`) e **NUNCA** revela existência, quantidade ou conteúdo do que
está protegido (`FH-10.06`).
> **Verificação:** a resposta distingue "sem permissão" de "não existe" de forma que revele existência? → NÃO = cumpre | SIM = viola.

**`FH-44.10`** — Erro técnico **DEVE** ser traduzido para a linguagem do usuário.
Quando for necessário um identificador para suporte, ele é exibido como
**referência**, com explicação do porquê.
> **Verificação:** a mensagem está na linguagem do usuário, com identificador apenas se necessário e explicado? → SIM = cumpre | NÃO = viola.

**`FH-44.11`** — Erro recorrente é **defeito de desenho**. Repetição do mesmo erro
por usuários diferentes **DEVE** gerar correção de prevenção, não melhoria de
mensagem (`FH-06.08`).
> **Verificação:** erros recorrentes geraram correção de prevenção? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo trata erro como **falha do sistema em prevenir**, não como falha do
usuário. Ele define o que fazer antes, durante e depois — e estabelece que a
mensagem é o último recurso, não o produto do trabalho.

---

## 2. Perguntas que este capítulo responde

- Como impeço o erro antes que aconteça?
- Como escrevo uma mensagem de erro?
- Onde ela aparece? Quando valido?
- O que acontece com o trabalho do usuário quando algo falha?
- O que nunca digo?
- Como trato falha parcial em operação de lote?

---

## 3. Definições

**Prevenção** — mudança de desenho que torna o erro impossível ou improvável.

**Erro de entrada** — dado fornecido que não atende a um requisito.

**Erro de operação** — falha ao executar algo que o usuário pediu.

**Erro de permissão** — ausência de autorização. Estado, não erro (`FH-41.08`).

**Erro de sistema** — falha interna ou de dependência externa.

**Unidade de entrada** — campo ou grupo de campos que forma um dado completo.

---

## 4. Fundamento

**Por que prevenção vem antes.** Toda mensagem de erro é a admissão de que o
sistema permitiu que o usuário chegasse a um beco. Muitos becos são elimináveis por
desenho: desabilitar o que não se aplica, formatar a entrada automaticamente,
oferecer escolha em vez de digitação livre, calcular em vez de perguntar. Cada erro
prevenido economiza a mensagem, a leitura, a correção e a frustração —
permanentemente, para todos os usuários.

**Por que a anatomia tem quatro elementos.** Mensagens de erro falham por
incompletude, não por extensão. "Erro ao salvar" diz o que aconteceu e nada mais: o
usuário não sabe por que, não sabe o que fazer, e não sabe se pode sair sem perder
o trabalho. Os quatro elementos de `FH-44.02` são o mínimo para que a mensagem seja
**acionável** — que é a única razão pela qual ela existe.

**Por que o momento da validação importa tanto.** Validar durante a digitação
acusa erro em texto incompleto — o usuário é interrompido enquanto ainda está
escrevendo, o que é ao mesmo tempo inútil e agressivo. Validar apenas no envio
acumula erros e obriga a percorrer o formulário inteiro para corrigir. O ponto
correto é a conclusão da unidade: o usuário terminou aquele dado, o sistema
verifica, e a correção ainda está no contexto.

**Por que a preservação é absoluta.** Erro que limpa o campo é o pior defeito de
interface que existe: ele pune o engano destruindo o trabalho. É também
completamente evitável, e sua presença sinaliza que ninguém testou o caminho de
falha. `FH-44.05` não admite exceção.

**Por que não expor detalhe interno.** Além de inútil para o usuário — que não pode
agir sobre um código de biblioteca —, o detalhe interno frequentemente revela
estrutura do sistema, e às vezes existência de dados. É simultaneamente falha de
comunicação (`FH-08.08`) e risco de segurança.

**Por que erro de permissão é diferente.** Ele não indica falha alguma: o sistema
está protegendo o que deve proteger. Tratá-lo com linguagem de erro assusta o
usuário e o leva ao suporte. Mais grave: mensagens de erro tendem a ser
específicas, e especificidade aqui revela existência — a violação mais sutil de
`FH-10.06`.

**Por que erro recorrente é defeito de desenho.** Quando muitos usuários cometem o
mesmo erro, a causa não está neles. Melhorar a mensagem trata o sintoma e mantém o
custo — pago por cada usuário, todas as vezes. `FH-44.11` conecta este capítulo a
`FH-06.08`: a resposta correta é redesenhar.

---

## 5. Princípios

**Erro é falha do sistema em prevenir.**

**Mensagem que não é acionável não é mensagem, é aviso de fracasso.**

**Nunca puna o engano destruindo o trabalho.**

**Erro repetido por muitos é defeito de desenho, não de usuário.**

---

## 6. Regras normativas

### Ordem obrigatória de tratamento

| # | Estratégia | Pergunta | Se possível → |
| --- | --- | --- | --- |
| 1 | **Eliminar** | O erro pode ser tornado impossível? | Redesenhe: escolha em vez de digitação, cálculo em vez de pergunta |
| 2 | **Prevenir** | Pode ser tornado improvável? | Formate automaticamente, restrinja, oriente antes |
| 3 | **Detectar cedo** | Pode ser detectado antes do envio? | Valide ao concluir a unidade (`FH-44.04`) |
| 4 | **Tolerar** | Pode ser aceito e corrigido depois? | Aceite e sinalize sem bloquear |
| 5 | **Comunicar** | Nada acima é possível? | Mensagem com os quatro elementos |

Passar direto para a etapa 5 sem registrar as anteriores viola `FH-44.01`.

### Anatomia da mensagem (`FH-44.02`)

| Elemento | Função | Exemplo de conteúdo |
| --- | --- | --- |
| **O que aconteceu** | Situar | "Não foi possível enviar para 8 contatos." |
| **Por que** | Explicar sem jargão | "Eles não têm telefone válido." |
| **O que fazer** | Ação concreta | "Corrigir os telefones" / "Enviar assim mesmo para os demais" |
| **Como sair** | Garantir saída | "Voltar sem enviar — nada foi perdido." |

### `FH-44.04` — Momento da validação

**Certo.** Verificar o formato do telefone quando o usuário sai do campo.

**Errado (cedo demais).** Acusar formato inválido na segunda tecla digitada.

**Errado (tarde demais).** Acumular oito erros e mostrá-los todos ao enviar.

### `FH-44.09` — Permissão sem revelação

**Certo.** "Você não tem acesso a esta área. Solicitar acesso ao responsável."

**Errado.** Distinguir na resposta "não encontrado" de "sem permissão" de forma
que permita descobrir, por tentativa, o que existe.

---

## 7. Anti-padrões

**Mensagem-espelho.** Texto técnico repassado ao usuário.

**Campo limpo.** Erro que apaga o que foi digitado.

**Erro sem porta.** Mensagem sem nenhuma ação possível.

**Validação agressiva.** Acusação durante a digitação.

**Acúmulo final.** Todos os erros revelados só no envio.

**Culpa educada.** "Você preencheu incorretamente."

**Lote opaco.** "Alguns itens falharam", sem dizer quais.

**Mensagem melhorada.** Erro recorrente tratado com texto mais claro em vez de
prevenção.

---

## 8. Impactos

**Cognitivo.** Mensagens acionáveis eliminam a fase de investigação — o usuário
passa direto do problema à correção.

**Emocional.** É o capítulo que mais determina como o usuário se sente no pior
momento (`FH-17.03`). Erro bem tratado preserva a relação; erro mal tratado a
define.

**Produtividade.** Prevenção elimina o ciclo inteiro de erro-leitura-correção,
que é várias vezes mais caro que o acerto na primeira tentativa.

**Percepção de qualidade.** Tratamento de erro é onde a maturidade de um produto
fica mais evidente — e onde a falta dela é mais lembrada.

**Curva de aprendizagem.** Erros preveníveis e mensagens acionáveis permitem
aprender por tentativa sem custo. Erros punitivos produzem evitação de áreas
inteiras.

---

## 9. Riscos e trade-offs

**Risco: excesso de prevenção.** Restringir demais pode impedir usos legítimos.
Mitigação: `FH-06.05` — o sistema acomoda o desvio; prevenção nunca vira bloqueio
de caminho válido.

**Risco: mensagens longas.** Quatro elementos podem gerar texto extenso.
Mitigação: as regras do Capítulo 58 limitam extensão; quatro elementos cabem em
duas frases.

**Risco: ocultar demais.** Não expor detalhe técnico pode dificultar o suporte.
Mitigação: `FH-44.10` prevê identificador de referência quando necessário.

**Trade-off central.** Trocamos esforço de desenho por tranquilidade do usuário.
Prevenir custa mais que avisar — e é pago uma vez, por quem constrói, em vez de
todas as vezes, por quem usa.

---

## 10. Critérios de verificação

1. A prevenção foi considerada antes da mensagem, com registro.
2. Toda mensagem contém os quatro elementos.
3. Todo erro aparece onde a correção acontece.
4. A validação ocorre ao concluir a unidade de entrada.
5. Nenhum erro destrói conteúdo do usuário.
6. Nenhuma mensagem culpa o usuário nem expõe detalhe interno.
7. Toda mensagem oferece ao menos um caminho de saída.
8. Falhas em lote são reportadas por item, com reprocessamento seletivo.
9. Erros de permissão não revelam existência.
10. Erros técnicos são traduzidos; identificadores só quando necessários.
11. Erros recorrentes geraram correção de prevenção.

---

## 11. Checklist do capítulo

- [ ] Tentei eliminar, prevenir, detectar cedo e tolerar antes de comunicar.
- [ ] A mensagem diz o que houve, por quê, o que fazer e como sair.
- [ ] A mensagem aparece onde a correção acontece.
- [ ] Validei no momento certo, nem antes nem só no envio.
- [ ] Testei o caminho de falha: nada digitado se perdeu.
- [ ] Não culpei ninguém e não expus detalhe interno.
- [ ] Há saída.
- [ ] Em lote, sei exatamente o que falhou e reprocesso só isso.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (`FH-09.02`, `FH-09.07`), 10 (`FH-10.01`), 17
(`FH-17.03`, `FH-17.04`), 41 (estados), 43 (feedback).

**É pré-requisito de.** Capítulos 45 (confirmações), 49 (lote), 51 (permissões), 54
(automações), 58 (microcopy).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Textos de erro | Chave `errors` em `src/i18n/messages/pt-BR.json` |
| Erros de rota | `error.tsx`, `not-found.tsx` em `src/app/` |
| Respostas de API | Rotas em `src/app/api/` (padrão de try/catch e códigos) |
| Validação de entrada | `src/lib/validation/` |
| Falha parcial em lote | `src/lib/broadcast-status.ts`, destinatários de disparo |
| Erros de permissão | Guards de rota, RLS em `supabase/migrations/` |
| Observabilidade | `sentry.client.config.ts`, `sentry.server.config.ts` |
