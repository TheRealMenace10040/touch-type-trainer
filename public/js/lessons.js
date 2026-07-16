window.App = window.App || {};

(function () {
  const LESSONS = [
    { id: 'l1', name: 'Home Row Anchors', newKeys: ['f', 'j'], mode: 'drill', unlock: { accuracy: 90, wpm: 5 } },
    { id: 'l2', name: 'Home Row Inner', newKeys: ['d', 'k'], mode: 'drill', unlock: { accuracy: 90, wpm: 6 } },
    { id: 'l3', name: 'Home Row Outer', newKeys: ['s', 'l'], mode: 'drill', unlock: { accuracy: 90, wpm: 7 } },
    { id: 'l4', name: 'Home Row Pinky', newKeys: ['a', ';'], mode: 'drill', unlock: { accuracy: 90, wpm: 8 } },
    { id: 'l5', name: 'Index Reaches', newKeys: ['g', 'h'], mode: 'drill', unlock: { accuracy: 90, wpm: 9 } },
    { id: 'l6', name: 'Top-Row Vowels', newKeys: ['e', 'i'], mode: 'drill', unlock: { accuracy: 90, wpm: 10 } },
    { id: 'l7', name: 'Top-Row Index', newKeys: ['r', 'u'], mode: 'words', unlock: { accuracy: 90, wpm: 11 } },
    { id: 'l8', name: 'Top-Row Outer', newKeys: ['t', 'y'], mode: 'words', unlock: { accuracy: 90, wpm: 12 } },
    { id: 'l9', name: 'Bottom-Row Index', newKeys: ['v', 'm'], mode: 'words', unlock: { accuracy: 90, wpm: 13 } },
    { id: 'l10', name: 'Bottom-Row Inner', newKeys: ['c', ','], mode: 'words', unlock: { accuracy: 90, wpm: 14 } },
    { id: 'l11', name: 'Top-Row Ring', newKeys: ['w', 'o'], mode: 'words', unlock: { accuracy: 90, wpm: 15 } },
    { id: 'l12', name: 'Top-Row Pinky', newKeys: ['q', 'p'], mode: 'words', unlock: { accuracy: 90, wpm: 16 } },
    { id: 'l13', name: 'Bottom-Row Ring', newKeys: ['x', '.'], mode: 'words', unlock: { accuracy: 90, wpm: 17 } },
    { id: 'l14', name: 'Bottom-Row Pinky', newKeys: ['z', '/'], mode: 'words', unlock: { accuracy: 90, wpm: 18 } },
    { id: 'l15', name: 'Remaining Bottom Row', newKeys: ['b', 'n'], mode: 'words', unlock: { accuracy: 90, wpm: 19 } },
    { id: 'l16', name: 'Capitals & Shift', newKeys: [], shiftLesson: true, mode: 'words', unlock: { accuracy: 88, wpm: 18 } },
    { id: 'l17', name: 'Numbers (Left Hand)', newKeys: ['1', '2', '3', '4', '5'], mode: 'drill', unlock: { accuracy: 88, wpm: 15 } },
    { id: 'l18', name: 'Numbers (Right Hand)', newKeys: ['6', '7', '8', '9', '0'], mode: 'drill', unlock: { accuracy: 88, wpm: 15 } },
    { id: 'l19', name: 'Punctuation', newKeys: ["'", '-'], mode: 'drill', unlock: { accuracy: 88, wpm: 15 } },
    { id: 'l20', name: 'Mixed Mastery', newKeys: [], mode: 'words', unlock: { accuracy: 90, wpm: 20 } }
  ];

  // Small bundled common-word list for 'words' mode. Filtered down to whichever
  // words are spellable with the keys unlocked so far.
  const WORD_LIST = [
    'a', 'i', 'it', 'is', 'in', 'if', 'he', 'me', 'we', 'be', 'go', 'do', 'to', 'of', 'on', 'or', 'so',
    'the', 'and', 'her', 'him', 'his', 'has', 'had', 'are', 'you', 'all', 'for', 'not', 'but', 'out',
    'get', 'got', 'let', 'set', 'red', 'run', 'sit', 'sun', 'fun', 'fit', 'hit', 'hot', 'top', 'tip',
    'rid', 'rig', 'rug', 'tug', 'jug', 'jig', 'jog', 'log', 'leg', 'let', 'net', 'nut', 'gut', 'hut',
    'hug', 'dug', 'dot', 'dig', 'gig', 'gap', 'tap', 'top', 'pot', 'pit', 'sip', 'sap', 'lap', 'lip',
    'like', 'time', 'tire', 'ride', 'rise', 'site', 'give', 'live', 'here', 'here', 'they', 'this',
    'that', 'with', 'were', 'when', 'what', 'your', 'from', 'have', 'will', 'good', 'very', 'over',
    'just', 'into', 'more', 'some', 'like', 'them', 'then', 'than', 'well', 'only', 'could', 'other',
    'right', 'think', 'still', 'never', 'again', 'great', 'where', 'water', 'their', 'which', 'first',
    'about', 'after', 'every', 'under', 'while'
  ];

  function availableKeys(lessonIndex) {
    const keys = new Set();
    for (let i = 0; i <= lessonIndex; i++) {
      for (const k of LESSONS[i].newKeys) keys.add(k);
    }
    return keys;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateDrillWord(availableArr, newKeys) {
    const len = 2 + Math.floor(Math.random() * 4); // 2-5 chars
    let word = '';
    for (let i = 0; i < len; i++) {
      const useNew = newKeys.length > 0 && Math.random() < 0.5;
      const pool = useNew ? newKeys : availableArr;
      word += pick(pool);
    }
    return word;
  }

  function generateDrillLine(lessonIndex, targetLen) {
    const available = Array.from(availableKeys(lessonIndex));
    const newKeys = LESSONS[lessonIndex].newKeys.filter((k) => k !== ' ');
    const words = [];
    let len = 0;
    while (len < targetLen) {
      const w = generateDrillWord(available, newKeys);
      words.push(w);
      len += w.length + 1;
    }
    return words.join(' ');
  }

  function generateWordsLine(lessonIndex, targetLen) {
    const available = availableKeys(lessonIndex);
    const pool = WORD_LIST.filter((w) => {
      for (const ch of w) {
        if (!available.has(ch)) return false;
      }
      return true;
    });
    if (pool.length < 15) {
      return generateDrillLine(lessonIndex, targetLen);
    }
    const words = [];
    let len = 0;
    while (len < targetLen) {
      const w = pick(pool);
      words.push(w);
      len += w.length + 1;
    }
    return words.join(' ');
  }

  function applyShiftLesson(line) {
    // Capitalize the first letter of some words to practice Shift technique.
    return line
      .split(' ')
      .map((w) => (Math.random() < 0.5 && w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  function generatePracticeText(lessonIndex) {
    const lesson = LESSONS[lessonIndex];
    const targetLen = Math.min(40 + lessonIndex * 2, 60);
    let line;
    if (lesson.mode === 'words') {
      line = generateWordsLine(lessonIndex, targetLen);
    } else {
      line = generateDrillLine(lessonIndex, targetLen);
    }
    if (lesson.shiftLesson) {
      line = applyShiftLesson(line);
    }
    return line;
  }

  window.App.Lessons = {
    LESSONS,
    availableKeys,
    generatePracticeText
  };
})();
