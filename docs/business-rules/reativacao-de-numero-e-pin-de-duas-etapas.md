# Reativação de Número e PIN de Duas Etapas

Como o Flow Hub devolve um número de WhatsApp ao ar quando o registro na
Cloud API cai, e por que o usuário não é mais solicitado a informar o PIN de
verificação em duas etapas.

Estado em 20/08/2026. **Exercitado contra a API real da Meta** no número
+55 85 9430-7765 (`1234430473092721`), que estava fora do ar e voltou. O
teste derrubou a premissa da primeira versão deste documento: a ordem das
chamadas estava invertida e a reativação não podia funcionar. Corrigido e
revalidado — ver §5.

---

## 1. A restrição da plataforma

O PIN de verificação em duas etapas de um número é **write-only** no
ecossistema da Meta:

- Não existe endpoint de leitura na Graph API.
- O Gerenciador do WhatsApp não exibe o PIN vigente em tela nenhuma.
- Não existe endpoint para **desligar** a verificação em duas etapas pela
  API. Pelo Gerenciador do WhatsApp existe: o botão *Turn off two-step
  verification* dispara um link por e-mail para o endereço do portfólio de
  negócios. Isso não muda nada para o fluxo do Flow Hub — continua sem
  caminho programático —, mas a afirmação "uma vez ligada, fica ligada" é
  falsa e sairia caro numa conversa com cliente.
- Gravar um PIN novo **não exige o anterior**. Basta o token da conta.

A consequência de produto é direta: **não existe lugar para onde mandar o
usuário buscar o PIN dele**. Qualquer link com esse rótulo leva a uma página
que não responde à pergunta — e, em tela de erro, o usuário conclui que o
defeito é do Flow Hub. Essa foi a razão de descartar a ideia de um link
para o Gerenciador.

A mesma assimetria que impede a leitura é o que resolve o problema: se dá
para escrever sem saber o anterior, o produto pode definir o PIN sozinho.

## 2. O fluxo implementado

Quando o registro está pendente, a tela de configuração do WhatsApp mostra
**"Reativar número"**. Ao clicar:

1. O cliente envia `auto_two_step_pin: true` para `POST /api/whatsapp/config`.
2. O servidor sorteia um PIN com `generateTwoStepPin()`
   (`src/lib/whatsapp/two-step-pin.ts`) — `crypto.randomInt`, descartando
   os previsíveis (seis dígitos iguais, sequências corridas).
3. Registra o número com `registerPhoneNumber()` — `POST
   /{phone_number_id}/register`, corpo `{ messaging_product, pin }`. **É
   esta chamada que grava o PIN**: registrar um número e definir seu PIN de
   duas etapas são o mesmo ato na Meta.
4. Só se o `/register` falhar por motivo relacionado a PIN, cai no
   `setTwoStepPin()` (`POST /{phone_number_id}`, corpo `{ pin }`) e tenta
   registrar de novo. Esse caminho atende o número que a Meta considera
   registrado mas cujo PIN o cliente não tem.
5. Devolve o PIN em `two_step_pin`, **uma única vez**.

O PIN aparece na interface em bloco fixo (não em toast — o usuário precisa
de tempo para anotar), com aviso de que não fica guardado.

### Decisões que não são óbvias no código

**O PIN não é persistido.** O `set` e o `register` acontecem na mesma
requisição, então o valor é conhecido no exato momento em que é necessário;
e como a Meta aceita sobrescrever sem o anterior, a próxima reativação
apenas sorteia outro. Guardar exigiria migração de schema e criaria mais um
segredo em repouso, sem ganho funcional. **Se alguém for "corrigir" isso
depois, esta é a razão de não estar lá.**

**O PIN é devolvido mesmo quando o registro falha.** O `/register` grava o
PIN como parte do próprio ato; se ele falhar depois disso, o PIN anterior já
morreu. Esconder seria a pior falha possível desta tela. Por isso
`generatedPin` é marcado **antes** da primeira chamada, e não entre elas —
foi assim que a versão anterior deixou o usuário sem PIN e sem número (§5.1).

