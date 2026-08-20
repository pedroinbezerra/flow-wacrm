/**
 * Reativação de um número de WhatsApp que caiu do registro na Cloud API.
 *
 * Vive aqui, e não dentro do route handler, porque a **ordem** das chamadas
 * é a regra de negócio — e é justamente o que não dava para testar enquanto
 * ela estava enterrada em `POST /api/whatsapp/config`, entre autenticação e
 * acesso ao banco. O bug que motivou esta extração passou por 544 testes
 * verdes: cada chamada isolada estava correta, a sequência estava errada.
 *
 * Ver `docs/business-rules/reativacao-de-numero-e-pin-de-duas-etapas.md`.
 */

import { registerPhoneNumber, setTwoStepPin } from './meta-api'
import { generateTwoStepPin } from './two-step-pin'

export interface ReactivatePhoneNumberArgs {
  phoneNumberId: string
  accessToken: string
  /** PIN trazido pelo usuário. Ausente = o produto sorteia um. */
  pin?: string
}

export interface ReactivatePhoneNumberResult {
  /**
   * PIN sorteado nesta chamada, para ser devolvido ao usuário UMA vez.
   * `null` quando o usuário trouxe o próprio PIN.
   *
   * Vem preenchido **mesmo quando `error` não é nulo**: o `/register`
   * grava o PIN como parte do próprio ato, então uma falha posterior não
   * significa que o PIN antigo sobreviveu. Devolver um erro sem o PIN
   * deixaria o usuário sem número e sem credencial — a pior saída
   * possível desta tela.
   */
  generatedPin: string | null
  registered: boolean
  /** Meta respondeu que o número já estava registrado neste app. */
  alreadyRegistered: boolean
  /** Mensagem da Meta, verbatim, quando a reativação não completou. */
  error: string | null
}

/** Erros da Meta que indicam problema com o PIN, e não com o estado do número. */
function isPinProblem(message: string): boolean {
  return /pin|two.?step/i.test(message)
}

export async function reactivatePhoneNumber(
  args: ReactivatePhoneNumberArgs
): Promise<ReactivatePhoneNumberResult> {
  const { phoneNumberId, accessToken } = args

  const userSuppliedPin = args.pin?.trim()
  const effectivePin = userSuppliedPin || generateTwoStepPin()
  const generatedPin = userSuppliedPin ? null : effectivePin

  try {
    // O /register vem PRIMEIRO, e não depois de um setTwoStepPin.
    // Verificado contra a API real: `POST /{phone_number_id}` com `{ pin }`
    // é operação de *trocar* o PIN de um número já registrado. Num número
    // fora do ar — que é exatamente o caso desta função — a Meta responde
    // "The account is not registered" e nada é reativado. Quem estabelece
    // o PIN de um número que está entrando no ar é o próprio /register.
    const result = await registerPhoneNumber({
      phoneNumberId,
      accessToken,
      pin: effectivePin,
    })
    return {
      generatedPin,
      registered: true,
      alreadyRegistered: result.alreadyRegistered,
      error: null,
    }
  } catch (registerErr) {
    const message =
      registerErr instanceof Error ? registerErr.message : String(registerErr)

    // Caminho do número que a Meta considera registrado mas cujo PIN o
    // cliente não tem: aí sim o setTwoStepPin funciona (ele exige número
    // registrado) e o /register merece uma segunda tentativa.
    if (!isPinProblem(message)) {
      return {
        generatedPin,
        registered: false,
        alreadyRegistered: false,
        error: message,
      }
    }

    try {
      await setTwoStepPin({ phoneNumberId, accessToken, pin: effectivePin })
      const retry = await registerPhoneNumber({
        phoneNumberId,
        accessToken,
        pin: effectivePin,
      })
      return {
        generatedPin,
        registered: true,
        alreadyRegistered: retry.alreadyRegistered,
        error: null,
      }
    } catch (retryErr) {
      return {
        generatedPin,
        registered: false,
        alreadyRegistered: false,
        error:
          retryErr instanceof Error ? retryErr.message : String(retryErr),
      }
    }
  }
}
