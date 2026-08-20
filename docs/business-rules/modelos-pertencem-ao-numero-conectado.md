# Modelos Pertencem ao Número Conectado

Por que um modelo aprovado deixa de existir quando o número do WhatsApp muda,
e como o Flow Hub passou a dizer isso na tela em vez de descobrir no envio.

Estado em 20/08/2026. Escrito a partir de um caso real relatado: número
desconectado, outro conectado no lugar, sincronização anunciando **"0 modelos
da Meta"** com sucesso, o modelo `continuar_conversa` seguindo **Aprovado** na
tela, e o envio devolvendo

```
Failed to send template: Meta API error: (#132001)
Template name does not exist in the translation
```

---

## 1. A restrição da plataforma

Um modelo de mensagem não pertence à empresa nem ao produto: ele pertence a
uma **conta de WhatsApp Business** — a WABA, na nomenclatura da Meta. Todos os
endpoints de modelo são escopados por ela: `GET|POST /{waba_id}/message_templates`.

Disso decorrem três fatos que o produto precisa respeitar:

- **Modelo não migra entre contas.** Conectar outro número, sob outra WABA,
  não leva catálogo nenhum junto. Os modelos antigos não ficam "pendentes"
  nem "desaprovados": eles simplesmente não existem para a conexão nova.
- **Ausência não é evento.** A Meta não avisa por webhook que um modelo saiu.
  O único jeito de saber é comparar o catálogo remoto com o local.
- **A recusa chega tarde.** O `(#132001)` só aparece no envio, quando já há
  um cliente do outro lado esperando.

## 2. O defeito

Três falhas independentes se somavam para produzir exatamente o relato.

**A tabela local não registrava a origem.** `message_templates` era escopada
por `account_id` e nada mais. Uma linha vinda da WABA A e uma linha vinda da
WABA B eram indistinguíveis.

**A sincronização só sabia somar.** A rota lia o catálogo remoto e fazia
upsert do que a Meta devolvia. O que a Meta *não* devolvia não era tocado —
ficava como estava, `APPROVED` inclusive. Com zero modelos na WABA nova, a
rota concluía "sincronizado, nada a fazer" e reportava sucesso. Era verdade
sobre o que ela fazia, e falso sobre o que a pessoa entendia.

**O envio confiava na cópia local.** Nenhuma verificação antes da chamada, e
o erro da Meta subia cru até a tela.

O resultado é o que o Capítulo 41 chama de estado que não é verdadeiro agora
nem declara sua defasagem (`FH-41.11`): a tela afirmava "Aprovado" sobre um
modelo que não existia em lugar nenhum.

## 3. O que passou a existir

### 3.1 Origem registrada — migração 068

`message_templates` ganhou duas colunas:

- **`waba_id`** — a conta de WhatsApp Business que hospeda o modelo na Meta.
  Carimbada pela sincronização e pelo envio para aprovação.
- **`missing_since`** — quando a ausência foi constatada, para a interface
  poder datar o que afirma.

E o `status` ganhou um valor: **`MISSING`**. Não vem da Meta — é escrito só
pela reconciliação local. O mapeamento 1:1 dos webhooks continua valendo,
porque a Meta nunca envia esse valor.

**Não há backfill de `waba_id`, de propósito.** Não existe como provar de qual
conta veio uma linha antiga. Carimbar todas com a conexão de hoje
transformaria justamente os órfãos que queremos achar em linhas de aparência
legítima. `NULL` é a afirmação honesta — "origem não verificada" — e a
primeira sincronização resolve cada linha.

### 3.2 Sincronização que reconcilia

`POST /api/whatsapp/templates/sync` mudou em quatro pontos:

1. **Lê todas as conexões da conta**, uma WABA por vez (dedupe por `waba_id`,
   porque uma WABA pode hospedar vários números e o catálogo é o mesmo). Antes
   usava `.single()`, que estourava numa conta com dois números.
2. **Carimba `waba_id`** em cada linha escrita.
3. **Reconcilia:** toda linha local que afirma ter contrapartida remota
   (`meta_template_id` presente, status fora de `DRAFT`) e não apareceu na
   leitura da própria WABA passa a `MISSING`, com `missing_since` e sem nota
   de qualidade — a nota descrevia um modelo que não existe mais.
4. **Reporta o que sumiu.** A resposta traz `missing`, `synced_connections`,
   `total_connections` e `fetch_failures`; a interface conta os modelos que
   deixaram de existir junto com os que entraram.

Duas travas contra o erro oposto — marcar como ausente um modelo que existe:

