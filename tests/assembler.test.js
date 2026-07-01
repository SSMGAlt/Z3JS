import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assemble, disassemble } from '../src/core/assembler.js';

test('assembles and disassembles round-trip', () => {
  const src = 'LOADI1 5\nHALT';
  assert.equal(disassemble(assemble(src)), src);
});

test('rejects an unknown instruction', () => {
  assert.throws(() => assemble('FOO 1'));
});

test('rejects an out-of-range address', () => {
  assert.throws(() => assemble('STORE 99'));
});

test('ignores comments and blank lines', () => {
  const bytes = assemble('; comment\n\nHALT ; trailing comment');
  assert.equal(bytes.length, 2);
});
