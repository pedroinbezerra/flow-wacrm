# AGENTS.md

Guia de padronização para agentes que criam, alteram ou revisam código neste projeto.

## 0) Constituição do Produto — leitura obrigatória

Este arquivo governa **como implementar**. Ele não governa **o que construir nem
por quê**. Isso pertence à Constituição do Produto FlowHub, em
`docs/constituicao/`.

- Ponto de entrada: `docs/constituicao/00-INDICE-E-ARQUITETURA.md`.
- Consulta rápida de regras: `docs/constituicao/ANEXO-B-indice-de-artigos.md`.
- Escolhas recorrentes: `docs/constituicao/ANEXO-C-matriz-de-decisao.md`.
- Protocolo de uso por agentes: `docs/constituicao/L8-C68-protocolo-para-agentes.md`.

Ordem obrigatória de carregamento (`FH-68.08`), do mais barato ao mais caro:
Anexo B → Anexo C → Núcleos Normativos dos capítulos aplicáveis → capítulo
completo. Toda entrega com efeito perceptível encerra com o **Bloco de
Conformidade** (`FH-68.02`).

Regras de precedência:

- Conflito sobre **o que construir** → vence a Constituição.
- Conflito sobre **como implementar neste repositório** → vence este arquivo.
- Obrigação legal (`docs/legal/`, `docs/business-rules/`) → vence ambos.

Antes de criar ou alterar qualquer tela, fluxo, componente, texto de interface,
automação ou funcionalidade de IA, consulte o Anexo B e cite os artigos
(`FH-XX.NN`) que sustentam a decisão. Se a tarefa solicitada exigir violar um
artigo marcado **DEVE** ou **NUNCA**, interrompa e sinalize o conflito antes de
implementar (§0.11 do Volume 0).

## 1) Regra-base sobre Next.js

Este projeto usa Next.js 16.2.6 com mudanças relevantes em APIs e convenções.

- Antes de propor padrões de Next, validar o comportamento real no código do projeto.
- Ao lidar com recursos novos/deprecados, conferir os docs locais em node_modules/next/dist/docs/.
- Não assumir comportamento de versões antigas por memória.

## 2) Stack e arquitetura observada

- Frontend: Next.js App Router + React 19 + TypeScript strict.
- UI: Tailwind CSS v4, shadcn/base-ui, utilitário cn para composição de classes.
- Dados/autenticação: Supabase (SSR + browser client), com RLS e account tenancy.
- Testes: Vitest (foco em utilitários e módulos de domínio).
- i18n: dicionário local com locale padrão pt-BR.

## 3) Estrutura de pastas e responsabilidades

- src/app: rotas, layouts e API routes.
- src/app/(auth): telas públicas de autenticação.
- src/app/(dashboard): área autenticada e shell principal.
- src/app/api: endpoints server-side por domínio.
- src/components/ui: primitives e componentes reutilizáveis de interface.
- src/components/<domínio>: componentes de feature.
- src/hooks: hooks de estado, auth, permissões e helpers de UI.
- src/lib: regras de negócio, integrações, utilitários e módulos de domínio.
- src/lib/supabase: clientes browser/server.
- src/types/index.ts: tipos de domínio compartilhados.
- supabase/migrations: migrações SQL versionadas.

## 4) Convenções de nomenclatura

### Arquivos e pastas

- Preferir kebab-case para arquivos TS/TSX.
	- Exemplos: use-auth.tsx, presence-heartbeat.tsx, template-send-builder.ts.
- Componentes de rota seguem a convenção do App Router (page.tsx, layout.tsx, route.ts).
- Testes ficam colocalizados com sufixo .test.ts.

### Símbolos

- Componentes React: PascalCase.
	- Exemplo: DashboardShell, PresenceHeartbeat, PipelinesPage.
- Hooks: prefixo use + PascalCase.
	- Exemplo: useAuth, useCan, useTranslation.
- Funções utilitárias: verbos claros e semânticos.
	- Exemplo: formatCurrency, dedupeByPhone, getCurrentAccount, requireRole.
- Constantes globais: UPPER_SNAKE_CASE.
	- Exemplo: DEFAULT_CURRENCY, RATE_LIMITS, HEARTBEAT_MS.
- Tipos/interfaces: PascalCase.
	- Exemplo: AccountContext, DispatchInput, CurrencyOption.

## 5) Estilo de código e formatação

- TypeScript strict é obrigatório; evitar any sem justificativa real.
- Preferir imports absolutos via alias @/.
- Seguir o estilo predominante do arquivo tocado.
	- Há coexistência de arquivos com e sem ponto e vírgula.
	- Há coexistência de aspas simples e duplas.
- Não reformatar arquivos inteiros sem necessidade funcional.
- Comentários devem explicar decisão e contexto, não o óbvio.
	- O projeto usa bastante comentário de intenção, trade-off e segurança.

## 6) Padrões de funções (assinatura e desenho)

- Quando houver muitos parâmetros, preferir objeto nomeado com interface dedicada.
	- Exemplo forte: integrações da Meta API.
