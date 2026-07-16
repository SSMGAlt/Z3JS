import { OPS, MNEMONICS, ALIASES, DYNAMIC_LOAD, takesOperand, isAddressOp } from './instructions.js';

export function assemble(source) {
  const bytes = [];
  let r1Occupied = false;

  const occupyR1 = (canonical) => {
    switch (canonical) {
      case 'LOAD1':
      case 'LOADI1':
      case 'INPUT':
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
        r1Occupied = true;
        break;
      case 'STORE':
      case 'PRINT':
        r1Occupied = false;
        break;
      default:
        break;
    }
  };

  source.split('\n').forEach((rawLine, i) => {
    const line = rawLine.split(';')[0].trim();
    if (!line) return;

    const [rawMnemonic, operandStr] = line.split(/\s+/);
    const mnemonic = rawMnemonic.toUpperCase();

    // Pr and Lu are the two original instructions with no fixed target
    // register: on the real Z3 they fill R1 if it's free, otherwise R2 —
    // resolved here at assemble time, since the lack of branching means
    // the sequence of instructions (and so register occupancy) is fully
    // known without running the program.
    if (DYNAMIC_LOAD.has(mnemonic)) {
      const fromMemory = mnemonic === 'PR';
      let addr = 0;
      if (fromMemory) {
        if (operandStr === undefined) {
          throw new SyntaxError(`line ${i + 1}: Pr requires an address`);
        }
        addr = parseInt(operandStr, 10);
        if (Number.isNaN(addr) || addr < 0 || addr > 63) {
          throw new SyntaxError(`line ${i + 1}: address ${operandStr} out of range (0-63)`);
        }
      }

      const toR1 = !r1Occupied;
      const opcode = fromMemory
        ? (toR1 ? OPS.LOAD1 : OPS.LOAD2)
        : (toR1 ? OPS.INPUT : OPS.INPUT2);
      if (toR1) r1Occupied = true;

      bytes.push(opcode, fromMemory ? addr : 0);
      return;
    }

    const canonical = ALIASES[mnemonic] ?? mnemonic;
    const opcode = OPS[canonical];
    if (opcode === undefined) {
      throw new SyntaxError(`line ${i + 1}: unknown instruction "${rawMnemonic}"`);
    }

    let operand = 0;
    if (takesOperand(opcode)) {
      if (operandStr === undefined) {
        throw new SyntaxError(`line ${i + 1}: ${rawMnemonic} requires an operand`);
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

    occupyR1(canonical);
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
