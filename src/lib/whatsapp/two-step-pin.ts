import { randomInt } from 'node:crypto'

/**
 * PIN de verificação em duas etapas do número na Meta.
 *
 * A Meta nunca devolve o PIN vigente — não há endpoint de leitura, e o
 * Gerenciador do WhatsApp também não o exibe. Ele só pode ser escrito.
 * Como gravar um novo não exige o anterior, a saída para reativar um
 * número é gerar um PIN aqui em vez de pedir ao usuário um segredo que
 * ele não tem como consultar em lugar nenhum.
 */

/**
 * PIN previsível: seis dígitos iguais (`000000`) ou uma sequência
 * corrida (`123456`, `654321`). São os primeiros palpites de quem
 * tenta adivinhar, e o sorteio uniforme pode cair neles.
 */
export function isWeakTwoStepPin(pin: string): boolean {
  if (!/^\d{6}$/.test(pin)) return true
  if (/^(\d)\1{5}$/.test(pin)) return true
  const digits = pin.split('').map(Number)
  const ascending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1)
  const descending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1)
  return ascending || descending
}

/**
 * Sorteia um PIN de 6 dígitos com `crypto.randomInt` (CSPRNG, sem viés
 * de módulo) e descarta os previsíveis. O conjunto rejeitado tem ~20
 * valores em um milhão, então o laço termina na primeira tentativa em
 * praticamente todos os casos.
 */
export function generateTwoStepPin(): string {
  for (;;) {
    const pin = String(randomInt(0, 1_000_000)).padStart(6, '0')
    if (!isWeakTwoStepPin(pin)) return pin
  }
}
