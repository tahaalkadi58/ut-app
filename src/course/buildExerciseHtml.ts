export type ExercisePair = {
  left: string
  right: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildExerciseStandaloneHtml(question: string, pairs: ExercisePair[]): string {
  const safeQuestion = escapeHtml(question || 'تمرين تفاعلي')
  const payload = JSON.stringify(pairs)

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تمرين الطالب</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; background: linear-gradient(135deg,#e0e7ff,#f5d0fe,#ccfbf1); min-height:100svh; margin:0; padding:2rem; color:#1f2937; }
    .panel { max-width: 960px; margin: 0 auto; background: rgba(255,255,255,.88); border:1px solid rgba(148,163,184,.4); border-radius: 24px; padding: 24px; box-shadow: 0 22px 42px -16px rgba(15,23,42,.28); }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem; }
    .card { background: rgba(255,255,255,.9); border:1px solid rgba(148,163,184,.4); border-radius:16px; padding:1rem; }
    .row { display:flex; flex-direction:column; gap:.5rem; margin-bottom:.75rem; }
    .item { background: #fff; border:1px solid rgba(148,163,184,.4); border-radius:12px; padding:.75rem; }
    .select { width:100%; padding:.5rem .75rem; border-radius:10px; border:1px solid rgba(148,163,184,.5); font-family:inherit; }
    .btn { border:none; border-radius:12px; padding:.65rem 1rem; cursor:pointer; background:#6366f1; color:#fff; font-family:inherit; font-weight:700; }
    .results { margin-top:1rem; padding:1rem; background:#fff; border-radius:12px; border:1px solid rgba(148,163,184,.4); }
    @media (max-width: 780px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="panel">
    <h2>${safeQuestion}</h2>
    <div class="grid">
      <div class="card" id="left-list"></div>
      <div class="card" id="right-list"></div>
    </div>
    <div style="margin-top:1rem; display:flex; gap:.75rem; flex-wrap:wrap;">
      <button class="btn" onclick="resetExercise()">إعادة المحاولة</button>
      <button class="btn" onclick="checkAnswers()">تصحيح الإجابات</button>
    </div>
    <div class="results" id="results"></div>
  </div>
  <script>
    const pairs = ${payload};
    let shuffled = [];
    function makeShuffle() {
      shuffled = [...pairs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    function render() {
      const left = document.getElementById('left-list');
      const right = document.getElementById('right-list');
      left.innerHTML = '';
      right.innerHTML = '';
      pairs.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = '<div class="item">' + p.left + '</div>';
        const select = document.createElement('select');
        select.className = 'select';
        select.dataset.index = String(idx);
        select.innerHTML = '<option value="">اختر الإجابة</option>' + shuffled.map(s => '<option value="' + s.right + '">' + s.right + '</option>').join('');
        row.appendChild(select);
        left.appendChild(row);
      });
      right.innerHTML = shuffled.map((p, i) => '<div class="item">' + (i + 1) + '. ' + p.right + '</div>').join('');
    }
    function checkAnswers() {
      let correct = 0;
      document.querySelectorAll('.select').forEach((el) => {
        const idx = Number(el.dataset.index);
        if (el.value === pairs[idx].right) correct += 1;
      });
      document.getElementById('results').innerHTML = '<h3>النتيجة</h3><p>✅ الصحيحة: ' + correct + '</p><p>❌ الخاطئة: ' + (pairs.length - correct) + '</p>';
    }
    function resetExercise() {
      makeShuffle();
      render();
      document.getElementById('results').innerHTML = '';
    }
    resetExercise();
  <\/script>
</body>
</html>`
}

export function buildExerciseEmbedSnippet(question: string, pairs: ExercisePair[]): string {
  return buildExerciseStandaloneHtml(question, pairs)
}

export function buildShuffledRights(pairs: ExercisePair[]): string[] {
  return shuffle(pairs.map((p) => p.right))
}
