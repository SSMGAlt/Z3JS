import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Memory } from '../src/core/memory.js';

test('writes and reads a word', () => {
  const mem = new Memory();
  mem.write(5, 12345);
  assert.equal(mem.read(5), 12345);
});

test('masks values to 22 bits on write', () => {
  const mem = new Memory();
  mem.write(0, 0xffffffff);
  assert.equal(mem.read(0), (1 << 22) - 1);
});

test('rejects out-of-range addresses', () => {
  const mem = new Memory();
  assert.throws(() => mem.read(64));
  assert.throws(() => mem.write(-1, 0));
});

test('reset clears all cells', () => {
  const mem = new Memory();
  mem.write(0, 999);
  mem.reset();
  assert.equal(mem.read(0), 0);
});
