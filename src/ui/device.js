const COMPACT_QUERY = '(max-width: 860px)';
const TOUCH_QUERY = '(pointer: coarse)';

export function initDevice() {
  const compact = window.matchMedia(COMPACT_QUERY);
  const touch = window.matchMedia(TOUCH_QUERY);
  const root = document.documentElement;

  const apply = () => {
    root.dataset.layout = compact.matches ? 'compact' : 'wide';
    root.dataset.pointer = touch.matches ? 'touch' : 'fine';
  };

  compact.addEventListener('change', apply);
  touch.addEventListener('change', apply);
  apply();
}

export function initPanelTabs() {
  const buttons = document.querySelectorAll('#panel-tabs button');
  document.documentElement.dataset.activePanel = 'program';

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      document.documentElement.dataset.activePanel = button.dataset.panel;
      buttons.forEach((b) => {
        const isActive = b === button;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
    });
  });
}
