import { Z3Machine } from '../core/cpu.js';
import { assemble } from '../core/assembler.js';
import { EXAMPLES } from './examples.js';
import { renderRegister, renderMemory, renderOutput, renderStatus } from './render.js';
import { initDevice, initPanelTabs } from './device.js';
import { listCustom, saveCustom, deleteCustom, downloadZ3Asm, readZ3AsmFile } from './library.js';

initDevice();
initPanelTabs();

const machine = new Z3Machine();

const sourceEl = document.getElementById('source');
const logEl = document.getElementById('log');
const exampleSelect = document.getElementById('example-select');
const inputQueueEl = document.getElementById('input-queue');
const nameEl = document.getElementById('example-name');
const fileInput = document.getElementById('file-input');

function refreshExampleOptions(selected) {
  exampleSelect.innerHTML = '<option value="">— load example —</option>';

  for (const name of Object.keys(EXAMPLES)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    exampleSelect.appendChild(opt);
  }

  const custom = listCustom();
  const customNames = Object.keys(custom);
  if (customNames.length) {
    const group = document.createElement('optgroup');
    group.label = 'your programs';
    for (const name of customNames) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      group.appendChild(opt);
    }
    exampleSelect.appendChild(group);
  }

  if (selected) exampleSelect.value = selected;
}

refreshExampleOptions();

exampleSelect.addEventListener('change', () => {
  const custom = listCustom();
  const source = EXAMPLES[exampleSelect.value] ?? custom[exampleSelect.value];
  if (source) {
    sourceEl.value = source;
    nameEl.value = exampleSelect.value in custom ? exampleSelect.value : '';
  }
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

document.getElementById('save-example').addEventListener('click', () => {
  const name = nameEl.value.trim();
  if (!name) {
    log('error: enter a name before saving');
    return;
  }
  saveCustom(name, sourceEl.value);
  downloadZ3Asm(name, sourceEl.value);
  refreshExampleOptions(name);
  log(`saved "${name}.z3asm"`);
});

document.getElementById('load-file').addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const source = await readZ3AsmFile(file);
  const name = file.name.replace(/\.z3asm$/i, '');
  sourceEl.value = source;
  nameEl.value = name;
  saveCustom(name, source);
  refreshExampleOptions(name);
  log(`loaded "${file.name}"`);
  fileInput.value = '';
});

document.getElementById('delete-example').addEventListener('click', () => {
  const name = exampleSelect.value;
  if (!name || !(name in listCustom())) {
    log('error: select one of your saved programs to delete it');
    return;
  }
  deleteCustom(name);
  refreshExampleOptions();
  nameEl.value = '';
  log(`deleted "${name}"`);
});

sourceEl.value = EXAMPLES['add two numbers'];
render();