**A ordem `register` → `set` não é estilo, é requisito da plataforma.** O
`setTwoStepPin` exige número registrado. Invertê-la quebra exatamente o
cenário para o qual esta tela existe. Está verificado contra a API real;
não reordene.

**Reativar nunca acontece junto de um salvar comum.** Trocar o PIN invalida
o que o cliente tinha — se ele usa o mesmo número em outra ferramenta,
aquela ferramenta perde a capacidade de reativar. Por isso é ato deliberado,
com botão próprio e aviso explícito, nunca efeito colateral.

**O campo manual continua existindo**, recolhido atrás de *"Prefiro informar
meu próprio PIN"*, para quem já tem um PIN definido e quer mantê-lo.

## 3. Arquivos

| Arquivo | Papel |
| --- | --- |
| `src/lib/whatsapp/two-step-pin.ts` | Sorteio do PIN e regra de PIN fraco |
| `src/lib/whatsapp/two-step-pin.test.ts` | Cobertura do gerador |
| `src/lib/whatsapp/meta-api.ts` | `setTwoStepPin()`, `registerPhoneNumber()` |
| `src/lib/whatsapp/api-version.ts` | Versão única da Graph API (servidor + SDK) |
| `src/lib/whatsapp/registration.test.ts` | Cobertura do `setTwoStepPin` |
| `src/app/api/whatsapp/config/route.ts` | Orquestra gerar → gravar → registrar |
| `src/components/settings/whatsapp-config.tsx` | Botão, campo recolhido, exibição do PIN |
| `src/i18n/messages/pt-BR.json` | Chaves em `settings.whatsappConfig` |

## 4. Verificação já feita

- 544 testes passando (`vitest run`), 8 deles novos. **Passaram idênticos
  antes e depois do bug de ordem ser corrigido** — ver §5.5.
- `tsc --noEmit` limpo.
- `next build` com saída 0.
- ESLint nos arquivos tocados: nenhum problema novo (os que aparecem são
  anteriores e ficam fora dos trechos alterados).
- Fluxo completo acionado contra a Meta real, com o número voltando ao ar
  (§5.1).

## 5. Verificação contra a API real e o que sobrou

**Exercitado em 20/08/2026** no número +55 85 9430-7765
(`1234430473092721`, WABA `1757472798770767`), pelo próprio botão da tela,
com o dev server em `v25.0`. O MCP `meta-devtools` **não** serviu para isso:
ele expõe configuração de app, observabilidade e documentação
(`app_list`, `api_usage`, `api_changelog`, `compliance`, `webhook_*`,
`discovery`), e não tem chamada Graph arbitrária. O que fechou os riscos foi
acionar o fluxo real pelo navegador e ler o console do servidor.

### 5.1 Propagação entre `set` e `register` — RESPONDIDO, e a pergunta estava errada

Não existe problema de propagação. Existia um problema pior, que a hipótese
de "intervalo entre as chamadas" teria escondido.

Primeira execução, com o código como estava:

```
Phone number /register failed: The account is not registered
POST /api/whatsapp/config 200 in 3.6s
```

A tela mostrou o erro e **nenhum PIN**. Como `generatedPin` só era atribuído
*entre* as duas chamadas, a ausência do PIN na resposta prova que quem
estourou foi o **`setTwoStepPin`**, antes de o `/register` chegar a ser
tentado. O log dizia `/register failed` porque o `catch` era compartilhado e
rotulava tudo com o mesmo nome — sozinho, ele mandaria a investigação para o
lado errado.

A causa: **`POST /{phone_number_id}` com `{ pin }` é operação de *trocar* o
PIN de um número já registrado.** Num número fora do ar a Meta responde
`The account is not registered`. E fora do ar é precisamente o estado em que
esta tela aparece — então o fluxo `set` → `register` **nunca poderia
funcionar** no seu próprio caso de uso. A documentação diz o mesmo pelo
outro lado: *"You must set a two-step verification PIN when registering a
business phone number"* — quem estabelece o PIN é o `/register`.

**Correção aplicada** em `src/app/api/whatsapp/config/route.ts`:

