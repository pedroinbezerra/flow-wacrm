import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerPhoneNumber = vi.fn();
const setTwoStepPin = vi.fn();

vi.mock('./meta-api', () => ({
  registerPhoneNumber: (...a: unknown[]) => registerPhoneNumber(...a),
  setTwoStepPin: (...a: unknown[]) => setTwoStepPin(...a),
}));

import { reactivatePhoneNumber } from './reactivation';

/** Ordem real das chamadas à Meta, na sequência em que aconteceram. */
const callOrder: string[] = [];

beforeEach(() => {
  callOrder.length = 0;
  registerPhoneNumber.mockReset();
  setTwoStepPin.mockReset();
  registerPhoneNumber.mockImplementation(async () => {
    callOrder.push('register');
    return { success: true, alreadyRegistered: false };
  });
  setTwoStepPin.mockImplementation(async () => {
    callOrder.push('setPin');
  });
});

const ARGS = { phoneNumberId: 'PNID_1', accessToken: 'tok' };

describe('reactivatePhoneNumber — ordem das chamadas', () => {
  // Esta é a regressão que 544 testes verdes não pegaram. O código
  // chamava setTwoStepPin ANTES de registrar; a Meta responde
  // "The account is not registered" porque trocar PIN exige número
  // registrado — ou seja, o fluxo falhava exatamente no cenário para o
  // qual existe. Se alguém reintroduzir aquela ordem, este teste quebra.
  it('chama /register ANTES de setTwoStepPin, nunca o contrário', async () => {
    await reactivatePhoneNumber(ARGS);
    expect(callOrder).toEqual(['register']);
    expect(setTwoStepPin).not.toHaveBeenCalled();
  });

  it('não toca em setTwoStepPin quando o registro passa de primeira', async () => {
    const result = await reactivatePhoneNumber(ARGS);
    expect(result.registered).toBe(true);
    expect(result.error).toBeNull();
    expect(setTwoStepPin).toHaveBeenCalledTimes(0);
  });

  it('leva o PIN sorteado no próprio /register — é ele que grava o PIN', async () => {
    const result = await reactivatePhoneNumber(ARGS);
    expect(registerPhoneNumber).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumberId: 'PNID_1',
        accessToken: 'tok',
        pin: result.generatedPin,
      }),
    );
  });
});

describe('reactivatePhoneNumber — fallback de PIN', () => {
  it('cai para setTwoStepPin + novo /register quando a Meta reclama do PIN', async () => {
    registerPhoneNumber.mockImplementationOnce(async () => {
      callOrder.push('register');
      throw new Error('Two-step verification PIN required.');
    });
    const result = await reactivatePhoneNumber(ARGS);
    expect(callOrder).toEqual(['register', 'setPin', 'register']);
    expect(result.registered).toBe(true);
    expect(result.error).toBeNull();
  });

  it('NÃO tenta o fallback quando o erro é de estado, não de PIN', async () => {
    // "The account is not registered" foi a resposta real da Meta ao
    // setTwoStepPin. Insistir nele aqui só repetiria a chamada que já
    // sabemos que falha para um número fora do ar.
    registerPhoneNumber.mockImplementationOnce(async () => {
      callOrder.push('register');
      throw new Error('The account is not registered');
    });
    const result = await reactivatePhoneNumber(ARGS);
    expect(callOrder).toEqual(['register']);
    expect(setTwoStepPin).not.toHaveBeenCalled();
    expect(result.registered).toBe(false);
    expect(result.error).toMatch(/not registered/);
  });
});

describe('reactivatePhoneNumber — o PIN sobrevive à falha', () => {
  // A garantia declarada na §2 do documento de regra de negócio: o
  // /register grava o PIN como parte do ato, então uma falha depois disso
  // não devolve o PIN antigo. Esconder o novo deixaria o usuário sem
  // número E sem credencial.
  it('devolve o PIN sorteado mesmo quando o registro falha', async () => {
    registerPhoneNumber.mockImplementation(async () => {
      callOrder.push('register');
      throw new Error('Some Meta failure');
    });
    const result = await reactivatePhoneNumber(ARGS);
    expect(result.registered).toBe(false);
    expect(result.generatedPin).toMatch(/^\d{6}$/);
  });

  it('devolve o PIN sorteado quando o fallback também falha', async () => {
    registerPhoneNumber.mockImplementation(async () => {
      callOrder.push('register');
      throw new Error('Two-step verification PIN mismatch');
    });
    const result = await reactivatePhoneNumber(ARGS);
    expect(callOrder).toEqual(['register', 'setPin', 'register']);
    expect(result.registered).toBe(false);
    expect(result.generatedPin).toMatch(/^\d{6}$/);
  });
});

describe('reactivatePhoneNumber — PIN trazido pelo usuário', () => {
  it('usa o PIN informado e não devolve nada para anotar', async () => {
    const result = await reactivatePhoneNumber({ ...ARGS, pin: '135790' });
    expect(registerPhoneNumber).toHaveBeenCalledWith(
      expect.objectContaining({ pin: '135790' }),
    );
    // Não é segredo novo: o usuário já o conhece, não há o que anotar.
    expect(result.generatedPin).toBeNull();
  });

  it('sorteia um PIN quando o campo vem em branco', async () => {
    const result = await reactivatePhoneNumber({ ...ARGS, pin: '   ' });
    expect(result.generatedPin).toMatch(/^\d{6}$/);
  });

  it('propaga alreadyRegistered para a camada de cima', async () => {
    registerPhoneNumber.mockImplementationOnce(async () => {
      callOrder.push('register');
      return { success: true, alreadyRegistered: true };
    });
    const result = await reactivatePhoneNumber(ARGS);
    expect(result.alreadyRegistered).toBe(true);
    expect(result.registered).toBe(true);
  });
});
