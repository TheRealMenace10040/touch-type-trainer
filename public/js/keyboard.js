window.App = window.App || {};

(function () {
  const SHIFT_LEFT_ID = 'shiftleft';
  const SHIFT_RIGHT_ID = 'shiftright';

  // u = width in key-units (1u = one standard key). Decorative keys (Tab,
  // Caps, Enter, Backspace, Ctrl, Alt) complete the physical-keyboard look
  // but are never targeted by lessons and never receive next-key/flash
  // states — typing.js already ignores their real-keyboard equivalents.
  const ROWS = [
    [
      { k: '`', u: 1 }, { k: '1', u: 1 }, { k: '2', u: 1 }, { k: '3', u: 1 }, { k: '4', u: 1 },
      { k: '5', u: 1 }, { k: '6', u: 1 }, { k: '7', u: 1 }, { k: '8', u: 1 }, { k: '9', u: 1 },
      { k: '0', u: 1 }, { k: '-', u: 1 }, { k: '=', u: 1 },
      { k: 'backspace', label: '⌫', u: 2, decorative: true }
    ],
    [
      { k: 'tab', label: 'Tab', u: 1.5, decorative: true },
      { k: 'q', u: 1 }, { k: 'w', u: 1 }, { k: 'e', u: 1 }, { k: 'r', u: 1 }, { k: 't', u: 1 },
      { k: 'y', u: 1 }, { k: 'u', u: 1 }, { k: 'i', u: 1 }, { k: 'o', u: 1 }, { k: 'p', u: 1 },
      { k: '[', u: 1 }, { k: ']', u: 1 }, { k: '\\', u: 1.5 }
    ],
    [
      { k: 'capslock', label: 'Caps', u: 1.75, decorative: true },
      { k: 'a', u: 1 }, { k: 's', u: 1 }, { k: 'd', u: 1 }, { k: 'f', u: 1 }, { k: 'g', u: 1 },
      { k: 'h', u: 1 }, { k: 'j', u: 1 }, { k: 'k', u: 1 }, { k: 'l', u: 1 }, { k: ';', u: 1 },
      { k: "'", u: 1 },
      { k: 'enter', label: 'Enter', u: 2.25, decorative: true }
    ],
    [
      { k: SHIFT_LEFT_ID, label: 'Shift', u: 2.25, isShift: true, finger: 'left-pinky' },
      { k: 'z', u: 1 }, { k: 'x', u: 1 }, { k: 'c', u: 1 }, { k: 'v', u: 1 }, { k: 'b', u: 1 },
      { k: 'n', u: 1 }, { k: 'm', u: 1 }, { k: ',', u: 1 }, { k: '.', u: 1 }, { k: '/', u: 1 },
      { k: SHIFT_RIGHT_ID, label: 'Shift', u: 2.75, isShift: true, finger: 'right-pinky' }
    ],
    [
      { k: 'controlleft', label: 'Ctrl', u: 1.25, decorative: true },
      { k: 'altleft', label: 'Alt', u: 1.25, decorative: true },
      { k: ' ', label: 'Space', u: 10, isSpace: true, finger: 'thumb' },
      { k: 'altright', label: 'Alt', u: 1.25, decorative: true },
      { k: 'controlright', label: 'Ctrl', u: 1.25, decorative: true }
    ]
  ];

  let containerEl = null;
  let keyEls = {}; // key char (lowercase) or shift id -> element
  let currentNextKeys = [];

  function buildKeyboard(container) {
    containerEl = container;
    keyEls = {};
    container.innerHTML = '';

    const FM = window.App.FingerMap;

    ROWS.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row kb-row-' + rowIndex;

      row.forEach((entry) => {
        const keyEl = document.createElement('div');
        keyEl.className = 'key';
        keyEl.style.setProperty('--u', entry.u);
        keyEl.dataset.key = entry.k;

        // Only true letter/number/symbol keys get the visible per-finger
        // dot (matches the design spec: space and Shift carry a finger for
        // consistency/at-rest tinting, but no dot; decorative keys get
        // neither).
        let finger = entry.finger || null;
        if (!entry.decorative && !finger) {
          finger = FM.KEY_TO_FINGER[entry.k] || null;
          if (finger) keyEl.classList.add('key-dot');
        }
        if (finger) {
          keyEl.dataset.finger = finger;
          keyEl.style.setProperty('--finger-color', FM.FINGER_COLORS[finger]);
        }

        keyEl.textContent = entry.label || entry.k.toUpperCase();

        if (!entry.decorative && FM.HOME_ROW_KEYS.includes(entry.k)) {
          keyEl.classList.add('home-bump');
        }
        if (entry.decorative) {
          keyEl.classList.add('key-decorative');
        }

        rowEl.appendChild(keyEl);
        keyEls[entry.k] = keyEl;
      });

      container.appendChild(rowEl);
    });
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