- O `/register` passou a vir primeiro, levando o PIN sorteado.
- O `setTwoStepPin` virou fallback, acionado só quando o `/register` falha
  por motivo relacionado a PIN — o caso do número registrado cujo PIN o
  cliente não tem.
- `generatedPin` passou a ser marcado **antes** da primeira chamada. Na
  versão anterior o usuário podia ficar sem número e sem PIN, que é
  exatamente o que a §2 se propunha a evitar.
- A mensagem de erro deixou de afirmar qual chamada falhou.

**Revalidado pelo mesmo botão:**

```
POST /api/whatsapp/config 200 in 13.0s
```

Sem linha de erro. A tela passou a *Conectado*, *"Registrado — a Meta
entregará eventos para o Flow Hub"*, ativo confirmado em 20/08/2026
03:28:53, com o bloco do PIN exibido. **O número voltou ao ar.** O fluxo da
§2 está exercitado ponta a ponta contra a Meta.

### 5.2 Formato do corpo — CONFIRMADO na prática

`{ pin }` puro, sem `messaging_product`, é aceito: foi o corpo que a
primeira execução enviou, e a recusa que voltou (`The account is not
registered`) é sobre o **estado do número**, não sobre o formato. A
referência oficial descreve o mesmo corpo e resposta `{ "success": true }`.

Continua **sem verificação** a afirmação de que `messaging_product` faria a
chamada falhar. A documentação apenas não lista o campo; nunca enviamos com
ele. A frase original era mais forte que a evidência e foi retirada da §2.

### 5.3 Versão da Graph API — SUBIDA e confirmada em uso

| Fato | Valor |
| --- | --- |
| Expiração da `v21.0` | **21/01/2027** (~5 meses) |
| Versão adotada | `v25.0` (documentação corrente, expira 29/07/2028) |
| Mais recente da plataforma | `v26.0` (29/07/2026) |
| Deprecations sinalizadas nos dois apps | nenhuma |

O achado que forçou a decisão foi o prazo: restavam cerca de cinco meses de
`v21.0`, e não o horizonte indefinido que este documento registrava.

A subida foi feita em duas etapas, e a primeira estava incompleta — vale
registrar porque o erro é instrutivo. Trocar `META_API_VERSION` e conferir
com `grep "graph.facebook.com/v[0-9]"` deu a impressão de trabalho
terminado. **Não estava.** Aquele padrão só encontra URL montada por
inteiro; ficaram de fora:

| Onde | Forma | O que era |
| --- | --- | --- |
| `src/app/api/whatsapp/embedded-signup/route.ts` | `const metaBase = 'https://graph.facebook.com/v21.0'` | URL cravada |
| `src/app/api/whatsapp/templates/sync/route.ts` | `const META_API_VERSION = 'v21.0'` | **terceira cópia** da constante |
| `src/components/settings/whatsapp-config.tsx` (5×) | `FB.init({ version: 'v21.0' })` | versão do SDK JS |
| `src/app/layout.tsx` | `version : 'v21.0'` no boot do SDK | versão do SDK JS |

Ou seja: três cópias independentes da constante no servidor e seis pinos no
cliente, todos com o mesmo prazo de 21/01/2027, e nenhum deles visível pela
busca que dava o assunto por encerrado.

Consolidado em `src/lib/whatsapp/api-version.ts`, módulo próprio — e não
dentro de `meta-api.ts` — porque a tela de configuração é client component e
importar `meta-api.ts` dali arrastaria todo o cliente HTTP para o bundle do
navegador. `meta-api.ts` reexporta. **A varredura agora só encontra a
definição única e dois comentários.**

Verificado no navegador: o boot script renderiza `version: "v25.0"`, sem
nenhum `v21.0`, SDK carregado e console sem erro.

Exercitado de verdade em `v25.0`, com sucesso: `verifyPhoneNumber`
(`GET /{phone_number_id}?fields=...`), `registerPhoneNumber`
(`POST /{phone_number_id}/register`) e `setTwoStepPin`
(`POST /{phone_number_id}`, que respondeu erro de estado, não de versão).
Os demais endpoints do módulo — envio de mensagem, templates, mídia,
`subscribed_apps` — **seguem sem exercício em `v25.0`**.

