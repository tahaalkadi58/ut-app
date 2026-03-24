export type QuizAnswer = {
  text: string
  correct: boolean
}

export type QuizQuestion = {
  text: string
  answers: QuizAnswer[]
  scoringType: 'full' | 'partial'
}

export type QuizTest = {
  id: string
  name: string
  totalMarks: number
  timeLimit: number
  maxAttempts: number
  questions: QuizQuestion[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildStudentQuizHtml(test: QuizTest): string {
  const payload = JSON.stringify(test)
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(test.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Cairo',sans-serif;background:linear-gradient(135deg,#e0e7ff,#f5d0fe,#ccfbf1);min-height:100svh;margin:0;padding:24px;color:#0f172a}
    .panel{max-width:980px;margin:0 auto;background:rgba(255,255,255,.88);border:1px solid rgba(148,163,184,.35);border-radius:24px;padding:24px;box-shadow:0 22px 45px -18px rgba(15,23,42,.22)}
    .question{margin-top:16px;padding:16px;border-radius:16px;border:1px solid rgba(148,163,184,.3);background:rgba(255,255,255,.8)}
    .option{margin-top:8px;padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35)}
    .btn{margin-top:14px;border:none;border-radius:12px;padding:10px 16px;background:#6366f1;color:#fff;font-family:inherit;font-weight:700;cursor:pointer}
    .result{margin-top:12px;padding:12px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,.3)}
  </style>
</head>
<body>
  <div class="panel">
    <h1>${escapeHtml(test.name)}</h1>
    <p>الدرجة الكلية: ${test.totalMarks} | الزمن: ${test.timeLimit} دقيقة</p>
    <div id="timer"></div>
    <div id="questions"></div>
    <button class="btn" onclick="finish()">إنهاء الاختبار</button>
    <div id="result" class="result"></div>
  </div>
  <script>
    const test = ${payload};
    let remaining = (test.timeLimit || 10) * 60;
    let t = null;
    function render() {
      const root = document.getElementById('questions');
      root.innerHTML = test.questions.map((q, qi) => {
        const options = q.answers.map((a, ai) => {
          return '<label class="option"><input type="checkbox" data-q="'+qi+'" data-a="'+ai+'"> ' + a.text + '</label>';
        }).join('');
        return '<div class="question"><h3>س'+(qi+1)+': '+q.text+'</h3>'+options+'</div>';
      }).join('');
    }
    function scoreQuestion(q, selected) {
      const correctIdx = q.answers.map((a, i) => a.correct ? i : -1).filter(i => i >= 0);
      if (!correctIdx.length) return 0;
      if (q.scoringType === 'full') {
        const ok = correctIdx.length === selected.length && correctIdx.every(i => selected.includes(i));
        return ok ? 1 : 0;
      }
      let gain = 0;
      selected.forEach(i => { if (correctIdx.includes(i)) gain += 1 / correctIdx.length; else gain -= 1 / q.answers.length; });
      if (gain < 0) gain = 0;
      if (gain > 1) gain = 1;
      return gain;
    }
    function finish() {
      clearInterval(t);
      let sum = 0;
      test.questions.forEach((q, qi) => {
        const selected = Array.from(document.querySelectorAll('input[data-q="'+qi+'"]:checked')).map(el => Number(el.getAttribute('data-a')));
        sum += scoreQuestion(q, selected);
      });
      const grade = Math.round((sum / Math.max(test.questions.length,1)) * test.totalMarks);
      document.getElementById('result').innerHTML = '<h3>النتيجة</h3><p>درجتك: '+grade+' / '+test.totalMarks+'</p>';
    }
    function tick() {
      remaining -= 1;
      const m = Math.floor(Math.max(remaining,0) / 60);
      const s = Math.max(remaining,0) % 60;
      document.getElementById('timer').textContent = 'الوقت المتبقي: ' + m + ':' + String(s).padStart(2,'0');
      if (remaining <= 0) finish();
    }
    render();
    tick();
    t = setInterval(tick, 1000);
  <\/script>
</body>
</html>`
}

