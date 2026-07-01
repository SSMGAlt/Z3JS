export const OPS = {
  NOP: 0x00,
  LOAD1: 0x01,
  LOAD2: 0x02,
  LOADI1: 0x03,
  LOADI2: 0x04,
  STORE: 0x05,
  ADD: 0x06,
  SUB: 0x07,
  MUL: 0x08,
  DIV: 0x09,
  SQRT: 0x0a,
  NEG: 0x0b,
  INPUT: 0x0c,
  PRINT: 0x0d,
  HALT: 0xff,
};

export const MNEMONICS = Object.fromEntries(
  Object.entries(OPS).map(([name, code]) => [code, name]),
);

const ADDR_OPS = new Set([OPS.LOAD1, OPS.LOAD2, OPS.STORE]);
const IMM_OPS = new Set([OPS.LOADI1, OPS.LOADI2]);

export function takesOperand(opcode) {
  return ADDR_OPS.has(opcode) || IMM_OPS.has(opcode);
}

export function isAddressOp(opcode) {
  return ADDR_OPS.has(opcode);
}
