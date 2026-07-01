import { WORD_BITS } from './float22.js';

const WORD_COUNT = 64;
const WORD_MASK = (1 << WORD_BITS) - 1;

export class Memory {
  #cells = new Uint32Array(WORD_COUNT);

  read(addr) {
    this.#checkAddr(addr);
    return this.#cells[addr];
  }

  write(addr, value) {
    this.#checkAddr(addr);
    this.#cells[addr] = value & WORD_MASK;
  }

  reset() {
    this.#cells.fill(0);
  }

  get size() {
    return WORD_COUNT;
  }

  #checkAddr(addr) {
    if (!Number.isInteger(addr) || addr < 0 || addr >= WORD_COUNT) {
      throw new RangeError(`memory address out of range: ${addr}`);
    }
  }
}
