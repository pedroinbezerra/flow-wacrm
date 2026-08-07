# Capítulo 51 — Permissões, Papéis e Limites Visíveis

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 11, 13, 17, 27, 41, 42, 44 |
| É pré-requisito de | Capítulos 54, 56, 62 |
| Artigos | `FH-51.01` a `FH-51.10` |

---

## 0. Núcleo Normativo

**`FH-51.01`** — Toda recusa **DEVE** informar **o motivo** e **o caminho**: por que
não é possível e o que fazer para que seja.
> **Verificação:** a recusa informa motivo e caminho? → SIM = cumpre | NÃO = viola.

**`FH-51.02`** — A escolha entre **esconder** e **desabilitar** segue critério
objetivo (§6), nunca preferência: esconde-se o que não existe para aquele usuário;
desabilita-se o que existe e está temporariamente indisponível.
> **Verificação:** a escolha corresponde ao critério objetivo? → SIM = cumpre | NÃO = viola.

**`FH-51.03`** — Nenhuma recusa, mensagem, contagem ou rótulo **PODE** revelar
existência, quantidade ou conteúdo do que está protegido (`FH-10.06`,
`FH-44.09`).
> **Verificação:** é possível inferir o que existe do outro lado da recusa? → NÃO = cumpre | SIM = viola.

**`FH-51.04`** — Limites de plano, cota e capacidade **DEVEM** ser comunicados
**antes** de serem atingidos, com antecedência que permita agir (`FH-27.06`).
> **Verificação:** o usuário foi avisado antes de atingir o limite, com tempo de agir? → SIM = cumpre | NÃO = viola.

**`FH-51.05`** — Toda recusa por permissão **DEVE** oferecer caminho de solicitação
de acesso **sem sair do fluxo** (`FH-15.06`).
> **Verificação:** existe caminho de solicitação no próprio ponto da recusa? → SIM = cumpre | NÃO = viola.

**`FH-51.06`** — Papel **NUNCA** altera o modelo mental, a navegação nem a posição
das ações. Ele altera apenas o que é acessível (`FH-13.06`, `FH-27.03`).
> **Verificação:** o papel muda estrutura, navegação ou posição de ações? → NÃO = cumpre | SIM = viola.

**`FH-51.07`** — Mudança de permissão **DEVE** ter efeito imediato e perceptível,
com informação ao usuário afetado sobre o que mudou.
> **Verificação:** a mudança teve efeito imediato e foi comunicada a quem foi afetado? → SIM = cumpre | NÃO = viola.

**`FH-51.08`** — Limite atingido **NUNCA** é apresentado como falha do usuário nem
com pressão comercial (`FH-17.02`, `FH-11.01`). É informação factual com opções.
> **Verificação:** a comunicação do limite culpa o usuário ou pressiona comercialmente? → NÃO = cumpre | SIM = viola.

**`FH-51.09`** — Ação bloqueada por limite **DEVE** oferecer alternativa concreta:
o que ainda é possível fazer agora, e o que muda o limite.
> **Verificação:** a recusa por limite oferece alternativa concreta? → SIM = cumpre | NÃO = viola.

**`FH-51.10`** — A autorização é verificada **no servidor**. A interface **NUNCA** é
a única barreira: esconder um controle não é controle de acesso.
> **Verificação:** a autorização é aplicada no servidor, independentemente da interface? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define como **poder, papel, plano e limite** aparecem na interface —
sem gerar frustração, sem vazar informação e sem transformar restrição em pressão
comercial.

---

## 2. Perguntas que este capítulo responde

- Escondo ou desabilito o que o usuário não pode fazer?
- Como explico uma recusa?
- Como mostro limite de plano sem chantagem?
- Como o usuário pede acesso?
- Papel muda a interface?

---

## 3. Definições

**Papel** — nível de permissão atribuído pela conta (Capítulo 21, entidade
administrativa).

**Permissão** — autorização para executar uma ação ou acessar um recurso.

**Limite** — teto de uso definido por plano, cota ou capacidade técnica.

**Recusa** — resposta do sistema a uma tentativa não autorizada ou acima do limite.

**Barreira de interface** — ocultação ou desabilitação de controle. Nunca é
controle de acesso (`FH-51.10`).

---

## 4. Fundamento

