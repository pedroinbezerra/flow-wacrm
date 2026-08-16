# Mapa de Evolução de Experiência — Central de Ajuda & FAQ (`/faq`)

| Campo | Valor |
| --- | --- |
| Área | Central de Ajuda & FAQ (`/faq`) |
| Arquétipo | Documental & Suporte Operacional (Knowledge Base & FAQ) — Volume II |
| Data | 2026-08-14 |
| Status | Implementado (Estado da Arte Web & Mobile) |

---

## 1. Contexto e Diagnóstico

A **Central de Ajuda & FAQ** é o portal de autoatendimento, esclarecimento de dúvidas e aprendizado contínuo dos usuários do FlowHub. Antes desta evolução, o FAQ apresentava um conjunto básico de perguntas e respostas, porém necessitava de alinhamento estrutural em:

1. **Defasagem de Conteúdo Relativo ao Produto**: Novas capacidades críticas — como **Transmissões Documentais** (`/processes/document-delivery`), **Direcionamento CRM**, **Aprovações Prévia de Envios** e **IA Copilot** — não possuíam cobertura na base de conhecimento.
2. **Conformidade de Copy com a Constituição (`FH-57.11`, `FH-57.12`, `FH-59.11`)**: Parte dos textos utilizava termos técnicos brutos ou descrições focadas na implementação em vez da consequência prática para o usuário ("Característica não é mensagem").
3. **Ergonomia e Fluência Visual Web & Mobile (Volume II — Arquétipo 6: Documental)**:
   - **Na Web (Desktop/Tablet)**: Necessidade de otimização da largura de leitura (60-75 caracteres), atalhos universais de teclado (`/`, `⌘K`, `Esc`), indicadores visuais laterais de expansão nos acordeões e hierarquia tipográfica refinada.
   - **No Mobile**: Empilhamento excessivo de categorias resolvida com carrossel horizontal deslizável (`snap-x`), zonas de toque ajustadas ($\ge 44\text{px}/48\text{px}$ — `FH-48`) e layout responsivo sem rolagem horizontal indesejada (`FH-37`).

---

## 2. Garantias Mantidas (Constituição do Produto)

- **Tenancy e Isolamento (`account_id`)**: Redirecionamento e dados de escopo mantidos sob context tenancy.
- **Segurança e Privacidade**: Nenhuma credencial ou token privado exposto nos guias; orientações claras sobre geração de Token Permanente (System User Token) via Meta Business Manager.
- **i18n Nativo (`pt-BR`)**: Todo o conteúdo é estruturado em português do Brasil com terminologia consistente em todo o produto.
- **Busca Tolerante a Erros (Trigram Matching)**: Utilização da inteligência de busca por trigramas (`pg_trgm`) para fornecer sugestões "Você quis dizer?" quando o usuário digita um termo com pequenos lapsos ortográficos.

---

## 3. As Reconstruções Implementadas

### A. Expansão e Reorganização do Catálogo de Conhecimento (`faq-data.ts`)
- **Transmissões Documentais & Processos (`document_delivery`)**: Orientações detalhadas sobre envio seguro de demonstrativos, relatórios e documentos com validação por código único e rastreabilidade de entrega.
- **Direcionamento CRM & Carteira (`crm_routing`)**: Explicação de como as conversas são roteadas automaticamente para o responsável do contato/deal ou equipe responsável.
- **Aprovações & Governança de Envio (`broadcasts`)**: Fluxo de aprovação prévia para disparos sensíveis em massa por administradores.
- **Inteligência Artificial & Copilot (`ai_assistant`)**: Como a IA sugere respostas rápidas sem comprometer o controle humano nem a privacidade dos dados.
- **Revisão Sistemática de Copy (`FH-57.11`, `FH-57.12`)**: Reescrita de todas as respostas para focar na utilidade operacional, clareza e ritmo de trabalho.

### B. Interface Elevada, Ergonomia Web & Responsividade Mobile (`faq-content.tsx`)
- **Experiência Web de Estado da Arte**:
  - Largura de leitura contínua (60–75 caracteres nas respostas — `FH-30.03`) impedindo que o texto se espalhe excessivamente em monitores ultra-wide.
  - Atalhos universais de teclado (`/` ou `⌘K` / `Ctrl+K` para focar o campo de busca; `Esc` para limpar busca e filtros).
  - Acordeões com barra vertical animada de estado ativo, indicador de expansão visual e numeradores de passos estilizados com acento `primary`.
  - Badges dinâmicos mostrando o número exato de perguntas por categoria.
- **Experiência Mobile de Estado da Arte (Touch-First Ergonomics — FH-37 & FH-48)**:
  - Carrossel horizontal deslizável com snap suave (`snap-x overflow-x-auto scrollbar-none`) para as pílulas de categoria, permitindo navegação rápida sem obstruir a visão inicial.
  - Zonas de toque dimensionadas confortavelmente (mínimo de 44px/48px) para botões de busca, limpeza, filtros e acionadores de acordeão.
  - Botões de ação e links de rota com largura total no mobile (`w-full sm:w-auto`).
- **Sugestões Trigram / "Você quis dizer?"**: Painel interativo com badges clicáveis de termos sugeridos em tempo real via algoritmo de trigramas.
- **Rodapé de Tour Guiado Contextual**: Layout adaptativo para telas pequenas e grandes com acionamento direto do Tour Guiado.

---

## 4. Bloco de Conformidade (`FH-68.02`)

```
[FH-68.02 CONFORMIDADE DE IMPLEMENTAÇÃO]
- Constituição: Respeitada (FH-08.06, FH-24.01, FH-29.04, FH-30.03, FH-37, FH-48, FH-57.11, FH-57.12, FH-59.11)
- Direção Artística (Volume II): Arquétipo 6 (Documental & Suporte Operacional) aplicado integralmente
- Responsividade: Estado da arte Web (Desktop/Tablet) e Mobile (Touch-First, snap-x)
- i18n & Naming: pt-BR estrito sem hardcode técnico no copy
- Testes: Suíte Vitest trigram-search validada
```
