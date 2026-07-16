window.App = window.App || {};

(function () {
  const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
  ];

  const SHIFT_LEFT_ID = 'shiftleft';
  const SHIFT_RIGHT_ID = 'shiftright';

  let containerEl = null;
  let keyEls = {}; // key char (lowercase) or shift id -> element
  let currentNextKeys = [];

  function keyLabel(k) {
    if (k === ' ') return '';
    return k;
  }

  function buildKeyboard(container) {
    containerEl = container;
    keyEls = {};
    container.innerHTML = '';

    const FM = window.App.FingerMap;

    ROWS.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row kb-row-' + rowIndex;
      row.forEach((k) => {
        const keyEl = document.createElement('div');
        const finger = FM.KEY_TO_FINGER[k] || 'thumb';
        keyEl.className = 'key';
        keyEl.dataset.key = k;
        keyEl.dataset.finger = finger;
        keyEl.style.setProperty('--finger-color', FM.FINGER_COLORS[finger]);
        keyEl.textContent = keyLabel(k);
        if (FM.HOME_ROW_KEYS.includes(k)) {
          keyEl.classList.add('home-bump');
        }
        rowEl.appendChild(keyEl);
        keyEls[k] = keyEl;
      });
      container.appendChild(rowEl);
    });

    // Bottom row: shift keys + space bar.
    const bottomRow = document.createElement('div');
    bottomRow.className = 'kb-row kb-row-bottom';

    const shiftLeft = document.createElement('div');
    shiftLeft.className = 'key key-shift';
    shiftLeft.dataset.key = SHIFT_LEFT_ID;
    shiftLeft.dataset.finger = 'left-pinky';
    shiftLeft.style.setProperty('--finger-color', FM.FINGER_COLORS['left-pinky']);
    shiftLeft.textContent = 'Shift';
    bottomRow.appendChild(shiftLeft);
    keyEls[SHIFT_LEFT_ID] = shiftLeft;

    const spaceEl = document.createElement('div');
    spaceEl.className = 'key key-space';
    spaceEl.dataset.key = ' ';
    spaceEl.dataset.finger = 'thumb';
    spaceEl.style.setProperty('--finger-color', FM.FINGER_COLORS['thumb']);
    spaceEl.textContent = 'Space';
    bottomRow.appendChild(spaceEl);
    keyEls[' '] = spaceEl;

    const shiftRight = document.createElement('div');
    shiftRight.className = 'key key-shift';
    shiftRight.dataset.key = SHIFT_RIGHT_ID;
    shiftRight.dataset.finger = 'right-pinky';
    shiftRight.style.setProperty('--finger-color', FM.FINGER_COLORS['right-pinky']);
    shiftRight.textContent = 'Shift';
    bottomRow.appendChild(shiftRight);
    keyEls[SHIFT_RIGHT_ID] = shiftRight;

    container.appendChild(bottomRow);
  }

  function clearNextKeys() {
    currentNextKeys.forEach((k) => {
      const el = keyEls[k];
      if (el) el.classList.remove('next-key');
    });
    currentNextKeys = [];
  }

  // Highlights the given key char(s) as "press this now". Pass an array to
  // highlight multiple keys at once (e.g. a letter + the Shift key needed).
  function setNextKeys(keys) {
    clearNextKeys();
    keys.forEach((k) => {
      const id = k === SHIFT_LEFT_ID || k === SHIFT_RIGHT_ID ? k : k.toLowerCase();
      const el = keyEls[id];
      if (el) {
        el.classList.add('next-key');
        currentNextKeys.push(id);
      }
    });
  }

  function flashKey(key, className) {
    const id = key === SHIFT_LEFT_ID || key === SHIFT_RIGHT_ID ? key : key.toLowerCase();
    const el = keyEls[id];
    if (!el) return;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), 150);
  }

  window.App.Keyboard = {
    SHIFT_LEFT_ID,
    SHIFT_RIGHT_ID,
    buildKeyboard,
    setNextKeys,
    clearNextKeys,
    flashKey
  };
})();