**Por que toda recusa explica.** Recusa sem motivo produz três efeitos ruins: o
usuário acha que é defeito, procura suporte, e culpa a si mesmo. Como falta de
permissão é estado normal (`FH-41.08`), explicá-la custa uma frase e evita todo
esse ciclo. A explicação também é o que permite ao usuário resolver sozinho —
frequentemente pedindo acesso a quem está ao lado.

**Por que esconder e desabilitar têm critérios diferentes.** Ambas as escolhas
comunicam algo. Esconder diz "isto não faz parte do seu mundo"; desabilitar diz
"isto existe, mas não agora". Usar a errada produz confusão: desabilitar o que o
usuário nunca poderá usar cria frustração permanente e revela existência; esconder
o que é temporariamente indisponível faz a capacidade parecer inexistente e leva o
usuário a procurar em outro lugar.

**Por que a recusa não pode revelar.** Este é o ponto mais sutil. Uma mensagem
específica demais — "você não tem acesso aos 47 registros deste funil" — informa
tanto que o funil existe quanto seu tamanho. Como a interface de permissões é onde
mais se escreve sobre o que está do outro lado, é onde mais se vaza. `FH-51.03`
cobre mensagem, contagem e rótulo.

**Por que limites vêm antes.** Descobrir um limite ao atingi-lo significa
descobri-lo no meio de uma tarefa — quase sempre urgente, já que é o volume que
revela o limite. Avisar antes converte um bloqueio em decisão: o usuário escolhe
ajustar, esperar ou seguir por outro caminho.

**Por que limite não é oportunidade de venda.** Este é o momento em que a pressão
comercial é mais tentadora e mais destrutiva. O usuário está bloqueado, com pressa,
sem alternativa imediata — condições em que qualquer urgência adicionada é
coerção. `FH-51.08` e `FH-51.09` obrigam o oposto: informação factual e alternativa
concreta. A oferta comercial pode existir; a pressão, não.

**Por que a interface nunca é a barreira.** Ocultar um controle é decisão de
experiência, não de segurança. Autorização aplicada apenas no cliente é
contornável, e a violação resultante seria de tenancy — a cláusula pétrea de
`FH-03.02(a)`. `FH-51.10` existe para que ninguém confunda as duas camadas.

---

## 5. Princípios

**Recusa sem explicação vira chamado de suporte.**

**Esconder e desabilitar dizem coisas diferentes — escolha o que é verdade.**

**Quanto mais específica a recusa, mais ela revela.**

**Limite atingido é o pior momento para vender.**

---

## 6. Regras normativas

### Critério: esconder × desabilitar × exibir com recusa

| Situação | Tratamento | Motivo |
| --- | --- | --- |
| A capacidade **não existe** para este papel, em nenhuma condição | **Esconder** | Exibi-la só criaria frustração permanente e revelaria existência |
| A capacidade existe, mas está **temporariamente** indisponível (estado, pré-requisito) | **Desabilitar**, com motivo acessível | O usuário precisa saber que existe e o que a habilita |
| A capacidade existe e o usuário **poderia** obtê-la (permissão concedível) | **Exibir com recusa explicada** + caminho de solicitação | É o caso em que o caminho importa mais que a barreira |
| Bloqueio por **limite de plano ou cota** | **Exibir com recusa** + alternativa concreta | O usuário decide o que fazer (`FH-51.09`) |

**Regra de desempate.** Quando esconder e desabilitar parecerem igualmente
defensáveis, vence **esconder** — porque desabilitar revela existência
(`FH-51.03`), e revelar é o risco mais grave dos dois.

### `FH-51.01` — Anatomia da recusa

| Elemento | Obrigatório | Exemplo de conteúdo |
| --- | --- | --- |
| O que não é possível | Sim | "Não é possível excluir membros." |
| Por quê | Sim | "Apenas o responsável pela conta pode fazer isso." |
| Caminho | Sim | "Solicitar ao responsável" (ação no local) |
| O que **não** dizer | — | Quantidade, nomes ou conteúdo do que está protegido |

### `FH-51.09` — Alternativa concreta

**Certo.** "Você atingiu o limite de envios deste mês (X de X). Você ainda pode
responder conversas e agendar envios para o próximo ciclo. Para aumentar o limite,
ver planos."

**Errado.** "Limite atingido. Faça upgrade agora!" — não diz o que ainda é
possível e adiciona urgência.

---

## 7. Anti-padrões

**Recusa muda.** Botão que não funciona, sem explicação.

