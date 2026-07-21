window.App = window.App || {};

(function () {
  // Standard QWERTY touch-typing finger assignment.
  const KEY_TO_FINGER = {
    '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
    '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
    '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
    '4': 'left-index', '5': 'left-index', 'r': 'left-index', 'f': 'left-index', 'v': 'left-index',
    't': 'left-index', 'g': 'left-index', 'b': 'left-index',
    '6': 'right-index', '7': 'right-index', 'y': 'right-index', 'h': 'right-index', 'n': 'right-index',
    'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
    '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
    '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
    '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky', 'p': 'right-pinky',
    '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky', ';': 'right-pinky',
    "'": 'right-pinky', '/': 'right-pinky',
    ' ': 'thumb'
  };

  const HOME_ROW_KEYS = ['f', 'j'];

  // Cool→warm hue sweep, same chroma/lightness (matches the "Signal" design
  // spec: index fingers share the yellow accent hue, others step outward
  // through magenta/violet).
  const FINGER_COLORS = {
    'left-pinky': 'oklch(0.78 0.19 320)',
    'left-ring': 'oklch(0.78 0.19 305)',
    'left-middle': 'oklch(0.78 0.19 290)',
    'left-index': 'oklch(0.78 0.19 90)',
    'right-index': 'oklch(0.78 0.19 90)',
    'right-middle': 'oklch(0.78 0.19 290)',
    'right-ring': 'oklch(0.78 0.19 305)',
    'right-pinky': 'oklch(0.78 0.19 320)',
    'thumb': 'oklch(0.5 0.02 280)'
  };

  const FINGER_LABELS = {
    'left-pinky': 'L pinky',
    'left-ring': 'L ring',
    'left-middle': 'L middle',
    'left-index': 'L index',
    'right-index': 'R index',
    'right-middle': 'R middle',
    'right-ring': 'R ring',
    'right-pinky': 'R pinky',
    'thumb': 'thumb'
  };

  // Left-hand keys use the right Shift, right-hand keys use the left Shift.
  const LEFT_HAND_KEYS = new Set([
    '`', '1', '2', '3', '4', '5', 'q', 'w', 'e', 'r', 't',
    'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'
  ]);

  function shiftFingerFor(key) {
    const k = key.toLowerCase();
    return LEFT_HAND_KEYS.has(k) ? 'right-pinky' : 'left-pinky';
  }

  function shiftKeyFor(key) {
    const k = key.toLowerCase();
    return LEFT_HAND_KEYS.has(k) ? 'shiftright' : 'shiftleft';
  }

  window.App.FingerMap = {
    KEY_TO_FINGER,
    HOME_ROW_KEYS,
    FINGER_COLORS,
    FINGER_LABELS,
    shiftFingerFor,
    shiftKeyFor
  };
})();
