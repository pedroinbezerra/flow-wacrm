import { describe, expect, it } from 'vitest';
import { getIdentityClass, getInitials } from './avatar';

describe('getInitials', () => {
  it('usa primeiro nome e sobrenome', () => {
    expect(getInitials('Ana Beatriz Carvalho')).toBe('AC');
  });

  it('ignora partícula ao escolher o sobrenome', () => {
    expect(getInitials('Bruno de Almeida')).toBe('BA');
    expect(getInitials('Gabriela da Rocha')).toBe('GR');
    expect(getInitials('Ana dos Santos')).toBe('AS');
  });

  it('cai para o último termo quando só há partículas depois do primeiro nome', () => {
    expect(getInitials('Maria de')).toBe('MD');
  });

  it('usa duas letras quando o nome tem uma palavra só', () => {
    expect(getInitials('Wanderlei')).toBe('WA');
  });

  it('descarta emoji e pontuação em vez de fatiar par surrogate', () => {
    expect(getInitials('🔥 Iara Mendes')).toBe('IM');
    expect(getInitials('🔥')).toBe('?');
    expect(getInitials('•Ana•')).toBe('AN');
  });

  it('preserva acento na maiúscula', () => {
    expect(getInitials('Ângela Ésper')).toBe('ÂÉ');
  });

  it('cai para os dois últimos dígitos do telefone', () => {
    expect(getInitials(null, '+55 11 98877-6655')).toBe('55');
    expect(getInitials('   ', '+55 11 98877-6680')).toBe('80');
  });

  it('devolve ? sem nome nem telefone', () => {
    expect(getInitials()).toBe('?');
    expect(getInitials(null, 'sem-digitos')).toBe('?');
  });
});

describe('getIdentityClass', () => {
  it('é estável para a mesma semente', () => {
    expect(getIdentityClass('Ana Beatriz Carvalho')).toBe(
      getIdentityClass('Ana Beatriz Carvalho')
    );
  });

  it('ignora caixa e espaço em volta — mesma pessoa, mesma cor em toda tela', () => {
    expect(getIdentityClass('  ana beatriz carvalho ')).toBe(
      getIdentityClass('Ana Beatriz Carvalho')
    );
  });

  it('fica dentro dos oito matizes declarados', () => {
    const seeds = ['a', 'bb', 'ccc', 'Zoe', '+5511988887777', 'Wënder', ''];
    for (const seed of seeds) {
      expect(getIdentityClass(seed)).toMatch(/^avatar-identity-[1-8]$/);
    }
  });
});
