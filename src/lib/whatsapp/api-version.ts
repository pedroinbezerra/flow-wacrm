/**
 * Versão da Graph API usada em todo o produto — chamadas de servidor e
 * `FB.init` do SDK JS.
 *
 * Vive em módulo próprio, e não dentro de `meta-api.ts`, porque a tela de
 * configuração é client component e precisa do valor para inicializar o
 * SDK; importar `meta-api.ts` de lá arrastaria todo o cliente HTTP da Meta
 * para o bundle do navegador.
 *
 * Calendário (conferido em 20/08/2026): a `v21.0` usada antes expira em
 * 21/01/2027; a `v25.0` expira em 29/07/2028. Ao subir de novo, subir
 * **aqui** — o projeto já teve três cópias desta constante espalhadas, e
 * duas ficaram para trás na primeira tentativa de atualização.
 */
export const META_API_VERSION = 'v25.0'
export const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`
