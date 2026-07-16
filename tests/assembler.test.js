import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assemble, disassemble } from '../src/core/assembler.js';
import { Z3Machine } from '../src/core/cpu.js';

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

test('original Z3 mnemonics alias to the modern opcodes', () => {
  assert.deepEqual(assemble('Ps 3'), assemble('STORE 3'));
  assert.deepEqual(assemble('La'), assemble('ADD'));
  assert.deepEqual(assemble('Ls1'), assemble('ADD'));
  assert.deepEqual(assemble('Ls2'), assemble('SUB'));
  assert.deepEqual(assemble('Ls'), assemble('SUB'));
  assert.deepEqual(assemble('Lm'), assemble('MUL'));
  assert.deepEqual(assemble('Li'), assemble('DIV'));
  assert.deepEqual(assemble('Lw'), assemble('SQRT'));
  assert.deepEqual(assemble('Ld'), assemble('PRINT'));
});

test('Pr/Lu target R1 first, then R2, based on register occupancy', () => {
  // Lu -> r1 (empty). Ps frees r1. Second Lu -> r1 again (it's free).
  // Pr reloads the stored first value into r2, since r1 is occupied.
  const bytes = assemble('Lu\nPs 0\nLu\nPr 0\nLs1\nLd');
  assert.deepEqual(bytes, assemble('INPUT\nSTORE 0\nINPUT\nLOAD2 0\nADD\nPRINT'));
});

test('original syntax program runs correctly end to end', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('Lu\nPs 0\nLu\nPr 0\nLs1\nLd'));
  machine.setInput([3, 4]);
  const out = machine.run();
  assert.ok(Math.abs(out[0] - 7) < 0.01);
});

test('modern and original syntax can be mixed in one program', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('LOADI1 6\nStore 0\nLOADI1 9\nStore 1\nPr 0\nPr 1\nLs1\nLd'));
  const out = machine.run();
  assert.ok(Math.abs(out[0] - 15) < 0.01);
});
