window.App = window.App || {};

(function () {
  let currentLessonIndex = 0;

  const els = {};

  function cacheEls() {
    els.screens = {
      welcome: document.getElementById('screen-welcome'),
      lessons: document.getElementById('screen-lessons'),
      practice: document.getElementById('screen-practice'),
      results: document.getElementById('screen-results'),
      progress: document.getElementById('screen-progress')
    };
    els.navButtons = document.querySelectorAll('[data-nav]');
    els.btnStart = document.getElementById('btn-start');
    els.lessonList = document.getElementById('lesson-list');
    els.practiceLessonName = document.getElementById('practice-lesson-name');
    els.practiceNewKeys = document.getElementById('practice-new-keys');
    els.promptText = document.getElementById('prompt-text');
    els.statTime = document.getElementById('stat-time');
    els.statAccuracy = document.getElementById('stat-accuracy');
    els.statErrors = document.getElementById('stat-errors');
    els.keyboard = document.getElementById('keyboard');
    els.resultWpm = document.getElementById('result-wpm');
    els.resultAccuracy = document.getElementById('result-accuracy');
    els.resultMessage = document.getElementById('result-message');
    els.btnRetry = document.getElementById('btn-retry');
    els.btnNextLesson = document.getElementById('btn-next-lesson');
    els.progressLessonList = document.getElementById('progress-lesson-list');
    els.progressHistory = document.getElementById('progress-history');
  }

  function showScreen(name) {
    Object.entries(els.screens).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== name);
    });
    if (name !== 'practice') {
      window.App.Typing.stopSession();
    }
  }

  function fingerLabel(finger) {
    return window.App.FingerMap.FINGER_LABELS[finger] || finger;
  }

  function renderLessonList() {
    const lessons = window.App.Lessons.LESSONS;
    els.lessonList.innerHTML = '';
    lessons.forEach((lesson, i) => {
      const progress = window.App.Stats.getLessonProgress(lesson.id);
      const card = document.createElement('div');
      card.className = 'lesson-card' + (progress.unlocked ? '' : ' locked');

      const title = document.createElement('div');
      title.className = 'lesson-card-title';
      title.textContent = (i + 1) + '. ' + lesson.name;
      card.appendChild(title);

      const keysLine = document.createElement('div');
      keysLine.className = 'lesson-card-keys';
      keysLine.textContent = lesson.newKeys.length
        ? 'New keys: ' + lesson.newKeys.join(' ')
        : (lesson.shiftLesson ? 'New: Shift technique' : 'Review');
      card.appendChild(keysLine);

      const statLine = document.createElement('div');
      statLine.className = 'lesson-card-stats';
      if (progress.attempts > 0) {
        statLine.textContent = 'Best: ' + progress.bestWpm + ' WPM, ' + progress.bestAccuracy + '% accuracy';
      } else if (progress.unlocked) {
        statLine.textContent = 'Not attempted yet';
      } else {
        statLine.textContent = 'Locked';
      }
      card.appendChild(statLine);

      if (progress.completed) {
        const badge = document.createElement('span');
        badge.className = 'badge-complete';
        badge.textContent = '✓';
        card.appendChild(badge);
      }

      if (progress.unlocked) {
        card.addEventListener('click', () => startLesson(i));
      }
      els.lessonList.appendChild(card);
    });
  }

  function startLesson(lessonIndex) {
    currentLessonIndex = lessonIndex;
    const lesson = window.App.Lessons.LESSONS[lessonIndex];
    const text = window.App.Lessons.generatePracticeText(lessonIndex);

    els.practiceLessonName.textContent = (lessonIndex + 1) + '. ' + lesson.name;
    els.practiceNewKeys.textContent = lesson.newKeys.length
      ? 'New keys this lesson: ' + lesson.newKeys.join(' ')
      : (lesson.shiftLesson ? 'Focus: Shift + capitals' : 'Mixed review');
    els.statTime.textContent = '0s';
    els.statAccuracy.textContent = '100%';
    els.statErrors.textContent = '0';

    showScreen('practice');

    window.App.Typing.startSession(els.promptText, lessonIndex, text, {
      onProgress: (stats) => {
        els.statTime.textContent = stats.durationSec + 's';
        els.statAccuracy.textContent = stats.accuracy + '%';
        els.statErrors.textContent = stats.errorCount;
      },
      onComplete: (stats) => onLessonComplete(lessonIndex, stats)
    });
  }

  function onLessonComplete(lessonIndex, stats) {
    const lesson = window.App.Lessons.LESSONS[lessonIndex];
    const { passed } = window.App.Stats.recordSessionResult(lesson.id, lessonIndex, stats);

    els.resultWpm.textContent = stats.wpm;
    els.resultAccuracy.textContent = stats.accuracy + '%';

    const hasNext = lessonIndex + 1 < window.App.Lessons.LESSONS.length;
    if (passed) {
      els.resultMessage.textContent = hasNext
        ? 'Lesson passed! The next lesson is unlocked.'
        : 'Lesson passed! You’ve completed every lesson.';
      els.resultMessage.className = 'result-message pass';
    } else {
      els.resultMessage.textContent = 'Not quite — reach ' + lesson.unlock.accuracy +
        '% accuracy and ' + lesson.unlock.wpm + ' WPM to unlock the next lesson. Try again!';
      els.resultMessage.className = 'result-message fail';
    }

    els.btnNextLesson.disabled = !(passed && hasNext);
    showScreen('results');
  }

  function renderProgressScreen() {
    const lessons = window.App.Lessons.LESSONS;
    els.progressLessonList.innerHTML = '';
    lessons.forEach((lesson, i) => {
      const progress = window.App.Stats.getLessonProgress(lesson.id);
      const row = document.createElement('div');
      row.className = 'progress-row';
      const status = progress.completed ? '✓' : (progress.unlocked ? '•' : '🔒');
      row.innerHTML =
        '<span class="progress-status">' + status + '</span>' +
        '<span class="progress-name">' + (i + 1) + '. ' + lesson.name + '</span>' +
        '<span class="progress-best">' + (progress.attempts > 0
          ? progress.bestWpm + ' WPM / ' + progress.bestAccuracy + '%'
          : '—') + '</span>';
      els.progressLessonList.appendChild(row);
    });

    const history = window.App.Stats.getRecentHistory(10);
    els.progressHistory.innerHTML = '';
    if (history.length === 0) {
      els.progressHistory.textContent = 'No sessions recorded yet.';
    } else {
      const table = document.createElement('table');
      table.innerHTML = '<thead><tr><th>Date</th><th>Lesson</th><th>WPM</th><th>Accuracy</th></tr></thead>';
      const tbody = document.createElement('tbody');
      const lessonNameById = {};
      lessons.forEach((l) => { lessonNameById[l.id] = l.name; });
      history.forEach((h) => {
        const tr = document.createElement('tr');
        const d = new Date(h.date);
        tr.innerHTML =
          '<td>' + d.toLocaleString() + '</td>' +
          '<td>' + (lessonNameById[h.lessonId] || h.lessonId) + '</td>' +
          '<td>' + h.wpm + '</td>' +
          '<td>' + h.accuracy + '%</td>';
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      els.progressHistory.appendChild(table);
    }
  }

  function goToLessonSelect() {
    renderLessonList();
    showScreen('lessons');
  }

  function goToProgress() {
    renderProgressScreen();
    showScreen('progress');
  }

  function init() {
    cacheEls();
    window.App.Keyboard.buildKeyboard(els.keyboard);

    els.navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target === 'lessons') goToLessonSelect();
        else if (target === 'progress') goToProgress();
      });
    });

    els.btnStart.addEventListener('click', () => {
      window.App.Stats.markWelcomeSeen();
      goToLessonSelect();
    });

    els.btnRetry.addEventListener('click', () => startLesson(currentLessonIndex));
    els.btnNextLesson.addEventListener('click', () => {
      if (!els.btnNextLesson.disabled) startLesson(currentLessonIndex + 1);
    });

    if (window.App.Stats.isFirstRun()) {
      showScreen('welcome');
    } else {
      goToLessonSelect();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
