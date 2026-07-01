import { Z3Machine } from '../core/cpu.js';
import { assemble } from '../core/assembler.js';
import { EXAMPLES } from './examples.js';
import { renderRegister, renderMemory, renderOutput, renderStatus } from './render.js';

const machine = new Z3Machine();

const sourceEl = document.getElementById('source');
const logEl = document.getElementById('log');
const exampleSelect = document.getElementById('example-select');
const inputQueueEl = document.getElementById('input-queue');

for (const name of Object.keys(EXAMPLES)) {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  exampleSelect.appendChild(opt);
}

exampleSelect.addEventListener('change', () => {
  const chosen = EXAMPLES[exampleSelect.value];
  if (chosen) sourceEl.value = chosen;
});

function log(message) {
  logEl.textContent += `${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function parseInputQueue() {
  return inputQueueEl.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
}

function render() {
  renderRegister('r1', machine.r1);
  renderRegister('r2', machine.r2);
  renderMemory(machine.memory);
  renderOutput(machine.output);
  renderStatus(machine);
}

document.getElementById('assemble').addEventListener('click', () => {
  try {
    const bytes = assemble(sourceEl.value);
    machine.loadProgram(bytes);
    machine.setInput(parseInputQueue());
    logEl.textContent = '';
    log(`assembled ${bytes.length / 2} instruction(s)`);
    render();
  } catch (err) {
    log(`error: ${err.message}`);
  }
});

document.getElementById('step').addEventListener('click', () => {
  if (machine.step()) {
    render();
  } else {
    render();
    log('halted');
  }
});

document.getElementById('run').addEventListener('click', () => {
  machine.run();
  render();
  log('halted');
});

document.getElementById('reset').addEventListener('click', () => {
  machine.reset();
  logEl.textContent = '';
  render();
});

sourceEl.value = EXAMPLES['add two numbers'];
render();
