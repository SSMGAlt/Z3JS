import { Memory } from './memory.js';
import { OPS } from './instructions.js';
import * as f22 from './float22.js';

export class Z3Machine {
  memory = new Memory();
  r1 = 0;
  r2 = 0;
  pc = 0;
  halted = true;
  exception = false;
  output = [];
  #tape = new Uint8Array(0);
  #inputQueue = [];

  loadProgram(bytes) {
    this.#tape = bytes;
    this.reset();
  }

  reset() {
    this.memory.reset();
    this.r1 = 0;
    this.r2 = 0;
    this.pc = 0;
    this.halted = false;
    this.exception = false;
    this.output = [];
  }

  setInput(values) {
    this.#inputQueue = [...values];
  }

  get instructionCount() {
    return this.#tape.length / 2;
  }

  step() {
    if (this.halted) return false;
    if (this.pc >= this.#tape.length) {
      this.halted = true;
      return false;
    }

    const opcode = this.#tape[this.pc];
    const rawOperand = this.#tape[this.pc + 1];
    const operand = rawOperand > 127 ? rawOperand - 256 : rawOperand;
    this.pc += 2;

    switch (opcode) {
      case OPS.NOP:
        break;
      case OPS.LOAD1:
        this.r1 = this.memory.read(operand);
        break;
      case OPS.LOAD2:
        this.r2 = this.memory.read(operand);
        break;
      case OPS.LOADI1:
        this.r1 = f22.encode(operand);
        break;
      case OPS.LOADI2:
        this.r2 = f22.encode(operand);
        break;
      case OPS.STORE:
        this.memory.write(operand, this.r1);
        break;
      case OPS.ADD:
        this.r1 = f22.add(this.r1, this.r2);
        break;
      case OPS.SUB:
        this.r1 = f22.sub(this.r1, this.r2);
        break;
      case OPS.MUL:
        this.r1 = f22.mul(this.r1, this.r2);
        break;
      case OPS.DIV:
        this.r1 = f22.div(this.r1, this.r2);
        break;
      case OPS.SQRT:
        this.r1 = f22.sqrt(this.r1);
        break;
      case OPS.NEG:
        this.r1 = f22.neg(this.r1);
        break;
      case OPS.INPUT:
        this.r1 = f22.encode(this.#inputQueue.shift() ?? 0);
        break;
      case OPS.PRINT:
        this.output.push(f22.decode(this.r1));
        break;
      case OPS.HALT:
        this.halted = true;
        return false;
      default:
        throw new Error(`invalid opcode 0x${opcode.toString(16)} at pc=${this.pc - 2}`);
    }

    if (f22.isException(this.r1)) this.exception = true;
    if (this.pc >= this.#tape.length) this.halted = true;
    return !this.halted;
  }

  // No branch instruction means no way to jump backward, so every
  // program is structurally guaranteed to terminate.
  run() {
    while (this.step()) { /* noop */ }
    return this.output;
  }
}
