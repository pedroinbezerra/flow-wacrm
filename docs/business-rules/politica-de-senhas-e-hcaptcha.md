# Regra de Negócio e Segurança: Política de Senhas e hCaptcha

Este documento especifica os padrões de segurança de autenticação do FlowHub, cobrindo a complexidade de senhas, a verificação contra senhas vazadas (HIBP) e a proteção bot via hCaptcha.

---

## 1. Contexto e Motivação

Com a evolução das ameaças cibernéticas (ataques de força bruta, dicionário e *credential stuffing* utilizando vazamentos mundiais de dados), o FlowHub adotou o nível mais elevado de proteção de senhas disponível na plataforma Supabase Auth.

Link de Referência Oficial:
[Supabase Auth Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## 2. Requisitos de Complexidade de Senhas

Toda nova senha criada no sistema — seja no cadastro (`/signup`), redefinição via e-mail (`/reset-password`) ou alteração nas configurações do perfil (`/settings`) — **DEVE** atender aos seguintes critérios concomitantes:

- **Tamanho Mínimo**: 8 caracteres.
- **Tamanho Máximo**: 72 caracteres.
- **Letra Maiúscula**: Pelo menos 1 caractere em caixa alta (`A-Z`).
- **Letra Minúscula**: Pelo menos 1 caractere em caixa baixa (`a-z`).
- **Dígito Numérico**: Pelo menos 1 número (`0-9`).
- **Caractere Especial / Símbolo**: Pelo menos 1 símbolo (ex: `!@#$%^&*()_+-=[]{}|;:',.<>?/` ou qualquer não-alfanumérico).

### Interface do Usuário (Checklist em Tempo Real)
Para garantir clareza antes do envio do formulário, as páginas apresentam o componente `PasswordRequirements`, que valida dinamicamente cada critério à medida que o usuário digita a senha.

---

## 3. Proteção Contra Senhas Vazadas (Have I Been Pwned / HIBP)

O Supabase Auth está configurado para verificar cada tentativa de definição ou alteração de senha contra a base de dados pública do **Have I Been Pwned (HIBP)**.

- Se a senha inserida pelo usuário constar em vazamentos conhecidos de dados, o backend do Supabase Auth rejeitará a senha com o código `weak_password` ou mensagem associada a vazamento.
- O utilitário `parseSupabasePasswordError` na camada cliente interpreta essa resposta e exibe uma mensagem amigável e explicativa em português:
  > *"Esta senha foi exposta em vazamentos de dados conhecidos e não é segura. Por razões de segurança, escolha uma senha diferente."*

---

## 4. Integração hCaptcha

Para evitar criação automatizada de contas e ataques de força bruta aos formulários de autenticação:

- **Variável de Ambiente**: `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`.
- **Formulários Mapeados**: Login (`/login`), Cadastro (`/signup`), Recuperação de Senha (`/forgot-password`).
- **Token de Verificação**: Transmitido no objeto de opções das chamadas SDK do Supabase Auth (`signUp`, `signInWithPassword`, `resetPasswordForEmail`).
- **Comportamento sem Chave (Dev)**: Se a variável `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` não for configurada no ambiente (ex: desenvolvimento local), o widget hCaptcha é ignorado sem interromper a experiência do desenvolvedor.

---

## 5. Implementação no Código

- Utilitário de política de senha: [`src/lib/auth/password-policy.ts`](file:///c:/Users/pedro/GitHub/Flow/flow-wacrm/src/lib/auth/password-policy.ts)
- Componente de requisitos visuais: [`src/components/auth/password-requirements.tsx`](file:///c:/Users/pedro/GitHub/Flow/flow-wacrm/src/components/auth/password-requirements.tsx)
- Componente hCaptcha: [`src/components/auth/hcaptcha.tsx`](file:///c:/Users/pedro/GitHub/Flow/flow-wacrm/src/components/auth/hcaptcha.tsx)
- Testes unitários: [`src/lib/auth/password-policy.test.ts`](file:///c:/Users/pedro/GitHub/Flow/flow-wacrm/src/lib/auth/password-policy.test.ts)
