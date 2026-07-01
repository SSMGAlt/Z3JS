import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Z3Machine } from '../src/core/cpu.js';
import { assemble } from '../src/core/assembler.js';

test('runs a simple addition program', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('LOADI1 7\nLOADI2 5\nADD\nPRINT\nHALT'));
  const out = machine.run();
  assert.equal(out.length, 1);
  assert.ok(Math.abs(out[0] - 12) < 0.01);
});

test('halts naturally at the end of the tape without HALT', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('LOADI1 1'));
  machine.run();
  assert.ok(machine.halted);
});

test('memory store and load round-trip', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('LOADI1 42\nSTORE 0\nLOADI1 0\nLOAD1 0\nPRINT\nHALT'));
  const out = machine.run();
  assert.ok(Math.abs(out[0] - 42) < 0.01);
});

test('flags an exception on divide by zero', () => {
  const machine = new Z3Machine();
  machine.loadProgram(assemble('LOADI1 1\nLOADI2 0\nDIV\nPRINT\nHALT'));
  machine.run();
  assert.ok(machine.exception);
  assert.equal(machine.output[0], Infinity);
});
