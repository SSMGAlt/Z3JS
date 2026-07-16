const STORAGE_KEY = 'z3js.examples';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function writeAll(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function listCustom() {
  return readAll();
}

export function saveCustom(name, source) {
  const entries = readAll();
  entries[name] = source;
  writeAll(entries);
}

export function deleteCustom(name) {
  const entries = readAll();
  delete entries[name];
  writeAll(entries);
}

export function downloadZ3Asm(name, source) {
  const filename = name.toLowerCase().endsWith('.z3asm') ? name : `${name}.z3asm`;
  const blob = new Blob([source], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function readZ3AsmFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
