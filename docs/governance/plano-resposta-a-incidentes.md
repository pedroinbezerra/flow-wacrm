# Plano de Resposta a Incidentes de Segurança e Vazamento de Dados

**Controlador/Operador:** FLOW SYSTEMS LTDA — CNPJ 62.479.299/0001-66
**Encarregado (DPO):** flowsystems@flowofc.com.br
**Fundamento legal:** Art. 46 e 48 da Lei 13.709/2018 (LGPD)

Este documento estrutura o processo interno da Flow Hub para detectar,
conter, avaliar e comunicar incidentes de segurança que envolvam dados
pessoais — tanto os da própria Flow Hub quanto os dos clientes (contas)
e dos contatos finais que trafegam pela plataforma.

Está com papéis propositalmente enxutos, compatíveis com o tamanho atual
do time. Ajuste os nomes/contatos nos campos marcados com `[preencher]`
antes de considerar o documento ativo.

---

## 1. O que conta como incidente

Qualquer evento que comprometa a confidencialidade, integridade ou
disponibilidade de dados pessoais tratados pela plataforma. Para dar
concretude, alguns cenários reais do stack da Flow Hub que **contam**
como incidente:

- Vazamento ou comprometimento de uma chave de API (token do WhatsApp
  de um cliente, chave de IA/OpenAI de um cliente, `ENCRYPTION_KEY`,
  `ASAAS_API_KEY`, credenciais do Supabase/Vercel).
- Reabertura acidental de um bucket de Storage como público (já
  aconteceu uma vez neste projeto — `ai-service-media` — antes de ser
  corrigido).
- Acesso ou alteração de dados de uma conta por alguém fora dela
  (falha de RLS, bug de autorização como o que corrigimos nos
  endpoints de LGPD).
- Uso indevido do papel de Super Admin (acesso, exportação ou alteração
  de dados de clientes sem justificativa de suporte).
- Comprometimento de credenciais de um funcionário/desenvolvedor com
  acesso ao Supabase, Vercel, Asaas ou repositório de código.
- Envio de dados de um cliente para o ambiente/conta de outro (erro de
  escopo de tenant).
- Qualquer acesso não autorizado confirmado ao banco de dados de
  produção.

Na dúvida se algo é incidente, trate como incidente até prova em
contrário — é mais barato encerrar cedo um caso que não precisava do
que descobrir tarde um que precisava.

## 2. Papéis e responsabilidades

| Papel | Quem | Responsabilidade |
| --- | --- | --- |
| Responsável pela decisão (Incident Owner) | `[preencher — Pedro?]` | Decide severidade, decide se notifica ANPD/titulares, autoriza comunicação externa |
| Responsável técnico | `[preencher — desenvolvedor]` | Contém o incidente, investiga causa raiz, executa remediação |
| Encarregado (DPO) | flowsystems@flowofc.com.br | Ponto de contato oficial com ANPD e titulares; avalia impacto sob a ótica da LGPD |

Numa estrutura pequena, a mesma pessoa pode acumular mais de um papel —
o que importa é que sempre haja alguém explicitamente responsável por
decidir e alguém por executar, mesmo que seja a mesma pessoa em papéis
diferentes.

## 3. Fluxo de resposta

1. **Detecção.** Qualquer pessoa do time (ou um alerta automatizado, uma
   vez que exista observabilidade — ver Etapa 7) que suspeitar de um
   incidente deve reportar imediatamente ao Responsável Técnico e ao
   Incident Owner, por qualquer canal direto (não esperar reunião ou
   ticket formal).
2. **Contenção inicial (meta: o quanto antes, idealmente em horas, não
   dias).** Ação imediata para estancar o problema: revogar/rotacionar a
   credencial exposta, reverter a policy/migration causadora, suspender
   acesso do usuário/conta envolvida, tirar o bucket do ar, etc. Não é
   preciso entender a causa raiz completa antes de conter.
3. **Avaliação de severidade (meta: até 24h após a detecção).** O
   Incident Owner, com apoio do Encarregado, classifica o incidente:
   - **Baixo**: sem exposição real de dados pessoais (ex: chave rotacionada
     antes de qualquer uso indevido confirmado).
   - **Médio**: exposição confirmada, mas de escopo limitado (poucos
     registros, dado não sensível) ou com evidência de que ninguém além
     do time acessou.
   - **Alto**: exposição confirmada de dados pessoais (potencialmente
     sensíveis) de um número relevante de titulares, ou qualquer
     evidência de acesso por terceiro não autorizado.
4. **Decisão de notificação (meta: até 72h após confirmação do
   incidente, referência de boas práticas — a LGPD não fixa um prazo
   numérico exato como o GDPR, mas exige comunicação em "prazo
   razoável").** Incidentes classificados como **Médio** ou **Alto**
   exigem avaliação formal do Encarregado sobre notificar a ANPD e os
   titulares afetados, conforme Art. 48. Incidentes **Alto** com dados
   sensíveis ou risco relevante de dano devem presumir notificação,
   salvo justificativa documentada em contrário.
5. **Notificação.** Quando decidido notificar:
   - **ANPD**: pelo canal oficial do órgão, descrevendo natureza dos
     dados, titulares afetados, medidas técnicas adotadas antes e depois
     do incidente, e riscos envolvidos.
   - **Titulares afetados**: comunicação direta (e-mail/WhatsApp
     cadastrado) em linguagem clara, explicando o que aconteceu, quais
     dados foram envolvidos, o que já foi feito, e o canal para dúvidas
     (flowsystems@flowofc.com.br).
   - Se o incidente afeta dados de contatos de um cliente (ex: vazamento
     de conversas de uma conta específica), o cliente (controlador
     daqueles dados, conforme o enquadramento já definido na Etapa 1)
     também deve ser avisado diretamente e sem atraso, para que ele
     decida suas próprias obrigações de notificação.
6. **Remediação e correção definitiva.** Corrigir a causa raiz (não só o
   sintoma), com registro de qual mudança de código/infra resolveu.
7. **Encerramento e lições aprendidas.** Registrar o incidente (seção 4),
   e se a causa raiz revelar um padrão (ex: falta de teste que pegaria o
   bug antes), avaliar se vale virar checklist/regra permanente.

## 4. Registro do incidente

Manter um registro simples (pode ser uma planilha ou tabela interna) com,
no mínimo: data/hora da detecção, o que aconteceu, severidade, dados
envolvidos, contas/titulares afetados, se houve notificação (e quando),
causa raiz, e correção aplicada. Esse histórico é o que demonstra
accountability perante a ANPD caso seja auditado no futuro (princípio da
responsabilização e prestação de contas, Art. 6º, X da LGPD).

## 5. Observação

Este plano depende do item de observabilidade registrado como pendência
na Etapa 7 (hoje só há logs padrão do Vercel, sem alerta automatizado) —
sem monitoramento ativo, a etapa de "Detecção" fica dependente de alguém
notar manualmente. Vale reavaliar isso junto com a decisão de
observabilidade dedicada.