### 5.4 Guarda de papel — CORRIGIDO

A rota estava sem `requireRole`: qualquer membro autenticado da conta —
inclusive `viewer` — disparava a reativação e trocava o PIN. Não era
regressão, mas a verificação contra a API real tirou o argumento de cima do
muro: está confirmado que o ato **rotaciona de fato** o PIN na Meta, de
forma irreversível, inclusive para outra ferramenta que use o mesmo número.

`POST` e `DELETE /api/whatsapp/config` passaram a exigir `requireRole('admin',
{ isWriteOperation: true })`. O `DELETE` entrou junto porque remover a
conexão derruba o atendimento da conta inteira — mesma classe de estrago.

Os dois `catch` também precisaram mudar: devolviam `500` para qualquer erro,
o que transformaria uma recusa de permissão em falha de servidor. Agora
mapeiam `UnauthorizedError` para `401` e `ForbiddenError` para `403`.

### 5.5 Os testes não pegariam isso

544 testes passaram **antes e depois** da correção. Eles mockam `fetch` e
verificam corpo de requisição; nenhum modela a ordem das chamadas nem o
estado do número na Meta. O bug vivia exatamente no ponto cego: cada chamada
isolada estava certa, a sequência estava errada. Um teste que fixe a ordem
`register` antes de `set` — e que cubra o `/register` falhando após ter
gravado o PIN — é o que faltava.

### 5.6 Embedded Signup — verificado, e não é um problema

O changelog anuncia que **o Embedded Signup v2 será descontinuado em
15/10/2026**, com orientação de migrar para a v4. Levantado aqui como risco
antes de olhar o código; a checagem desfez o alarme.

O projeto **já está na v4**:
`src/components/settings/whatsapp-config.tsx` manda
`extras: { version: 'v4' }` no `FB.login`. A v4 é GA desde 08/10/2025 e é a
versão mais recente — não há preview pendente a adotar.

Vale saber o resto do calendário, porque não é só a v2 que cai: **v2, v3,
v2-public-preview e v3-public-preview expiram todos em outubro de 2026.** A
v4 é a única sem data de expiração anunciada. Quem eventualmente pensar em
"voltar uma versão" para contornar algum problema estaria escolhendo uma
porta que fecha junto.

Uma diferença de configuração merece atenção se alguém for mexer: na v4 o
objeto `extras` é propositalmente vazio e toda a configuração de produtos
passa a viver na Facebook Login for Business Configuration. Hoje mandamos
`extras: { version: 'v4' }`, que é a forma de declarar a versão do fluxo;
não confundir com a configuração de produtos, que fica no painel.

### Fontes

- [Two-Step Verification](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/)
- [Registering business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers)
- [Graph API changelog — calendário de versões](https://developers.facebook.com/docs/graph-api/changelog)
- [Business Messaging changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Execução real do fluxo em 20/08/2026, dev server + console, número
  `1234430473092721`.

---

## Anexo — pendências gerais do repositório (20/08/2026)

Levantadas ao longo do mesmo ciclo de trabalho, sem relação com o PIN:

- **ESLint: 198 erros** (`no-explicit-any`, `prefer-const`,
  `no-unused-vars`). O step de Lint do CI falha por causa deles.
- **Prettier: 576 arquivos** fora do padrão. Não roda no CI.
- **`npm audit`: 13 vulnerabilidades**, 9 altas (`brace-expansion`,
  `fast-uri`, `hono`, `body-parser`), todas com correção compatível em
  semver. O bloco `overrides` do `package.json` existe para isso e está
  desatualizado.
- **Aviso de preload no console** apontando para a logo e para a fonte
  (`preloaded but not used`). Anterior à correção de proporção da logo.
- **Bloco `nextjs-agent-rules` no `AGENTS.md`**, escrito pelo `next dev` a
  cada execução. Foi commitado. Alternativa: `agentRules: false` no
  `next.config.ts`.
