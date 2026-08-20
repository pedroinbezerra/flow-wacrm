import { describe, expect, it } from 'vitest';
import {
  evaluateTemplateAvailability,
  isTemplateMissingAtMetaError,
  STATUSES_CLAIMING_META_COUNTERPART,
  TEMPLATE_MISSING_STATUS,
} from './template-availability';

describe('isTemplateMissingAtMetaError', () => {
  it('reconhece o 132001 como veio da pilha de envio', () => {
    expect(
      isTemplateMissingAtMetaError(
        'Meta API error: (#132001) Template name does not exist in the translation',
      ),
    ).toBe(true);
  });

  it('reconhece o codigo sem cerquilha', () => {
    expect(isTemplateMissingAtMetaError('Error (132001) from Meta')).toBe(true);
  });

  it('reconhece pelo texto quando a Meta omite o codigo', () => {
    expect(
      isTemplateMissingAtMetaError('Template name does not exist in the translation'),
    ).toBe(true);
  });

  it('nao confunde erro de parametro com modelo inexistente', () => {
    expect(
      isTemplateMissingAtMetaError(
        'Meta API error: (#132000) Number of parameters does not match',
      ),
    ).toBe(false);
    expect(
      isTemplateMissingAtMetaError('Meta API error: (#132015) Template is paused'),
    ).toBe(false);
  });

  it('tolera mensagem vazia', () => {
    expect(isTemplateMissingAtMetaError('')).toBe(false);
  });
});

describe('evaluateTemplateAvailability', () => {
  it('libera o caminho legado quando nao ha linha local', () => {
    expect(
      evaluateTemplateAvailability({ template: null, activeWabaId: 'WABA_B' }),
    ).toEqual({ sendable: true });
  });

  it('bloqueia modelo ja reconciliado como ausente', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: TEMPLATE_MISSING_STATUS, waba_id: 'WABA_A' },
        activeWabaId: 'WABA_A',
      }),
    ).toEqual({ sendable: false, reason: 'missing' });
  });

  it('bloqueia modelo de outra WABA — o caso da troca de numero', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: 'APPROVED', waba_id: 'WABA_A', meta_template_id: '1' },
        activeWabaId: 'WABA_B',
      }),
    ).toEqual({ sendable: false, reason: 'foreign_waba' });
  });

  it('libera modelo da propria WABA', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: 'APPROVED', waba_id: 'WABA_A', meta_template_id: '1' },
        activeWabaId: 'WABA_A',
      }),
    ).toEqual({ sendable: true });
  });

  it('nao inventa origem: waba_id nulo passa e deixa a Meta decidir', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: 'APPROVED', waba_id: null, meta_template_id: '1' },
        activeWabaId: 'WABA_B',
      }),
    ).toEqual({ sendable: true });
  });

  it('nao bloqueia por status possivelmente defasado', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: 'PENDING', waba_id: 'WABA_A' },
        activeWabaId: 'WABA_A',
      }),
    ).toEqual({ sendable: true });
  });

  it('nao bloqueia quando a conexao nao tem WABA registrada', () => {
    expect(
      evaluateTemplateAvailability({
        template: { status: 'APPROVED', waba_id: 'WABA_A' },
        activeWabaId: null,
      }),
    ).toEqual({ sendable: true });
  });
});

describe('STATUSES_CLAIMING_META_COUNTERPART', () => {
  it('nao inclui DRAFT — modelo local nunca prometeu existir na Meta', () => {
    expect(STATUSES_CLAIMING_META_COUNTERPART).not.toContain('DRAFT');
  });

  it('nao inclui MISSING — reconciliar de novo o que ja esta ausente e ruido', () => {
    expect(STATUSES_CLAIMING_META_COUNTERPART as readonly string[]).not.toContain(
      TEMPLATE_MISSING_STATUS,
    );
  });

  it('inclui APPROVED, o estado que gerava o envio quebrado', () => {
    expect(STATUSES_CLAIMING_META_COUNTERPART).toContain('APPROVED');
  });
});
