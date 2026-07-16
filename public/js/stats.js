window.App = window.App || {};

(function () {
  const STORAGE_KEY = 'typingTrainerState';
  const HISTORY_LIMIT = 200;

  let state = null;

  function defaultState() {
    const lessons = window.App.Lessons.LESSONS;
    const lessonProgress = {};
    lessons.forEach((lesson, i) => {
      lessonProgress[lesson.id] = {
        unlocked: i === 0,
        completed: false,
        bestWpm: 0,
        bestAccuracy: 0,
        attempts: 0
      };
    });
    return {
      version: 1,
      lessonProgress,
      currentLessonId: lessons[0].id,
      history: []
    };
  }

  function loadState() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state = defaultState();
        return state;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !parsed.lessonProgress) {
        state = defaultState();
        return state;
      }
      // Fill in progress entries for any lessons not present (e.g. app updated).
      const lessons = window.App.Lessons.LESSONS;
      lessons.forEach((lesson, i) => {
        if (!parsed.lessonProgress[lesson.id]) {
          parsed.lessonProgress[lesson.id] = {
            unlocked: i === 0,
            completed: false,
            bestWpm: 0,
            bestAccuracy: 0,
            attempts: 0
          };
        }
      });
      state = parsed;
      return state;
    } catch (e) {
      state = defaultState();
      return state;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable (private mode, quota) - fail silently, state stays in memory.
    }
  }

  function isFirstRun() {
    try {
      return localStorage.getItem(STORAGE_KEY) === null;
    } catch (e) {
      return true;
    }
  }

  function hasSeenWelcome() {
    return !isFirstRun();
  }

  function markWelcomeSeen() {
    loadState();
    saveState();
  }

  function getLessonProgress(lessonId) {
    return loadState().lessonProgress[lessonId];
  }

  function getCurrentLessonId() {
    return loadState().currentLessonId;
  }

  function recordSessionResult(lessonId, lessonIndex, stats) {
    const s = loadState();
    const progress = s.lessonProgress[lessonId];
    progress.attempts += 1;
    progress.bestWpm = Math.max(progress.bestWpm, stats.wpm);
    progress.bestAccuracy = Math.max(progress.bestAccuracy, stats.accuracy);

    const lesson = window.App.Lessons.LESSONS[lessonIndex];
    const passed = stats.accuracy >= lesson.unlock.accuracy && stats.wpm >= lesson.unlock.wpm;

    if (passed) {
      progress.completed = true;
      const nextLesson = window.App.Lessons.LESSONS[lessonIndex + 1];
      if (nextLesson) {
        s.lessonProgress[nextLesson.id].unlocked = true;
        s.currentLessonId = nextLesson.id;
      }
    }

    s.history.push({
      date: new Date().toISOString(),
      lessonId,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      durationSec: stats.durationSec
    });
    if (s.history.length > HISTORY_LIMIT) {
      s.history = s.history.slice(s.history.length - HISTORY_LIMIT);
    }

    saveState();
    return { passed };
  }

  function getRecentHistory(limit) {
    const s = loadState();
    return s.history.slice(-limit).reverse();
  }

  window.App.Stats = {
    loadState,
    isFirstRun,
    hasSeenWelcome,
    markWelcomeSeen,
    getLessonProgress,
    getCurrentLessonId,
    recordSessionResult,
    getRecentHistory
  };
})();
