export const MANTISSA_BITS = 14;
export const EXPONENT_BITS = 7;
export const EXPONENT_BIAS = 63;
export const WORD_BITS = 1 + EXPONENT_BITS + MANTISSA_BITS;

const MANTISSA_MASK = (1 << MANTISSA_BITS) - 1;
const EXPONENT_MASK = (1 << EXPONENT_BITS) - 1;
const WORD_MASK = (1 << WORD_BITS) - 1;

function special(sign, mantissa) {
  return (sign << (WORD_BITS - 1)) | (EXPONENT_MASK << MANTISSA_BITS) | mantissa;
}

export function encode(value) {
  if (Number.isNaN(value)) return special(0, 1);
  if (value === Infinity) return special(0, 0);
  if (value === -Infinity) return special(1, 0);
  if (value === 0) return 0;

  const sign = value < 0 ? 1 : 0;
  let mag = Math.abs(value);
  let exp = 0;
  while (mag >= 2) { mag /= 2; exp++; }
  while (mag < 1) { mag *= 2; exp--; }

  let mantissa = Math.round((mag - 1) * (1 << MANTISSA_BITS));
  if (mantissa === (1 << MANTISSA_BITS)) {
    mantissa = 0;
    exp += 1;
  }

  const biased = exp + EXPONENT_BIAS;
  if (biased <= 0) return 0;
  if (biased >= EXPONENT_MASK) return special(sign, 0);

  return (sign << (WORD_BITS - 1)) | (biased << MANTISSA_BITS) | mantissa;
}

export function decode(word) {
  word &= WORD_MASK;
  if (word === 0) return 0;

  const sign = (word >>> (WORD_BITS - 1)) & 1;
  const biased = (word >>> MANTISSA_BITS) & EXPONENT_MASK;
  const mantissa = word & MANTISSA_MASK;

  if (biased === EXPONENT_MASK) {
    if (mantissa === 0) return sign ? -Infinity : Infinity;
    return NaN;
  }

  const mag = (1 + mantissa / (1 << MANTISSA_BITS)) * 2 ** (biased - EXPONENT_BIAS);
  return sign ? -mag : mag;
}

export function isException(word) {
  return ((word >>> MANTISSA_BITS) & EXPONENT_MASK) === EXPONENT_MASK;
}

export const add = (a, b) => encode(decode(a) + decode(b));
export const sub = (a, b) => encode(decode(a) - decode(b));
export const mul = (a, b) => encode(decode(a) * decode(b));
export const div = (a, b) => encode(decode(a) / decode(b));

// Negative input is "undefined" on the real hardware, not a crash —
// see the exception-value handling above.
export const sqrt = (a) => {
  const x = decode(a);
  return x < 0 ? special(0, 1) : encode(Math.sqrt(x));
};

export const neg = (a) => encode(-decode(a));