- Em funções públicas de módulo, explicitar contratos com tipos e retornos previsíveis.
- Em fluxos assíncronos críticos, tratar erro explicitamente e manter logs com contexto.
- Em camadas compartilhadas, evitar lançar exceções não mapeadas para o chamador HTTP.

## 7) Acesso a banco e Supabase

### Clientes

- Browser: usar singleton em src/lib/supabase/client.ts.
	- Evita contenção de lock de auth e inconsistência de sessão.
- Server (RLS por usuário): usar factory de src/lib/supabase/server.ts.
- Service role: usar cliente dedicado apenas em módulos que exigem bypass de RLS.
	- Exemplo: engines internas de automação.

### Tenancy e segurança de dados

- Toda query de domínio multi-tenant deve respeitar account_id.
- Não confiar apenas no cliente para isolamento; combinar:
	- RLS no banco.
	- Filtros por account_id nas queries.
	- Guards de autorização em rotas (ex.: requireRole).

### RPCs e operações sensíveis

- Preferir RPC para:
	- Regras de autorização críticas.
	- Operações atômicas (contadores, promoção/demissão de papel).
	- Fluxos com segurança definer e validação no banco.
- Mapear SQLSTATE para HTTP de forma explícita quando necessário.

## 8) Padrão para API routes

- Usar funções por método HTTP exportadas no route.ts (GET, POST, PATCH, DELETE).
- Envolver handlers em try/catch e retornar resposta padronizada no catch.
- Validar payload de entrada cedo, com erros 400 claros.
- Verificar autenticação/autorização antes de mutações.
- Em mutações administrativas, aplicar rate limit dedicado por usuário/ação.
- Nunca expor detalhes internos sensíveis em erro 500.

## 9) Padrões de interface e layout

### Estrutura de tela

- Área autenticada usa shell com Sidebar + Header + conteúdo rolável.
- O layout server exporta metadados; shell interativo fica em componente client.
- Carregamento inicial usa estados visuais consistentes com tema.

### Componentização

- Reutilizar primitives em src/components/ui antes de criar variantes locais.
- Variantes visuais devem ser modeladas com cva quando fizer sentido.
- Classe CSS deve passar por cn para merge previsível com Tailwind.

### Tema e design tokens

- Tokens globais vivem em src/app/globals.css com variáveis CSS.
- Sistema de tema é bidimensional:
	- mode (light/dark).
	- accent (violet, emerald, cobalt, amber, rose).
- Novas telas devem usar tokens existentes (background, card, primary, muted etc.).

## 10) i18n e textos

- Locale padrão do app é pt-BR.
- Mensagens centralizadas em src/i18n/messages/pt-BR.json.
- Para texto de interface, preferir chaves de tradução com useTranslation().
- Chaves seguem estrutura hierárquica por domínio (common, auth, navigation, etc.).
- Evitar texto hardcoded em componentes, exceto quando estritamente técnico.

## 11) Tipos e contratos de domínio

- Tipos compartilhados devem ficar em src/types/index.ts quando usados por múltiplos módulos.
- Preservar comentários de migração/legado nos tipos, pois eles documentam decisões de compatibilidade.
- Ao evoluir schema, atualizar tipos e chamadas Supabase no mesmo ciclo de mudança.

## 12) Testes

- Framework padrão: Vitest.
- Convenção: arquivo vizinho ao módulo testado com sufixo .test.ts.
- Cobrir especialmente:
	- utilitários puros.
	- normalização/validação.
	- regras de rate limit.
	- integrações de domínio que transformam payload.
- Em testes temporais, usar fake timers de Vitest.

## 13) Migrações e SQL

- Migrações ficam em supabase/migrations com prefixo numérico crescente e nome descritivo.
- Evitar mudanças de lógica de autorização só no frontend.
- Regras críticas devem residir no banco (RLS, constraints, funções RPC).

## 14) Checklist operacional para agentes

Antes de codar:

1. Identificar domínio alvo (auth, dashboard, contacts, flows, api etc.).
2. Localizar padrão existente no próprio domínio e reutilizar.
3. Definir se a execução será client, server RLS ou service role.
4. Validar impacto em account_id, permissões e i18n.

Durante a implementação:

1. Manter naming e estilo do arquivo alterado.
2. Reusar componentes de UI e utilitários existentes.
3. Escrever validações explícitas e mensagens de erro claras.
4. Preservar comentários de contexto já existentes.

Após implementar:

1. Rodar lint, typecheck e testes relevantes.
2. Verificar fluxo autenticado e não autenticado quando aplicável.
3. Revisar se houve hardcode de texto sem i18n.
4. Confirmar que tenancy e autorização não foram regressados.

## 15) Comandos de validação recomendados

- pnpm lint
- pnpm typecheck
- pnpm test

Quando a mudança for de UI/rota:

- pnpm dev e validação manual da rota afetada.

## 16) Resumo executivo

Este projeto prioriza:

- Segurança por padrão (RLS + guards + validação + rate limit).
- Multi-tenant explícito por account_id.
- Componentização de UI com tokens de tema consistentes.
- TypeScript com contratos claros e documentação no código.
- Evolução incremental orientada a domínio, sem reescrita ampla desnecessária.
