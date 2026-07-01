import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encode, decode, add, mul, div, sqrt, isException } from '../src/core/float22.js';

test('round-trips integers', () => {
  for (const n of [0, 1, -1, 2, 10, -10, 63, 1000]) {
    assert.ok(Math.abs(decode(encode(n)) - n) < 0.01);
  }
});

test('round-trips a value near a power-of-two boundary', () => {
  const result = decode(encode(1.999999));
  assert.ok(Math.abs(result - 2) < 0.001);
});

test('adds two encoded values', () => {
  assert.ok(Math.abs(decode(add(encode(2), encode(3))) - 5) < 0.01);
});

test('multiplies two encoded values', () => {
  assert.ok(Math.abs(decode(mul(encode(4), encode(2.5))) - 10) < 0.01);
});

test('computes a hardware square root', () => {
  assert.ok(Math.abs(decode(sqrt(encode(16))) - 4) < 0.01);
});

test('division by zero produces infinity, not a crash', () => {
  assert.equal(decode(div(encode(5), encode(0))), Infinity);
  assert.equal(decode(div(encode(-5), encode(0))), -Infinity);
});

test('zero divided by zero is undefined', () => {
  assert.ok(Number.isNaN(decode(div(encode(0), encode(0)))));
});

test('square root of a negative number is undefined', () => {
  assert.ok(Number.isNaN(decode(sqrt(encode(-4)))));
});

test('zero encodes and decodes as exactly zero', () => {
  assert.equal(encode(0), 0);
  assert.equal(decode(0), 0);
});

test('isException flags infinities and undefined but not ordinary values', () => {
  assert.ok(isException(encode(Infinity)));
  assert.ok(!isException(encode(42)));
});