- WABA cuja leitura falhou **não** entra na reconciliação. Nada foi observado
  sobre ela, então nada é afirmado.
- Linhas sem `waba_id` (anteriores à 068) só são reconciliadas quando **todas**
  as conexões foram lidas com sucesso. Numa leitura parcial, elas poderiam
  pertencer justamente à WABA que não foi consultada.

Leitura parcial nunca é anunciada como sucesso (`FH-41.05`).

### 3.3 Desconexão que já diz a verdade

`DELETE /api/whatsapp/config` passou a marcar como `MISSING` os modelos das
WABAs que saíram junto com o número — no ato, não na próxima sincronização.
Só rebaixa WABA que não sobrou em nenhuma outra conexão.

Era exatamente a lacuna do relato: entre desconectar e sincronizar, o catálogo
antigo seguia parecendo válido.

### 3.4 Envio que verifica antes e corrige depois

Em `/api/whatsapp/send`, `/api/whatsapp/broadcast` e nas automações:

- **Antes da chamada** — modelo já reconciliado como ausente, ou de WABA
  diferente da conexão em uso, é recusado com uma frase que diz o que
  aconteceu e qual é o próximo passo, no lugar do código da Meta
  (`FH-44.10`). Na transmissão isso poupa a janela de envio inteira, que
  falharia um destinatário por vez com o mesmo erro.
- **Depois da falha** — se a Meta responder `132001` mesmo assim, a linha é
  marcada `MISSING` na hora. O modelo sai do seletor (que só oferece
  `APPROVED`) e a próxima tentativa não repete o mesmo tropeço
  (`FH-44.11`, `FH-18.10`).

O que **não** bloqueia: status como `PENDING` ou `REJECTED`. Eles podem estar
defasados em relação à Meta, e recusar um envio válido por causa de uma cópia
velha seria trocar um erro por outro. Só bloqueia fato estabelecido.

### 3.5 Saída para o modelo órfão

Na tela de modelos, a linha `MISSING` mostra o rótulo **Indisponível**, a
explicação do que aconteceu, a data em que foi detectado e o botão de reenviar
para aprovação. A exclusão de um modelo `MISSING` deixou de chamar a Meta —
antes devolvia 502 e prendia a pessoa com uma linha que ela não conseguia nem
usar nem remover (`FH-44.07`).

**Reenviar é recriar, não editar.** `PATCH /api/whatsapp/templates/[id]` altera
um modelo que existe na Meta, via `hsm_id`; para um modelo `MISSING` não há o
que alterar, e a rota recusa. O botão Reenviar de uma linha `MISSING` usa o
mesmo formulário mas envia por `POST /api/whatsapp/templates/submit` — cria na
conta do número atual, e o upsert por `(nome, idioma)` reaproveita a linha
local, religando-a ao número conectado agora. Nome e idioma seguem travados:
são a chave da linha, e trocar um deles deixaria o modelo indisponível para
trás.

A recusa da edição também deixou de devolver o nome do estado interno. Cada
motivo leva a um caminho diferente, e a mensagem diz qual: modelo indisponível
manda recriar; modelo em análise pede espera; modelo encerrado pela Meta manda
criar outro (`FH-44.10`).

## 4. O que fazer com o caso relatado

1. Aplicar a migração 068.
2. Abrir Configurações → Modelos → **Sincronizar da Meta**. Os modelos da WABA
   antiga passam a **Indisponível** e o aviso diz quantos deixaram de existir.
3. Para cada modelo que ainda faz falta, **Reenviar** — ele nasce de novo na
   conta do número atual e volta a passar por aprovação da Meta. Não há atalho:
   o modelo antigo não existe mais para essa conexão.

## 5. Limitações conhecidas

- **Um modelo por (nome, idioma) por conta.** O índice único ainda é
  `(user_id, name, language)`. Duas WABAs com um modelo de mesmo nome e idioma
  compartilham a mesma linha local, e a última leitura vence o carimbo de
  `waba_id`. Não quebra a reconciliação (o par foi visto nas duas), mas a
  origem exibida pode alternar. A correção pertence à migração que troca o
  índice para `(account_id, name, language)` — já registrada como pendência no
  `TODO(account-sharing)` da rota de envio para aprovação.
- **A tela de modelos ainda lista por `user_id`.** Um colega que sincronizou
  não vê os modelos do outro. Pelo mesmo motivo, se quem reenviar um modelo
  indisponível não for quem o sincronizou, o upsert grava uma linha nova em vez
  de reaproveitar a existente, e a linha `MISSING` fica para trás. Ambas são
  desconformidades preexistentes do índice único, fora do alcance desta
  correção.