**Recusa indiscreta.** Mensagem que revela o que existe do outro lado.

**Desabilitado eterno.** Controle permanentemente inativo para aquele papel.

**Papel que muda a interface.** Estrutura diferente por permissão.

**Limite-surpresa.** Descoberto no momento do uso.

**Bloqueio como vitrine.** Limite convertido em pressão comercial.

**Segurança de interface.** Ocultação usada como controle de acesso.

**Mudança silenciosa de permissão.** Usuário perde acesso sem saber por quê.

---

## 8. Impactos

**Cognitivo.** Recusa explicada elimina a fase de investigação — o usuário sabe
imediatamente se o problema é dele, do papel ou do plano.

**Emocional.** É um dos pontos de maior risco de frustração. `FH-51.08` protege o
usuário de ser pressionado no momento em que está mais vulnerável.

**Produtividade.** `FH-51.05` remove o ciclo "descobrir que não pode → sair do
fluxo → pedir por outro canal → voltar".

**Percepção de qualidade.** Recusas bem escritas transmitem cuidado; recusas mudas
transmitem defeito. É frequentemente o primeiro contato de um novo membro com os
limites do sistema.

**Curva de aprendizagem.** Recusas explicadas ensinam o modelo de permissões pelo
uso, sem exigir leitura de documentação.

---

## 9. Riscos e trade-offs

**Risco: recusa reveladora.** Explicar bem e vazar é fácil. Mitigação: `FH-51.03`
proíbe quantidade, nome e conteúdo — explica-se a **regra**, nunca o **conteúdo**.

**Risco: excesso de ocultação.** Esconder demais faz o produto parecer menor do que
é e dificulta a descoberta de capacidades legítimas. Mitigação: o critério de §6 —
esconde-se o que não existe para aquele papel, não o que ele poderia obter.

**Risco: perder receita.** Não pressionar em limite reduz conversão imediata.
Trade-off assumido, coerente com `FH-11.01`.

**Trade-off central.** Trocamos oportunidade comercial por confiança. O momento do
limite é o de maior propensão a converter e o de maior custo se a conversão for
obtida por pressão.

---

## 10. Critérios de verificação

1. Toda recusa informa motivo e caminho.
2. A escolha entre esconder e desabilitar segue o critério objetivo.
3. Nenhuma recusa, contagem ou rótulo revela o que está protegido.
4. Limites são comunicados antes de atingidos, com tempo de agir.
5. Toda recusa por permissão oferece solicitação no próprio fluxo.
6. Papel não altera modelo, navegação nem posição de ações.
7. Mudança de permissão tem efeito imediato e é comunicada.
8. Nenhum limite é apresentado com culpa ou pressão comercial.
9. Toda recusa por limite oferece alternativa concreta.
10. A autorização é aplicada no servidor, não apenas na interface.

---

## 11. Checklist do capítulo

- [ ] A recusa diz por que e o que fazer.
- [ ] Escolhi esconder ou desabilitar pelo critério, não por gosto.
- [ ] Nenhuma mensagem, contagem ou rótulo revela o protegido.
- [ ] O limite foi avisado antes, com tempo de agir.
- [ ] Dá para pedir acesso sem sair daqui.
- [ ] O papel não mudou a estrutura da interface.
- [ ] A comunicação do limite não culpa nem pressiona.
- [ ] A autorização é verificada no servidor.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10 (`FH-10.06`), 11 (ética), 13 (`FH-13.06`), 17
(`FH-17.02`), 27 (`FH-27.06`), 41 (`FH-41.08`), 42 (vazio por permissão), 44
(`FH-44.09`).

**É pré-requisito de.** Capítulos 54 (automações), 56 (métricas), 62 (qualidade).
Alimenta a matriz pendente "esconder × desabilitar" no Anexo C.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Papéis e permissões | Chave `roles` em `src/i18n/messages/pt-BR.json`, hooks de permissão em `src/hooks/` |
| Autorização no servidor | Guards em rotas de `src/app/api/`, RLS em `supabase/migrations/` |
| Controles com permissão | `src/components/ui/gated-button.tsx` |
| Planos, cotas e consumo | `src/lib/plans/`, `src/lib/consumption/`, `src/components/consumption/` |
| Limites de operação | `src/lib/rate-limit.ts` |
| Convites e mudança de papel | `src/components/settings/invite-member-dialog.tsx` |
