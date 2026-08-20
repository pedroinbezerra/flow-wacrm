import { describe, expect, it } from 'vitest';
import { generateTwoStepPin, isWeakTwoStepPin } from './two-step-pin';

describe('isWeakTwoStepPin', () => {
  it('rejeita seis dígitos iguais', () => {
    expect(isWeakTwoStepPin('000000')).toBe(true);
    expect(isWeakTwoStepPin('777777')).toBe(true);
  });

  it('rejeita sequências corridas nos dois sentidos', () => {
    expect(isWeakTwoStepPin('123456')).toBe(true);
    expect(isWeakTwoStepPin('654321')).toBe(true);
    expect(isWeakTwoStepPin('456789')).toBe(true);
  });

  it('rejeita qualquer coisa que não seja exatamente 6 dígitos', () => {
    // A Meta exige 6 dígitos; tratar o formato errado como fraco evita
    // que um valor inválido escape do gerador para dentro da chamada.
    expect(isWeakTwoStepPin('12345')).toBe(true);
    expect(isWeakTwoStepPin('1234567')).toBe(true);
    expect(isWeakTwoStepPin('12a456')).toBe(true);
    expect(isWeakTwoStepPin('')).toBe(true);
  });

  it('aceita um PIN comum', () => {
    expect(isWeakTwoStepPin('482910')).toBe(false);
    // Zero à esquerda é PIN válido — não pode ser confundido com número.
    expect(isWeakTwoStepPin('048291')).toBe(false);
  });
});

describe('generateTwoStepPin', () => {
  it('sempre devolve 6 dígitos e nunca um PIN previsível', () => {
    for (let i = 0; i < 500; i++) {
      const pin = generateTwoStepPin();
      expect(pin).toMatch(/^\d{6}$/);
      expect(isWeakTwoStepPin(pin)).toBe(false);
    }
  });

  it('não repete o mesmo valor a cada chamada', () => {
    // Sem isto, um gerador quebrado que devolvesse constante passaria
    // em todos os testes acima.
    const pins = new Set(Array.from({ length: 50 }, () => generateTwoStepPin()));
    expect(pins.size).toBeGreaterThan(40);
  });
});