- **`missing_since` não é histórico.** Guarda a última detecção, não a série.
  Se um modelo sumir, voltar e sumir de novo, só a última data sobrevive.

## 6. Onde está o código

| Arquivo | Papel |
| --- | --- |
| `supabase/migrations/068_template_waba_scope_and_missing_state.sql` | `waba_id`, `missing_since`, status `MISSING` |
| `src/lib/whatsapp/template-availability.ts` | Regras puras: pode enviar? a Meta disse que sumiu? |
| `src/app/api/whatsapp/templates/sync/route.ts` | Leitura por WABA + reconciliação |
| `src/app/api/whatsapp/config/route.ts` | Rebaixa modelos ao desconectar o número |
| `src/app/api/whatsapp/send/route.ts` | Verificação antes, autocorreção depois |
| `src/app/api/whatsapp/broadcast/route.ts` | Verificação antes da transmissão |
| `src/lib/automations/meta-send.ts` | Mesma verificação no disparo automático |
| `src/app/api/whatsapp/templates/[id]/route.ts` | Exclusão do órfão sem chamar a Meta |
| `src/components/settings/template-manager.tsx` | Rótulo, explicação e relatório da sincronização |

### Fontes

- [Message templates](https://developers.facebook.com/documentation/business-messaging/whatsapp/message-templates/)
- [Cloud API error codes — 132001](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/)
- Relato de produção em 20/08/2026: troca de número seguida de sincronização
  com zero modelos e envio recusado com `(#132001)`.

---

## Conformidade constitucional

**Artigos aplicados:** `FH-07.10`, `FH-08.07`, `FH-10.04`, `FH-18.10`,
`FH-21.04`, `FH-21.11`, `FH-41.05`, `FH-41.11`, `FH-44.03`, `FH-44.07`,
`FH-44.10`, `FH-44.11`, `FH-57.11`

**Decisões constitucionais:**

- Estado `MISSING` como estado declarado, com transição explícita e data de
  detecção, em vez de manter `APPROVED` numa linha sem contrapartida —
  fundamento: `FH-21.04`, `FH-41.11`.
- Sincronização passa a reconciliar ausências, não só somar presenças: a tela
  só pode afirmar o que foi observado — fundamento: `FH-10.04`, `FH-07.10`.
- WABA não lida fica fora da reconciliação e o resultado é reportado como
  parcial, nunca como sucesso — fundamento: `FH-41.05`.
- Desconexão marca os modelos no ato, em vez de esperar a próxima
  sincronização — fundamento: `FH-41.11`.
- Erro da Meta (`132001`) traduzido para o que aconteceu e o próximo passo, e
  a causa corrigida no catálogo em vez de reescrever só o texto — fundamento:
  `FH-44.10`, `FH-44.11`, `FH-18.10`.
- A explicação aparece na linha do modelo, onde a correção acontece, e não só
  no momento do envio — fundamento: `FH-44.03`.
- Modelo indisponível pode ser removido ou reenviado sem passar pela Meta —
  fundamento: `FH-44.07`.
- Texto de usuário fala de número conectado e de aprovação, não de WABA nem de
  código de erro — fundamento: `FH-57.11`. O termo técnico permanece no código,
  nos comentários e neste documento, onde ele **é** a informação.

**Interpretações adotadas:** o Anexo B não distingue "modelo apagado na Meta"
de "modelo de outra conexão". Foram tratados como um único estado
(`MISSING`), porque a consequência operacional é idêntica — não há o que
enviar —, com duas explicações derivadas de `waba_id`. Criar dois valores de
enum para a mesma transição contrariaria `FH-08.07` sem acrescentar
informação de estado.

**Lacunas encontradas:** nenhuma.

**Dívidas identificadas:**

- Índice único de `message_templates` ainda em `(user_id, name, language)`;
  impede uma linha por WABA e faz a tela de modelos listar por autor em vez de
  por conta. Preexistente, já registrada como `TODO(account-sharing)`.
- ESLint acusa 5 erros `no-explicit-any` nas rotas de WhatsApp tocadas — todos
  anteriores a esta correção, nenhum introduzido aqui.

**Não verificado:**

- Execução contra a API real da Meta. A reconciliação, a recusa antes do envio
  e a autocorreção foram cobertas por teste unitário nas funções puras e por
  verificação de tipos; o caminho HTTP completo depende de uma conta com troca
  de número real e não foi exercitado neste ciclo.
- A migração 068 não foi aplicada a um banco nesta sessão.
