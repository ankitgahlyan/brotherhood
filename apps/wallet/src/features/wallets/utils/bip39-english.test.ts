import { describe, expect, it } from 'bun:test';
import {
  extractMnemonicWordsFromPaste,
  applyMnemonicPaste,
  evaluateBip39Slots,
  isImportableBip39,
} from './bip39-english';

describe('extractMnemonicWordsFromPaste', () => {
  it('extracts words separated by single and multiple spaces', () => {
    const text = 'apple   banana    cherry   dog';
    expect(extractMnemonicWordsFromPaste(text)).toEqual([
      'apple',
      'banana',
      'cherry',
      'dog',
    ]);
  });

  it('extracts words separated by newlines and carriage returns', () => {
    const text = 'apple\nbanana\r\ncherry\ndog';
    expect(extractMnemonicWordsFromPaste(text)).toEqual([
      'apple',
      'banana',
      'cherry',
      'dog',
    ]);
  });

  it('extracts words from numbered lists', () => {
    const text = '1. apple\n2. banana\n3. cherry\n4. dog';
    expect(extractMnemonicWordsFromPaste(text)).toEqual([
      'apple',
      'banana',
      'cherry',
      'dog',
    ]);
  });

  it('handles comma-separated and semicolon-separated words', () => {
    const text = 'apple, banana; cherry, dog';
    expect(extractMnemonicWordsFromPaste(text)).toEqual([
      'apple',
      'banana',
      'cherry',
      'dog',
    ]);
  });

  it('returns empty array for whitespace or non-alpha input', () => {
    expect(extractMnemonicWordsFromPaste('')).toEqual([]);
    expect(extractMnemonicWordsFromPaste('   \n\t  ')).toEqual([]);
    expect(extractMnemonicWordsFromPaste('123 456 !@#')).toEqual([]);
  });
});

describe('applyMnemonicPaste', () => {
  const empty24 = Array(24).fill('');

  const full24Words = [
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    'absent',
    'absorb',
    'abstract',
    'absurd',
    'abuse',
    'access',
    'accident',
    'account',
    'accuse',
    'achieve',
    'acid',
    'acoustic',
    'acquire',
    'across',
    'act',
    'action',
    'actor',
    'actress',
    'actual',
  ];

  const full12Words = [
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    'absent',
    'absorb',
    'abstract',
    'absurd',
    'abuse',
    'access',
    'accident',
  ];

  it('pastes 24 words into cell 0 correctly', () => {
    const result = applyMnemonicPaste(empty24, 0, full24Words);
    expect(result.nextWords).toEqual(full24Words);
    expect(result.focusIndex).toBe(23);
  });

  it('pastes 24 words into any arbitrary cell (e.g. index 7 or 23) from index 0 without truncation', () => {
    const resultFrom7 = applyMnemonicPaste(empty24, 7, full24Words);
    expect(resultFrom7.nextWords).toEqual(full24Words);
    expect(resultFrom7.focusIndex).toBe(23);

    const resultFrom23 = applyMnemonicPaste(empty24, 23, full24Words);
    expect(resultFrom23.nextWords).toEqual(full24Words);
    expect(resultFrom23.focusIndex).toBe(23);
  });

  it('pastes 12 words into any arbitrary cell (e.g. index 5) from index 0', () => {
    const resultFrom5 = applyMnemonicPaste(empty24, 5, full12Words);
    expect(resultFrom5.nextWords.slice(0, 12)).toEqual(full12Words);
    expect(resultFrom5.nextWords.slice(12)).toEqual(Array(12).fill(''));
    expect(resultFrom5.focusIndex).toBe(11);
  });

  it('pastes a few words in place when they fit within the remaining cells', () => {
    const initial = [...empty24];
    initial[0] = 'first';
    const result = applyMnemonicPaste(initial, 2, [
      'apple',
      'banana',
      'cherry',
    ]);
    expect(result.nextWords[0]).toBe('first');
    expect(result.nextWords[1]).toBe('');
    expect(result.nextWords[2]).toBe('apple');
    expect(result.nextWords[3]).toBe('banana');
    expect(result.nextWords[4]).toBe('cherry');
    expect(result.focusIndex).toBe(4);
  });

  it('starts from index 0 when smaller partial phrase overflows remaining cells', () => {
    const result = applyMnemonicPaste(empty24, 22, [
      'apple',
      'banana',
      'cherry',
      'dog',
    ]);
    expect(result.nextWords[0]).toBe('apple');
    expect(result.nextWords[1]).toBe('banana');
    expect(result.nextWords[2]).toBe('cherry');
    expect(result.nextWords[3]).toBe('dog');
    expect(result.focusIndex).toBe(3);
  });
});

describe('evaluateBip39Slots & isImportableBip39', () => {
  it('validates 12 and 24 valid english bip39 words', () => {
    const words24 = [
      'abandon',
      'ability',
      'able',
      'about',
      'above',
      'absent',
      'absorb',
      'abstract',
      'absurd',
      'abuse',
      'access',
      'accident',
      'account',
      'accuse',
      'achieve',
      'acid',
      'acoustic',
      'acquire',
      'across',
      'act',
      'action',
      'actor',
      'actress',
      'actual',
    ];
    const validation24 = evaluateBip39Slots(words24);
    expect(validation24.invalidIndices).toEqual([]);
    expect(isImportableBip39(validation24)).toBe(true);

    const words12 = [...words24.slice(0, 12), ...Array(12).fill('')];
    const validation12 = evaluateBip39Slots(words12);
    expect(validation12.invalidIndices).toEqual([]);
    expect(isImportableBip39(validation12)).toBe(true);
  });

  it('flags invalid words', () => {
    const invalidWords = ['notaword', ...Array(23).fill('')];
    const validation = evaluateBip39Slots(invalidWords);
    expect(validation.invalidIndices).toEqual([0]);
    expect(isImportableBip39(validation)).toBe(false);
  });
});
