import { OPS, MNEMONICS, takesOperand, isAddressOp } from './instructions.js';

export function assemble(source) {
  const bytes = [];

  source.split('\n').forEach((rawLine, i) => {
    const line = rawLine.split(';')[0].trim();
    if (!line) return;

    const [mnemonic, operandStr] = line.split(/\s+/);
    const opcode = OPS[mnemonic.toUpperCase()];
    if (opcode === undefined) {
      throw new SyntaxError(`line ${i + 1}: unknown instruction "${mnemonic}"`);
    }

    let operand = 0;
    if (takesOperand(opcode)) {
      if (operandStr === undefined) {
        throw new SyntaxError(`line ${i + 1}: ${mnemonic} requires an operand`);
      }
      operand = parseInt(operandStr, 10);
      if (Number.isNaN(operand)) {
        throw new SyntaxError(`line ${i + 1}: invalid operand "${operandStr}"`);
      }
      if (isAddressOp(opcode) && (operand < 0 || operand > 63)) {
        throw new SyntaxError(`line ${i + 1}: address ${operand} out of range (0-63)`);
      }
      if (!isAddressOp(opcode) && (operand < -128 || operand > 127)) {
        throw new SyntaxError(`line ${i + 1}: immediate ${operand} out of range (-128 to 127)`);
      }
    }

    bytes.push(opcode, operand & 0xff);
  });

  return new Uint8Array(bytes);
}

export function disassemble(bytes) {
  const lines = [];
  for (let i = 0; i < bytes.length; i += 2) {
    const opcode = bytes[i];
    const operand = bytes[i + 1];
    const name = MNEMONICS[opcode] ?? `DB 0x${opcode.toString(16)}`;
    lines.push(takesOperand(opcode) ? `${name} ${operand > 127 ? operand - 256 : operand}` : name);
  }
  return lines.join('\n');
}
