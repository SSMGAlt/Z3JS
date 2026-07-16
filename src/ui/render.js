import { decode, WORD_BITS, EXPONENT_BITS, MANTISSA_BITS } from '../core/float22.js';

const FIELD_SIZES = [1, EXPONENT_BITS, MANTISSA_BITS];

export function formatValue(v) {
  if (Number.isNaN(v)) return 'undefined';
  if (v === Infinity) return '+infinity';
  if (v === -Infinity) return '-infinity';
  return v.toFixed(4);
}

export function renderRegister(name, word) {
  const lamps = document.getElementById(`${name}-lamps`);
  lamps.innerHTML = '';
  let bitIndex = WORD_BITS - 1;

  for (const size of FIELD_SIZES) {
    const group = document.createElement('span');
    group.className = 'lamp-group';
    for (let i = 0; i < size; i++) {
      const bit = (word >>> bitIndex) & 1;
      const lamp = document.createElement('span');
      lamp.className = `lamp${bit ? ' lit' : ''}`;
      group.appendChild(lamp);
      bitIndex--;
    }
    lamps.appendChild(group);
  }

  document.getElementById(`${name}-decimal`).textContent = formatValue(decode(word));
}

export function renderMemory(memory) {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  for (let addr = 0; addr < memory.size; addr++) {
    const cell = document.createElement('div');
    cell.className = 'memory-cell';
    cell.title = `addr ${addr}`;
    const v = decode(memory.read(addr));
    cell.textContent = Number.isFinite(v) ? v.toFixed(2) : formatValue(v);
    grid.appendChild(cell);
  }
}

export function renderOutput(output) {
  document.getElementById('output').textContent = output.map(formatValue).join('\n');
}

export function renderStatus(machine) {
  document.getElementById('status').textContent = machine.halted ? 'halted' : 'ready';
  document.getElementById('pc').textContent = `pc ${machine.pc}`;
  document.getElementById('exception').classList.toggle('lit', machine.exception);
}
