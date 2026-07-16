window.App = window.App || {};

(function () {
  const IGNORED_KEYS = [
    'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Enter', 'Escape',
    'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
  ];

  let session = null;
  let keydownHandler = null;

  function renderPrompt(promptEl, text) {
    promptEl.innerHTML = '';
    const spans = [];
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'pending';
      span.textContent = ch === ' ' ? ' ' : ch;
      promptEl.appendChild(span);
      spans.push(span);
    }
    return spans;
  }

  function updateCursorVisual() {
    session.spans.forEach((s) => s.classList.remove('cursor'));
    const cur = session.spans[session.cursorIndex];
    if (cur) cur.classList.add('cursor');
  }

  function updateNextKeyHighlight() {
    const target = session.text[session.cursorIndex];
    if (target === undefined) {
      window.App.Keyboard.clearNextKeys();
      return;
    }
    const isUpper = /[A-Z]/.test(target);
    const base = target.toLowerCase();
    if (isUpper) {
      const shiftId = window.App.FingerMap.shiftKeyFor(base);
      window.App.Keyboard.setNextKeys([base, shiftId]);
    } else {
      window.App.Keyboard.setNextKeys([base]);
    }
  }

  function computeStats() {
    const elapsedMs = session.startTime ? Date.now() - session.startTime : 0;
    const elapsedMin = Math.max(elapsedMs / 60000, 1 / 60); // floor at 1 second
    const wpm = Math.round((session.correctKeystrokes / 5) / elapsedMin);
    const accuracy = session.totalKeystrokes > 0
      ? Math.round((session.correctKeystrokes / session.totalKeystrokes) * 100)
      : 100;
    return {
      wpm,
      accuracy,
      errorCount: session.errorCount,
      totalKeystrokes: session.totalKeystrokes,
      correctKeystrokes: session.correctKeystrokes,
      durationSec: Math.round(elapsedMs / 1000)
    };
  }

  function completeSession() {
    session.completed = true;
    window.App.Keyboard.clearNextKeys();
    const stats = computeStats();
    if (session.onComplete) session.onComplete(stats);
  }

  function handleKeyDown(e) {
    if (!session || session.completed) return;
    if (e.repeat) return;

    const key = e.key;

    if (key === 'Shift') {
      const shiftId = e.code === 'ShiftRight'
        ? window.App.Keyboard.SHIFT_RIGHT_ID
        : window.App.Keyboard.SHIFT_LEFT_ID;
      window.App.Keyboard.flashKey(shiftId, 'key-correct');
      return;
    }

    if (IGNORED_KEYS.includes(key)) {
      e.preventDefault();
      return;
    }

    if (key.length > 1) return; // unhandled special keys (F1, etc.)

    e.preventDefault();

    const target = session.text[session.cursorIndex];
    if (target === undefined) return;

    const isUpper = /[A-Z]/.test(target);
    let correct;
    if (isUpper) {
      correct = key === target && e.shiftKey;
    } else if (target === ' ') {
      correct = key === ' ';
    } else {
      correct = key === target && !e.shiftKey;
    }

    if (session.startTime === null) session.startTime = Date.now();
    session.totalKeystrokes++;

    if (correct) {
      session.correctKeystrokes++;
      session.spans[session.cursorIndex].classList.remove('pending', 'typed-error');
      session.spans[session.cursorIndex].classList.add('typed-correct');
      window.App.Keyboard.flashKey(target.toLowerCase(), 'key-correct');
      session.cursorIndex++;
      updateCursorVisual();
      if (session.cursorIndex >= session.text.length) {
        completeSession();
      } else {
        updateNextKeyHighlight();
      }
    } else {
      session.errorCount++;
      session.spans[session.cursorIndex].classList.add('typed-error');
      const pressedKey = key.toLowerCase();
      if (window.App.FingerMap.KEY_TO_FINGER[pressedKey]) {
        window.App.Keyboard.flashKey(pressedKey, 'key-error');
      }
    }

    if (session.onProgress) session.onProgress(computeStats());
  }

  function startSession(promptEl, lessonIndex, text, callbacks) {
    stopSession();
    const spans = renderPrompt(promptEl, text);
    session = {
      lessonIndex,
      text,
      promptEl,
      spans,
      cursorIndex: 0,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      errorCount: 0,
      startTime: null,
      completed: false,
      onProgress: callbacks && callbacks.onProgress,
      onComplete: callbacks && callbacks.onComplete
    };
    updateCursorVisual();
    updateNextKeyHighlight();
    keydownHandler = handleKeyDown;
    window.addEventListener('keydown', keydownHandler);
  }

  function stopSession() {
    if (keydownHandler) {
      window.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    if (window.App.Keyboard) window.App.Keyboard.clearNextKeys();
    session = null;
  }

  window.App.Typing = {
    startSession,
    stopSession
  };
})();
