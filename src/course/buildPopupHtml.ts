export type PopupFormState = {
  summaryText: string
  topicsText: string
  homeworkText: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toIconLines(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<span class="hand-icon">✍️</span> ${escapeHtml(line)}`)
    .join('<br>')
}

function renderMainMarkup(summaryText: string, topicsText: string, homeworkText: string): string {
  return `
    <div class="sections-wrap">
      <div class="section" onclick="togglePopup('summary-popup')" role="button" tabindex="0" aria-label="فتح ملخص الأسبوع">ملخص الأسبوع</div>
      <div class="section" onclick="togglePopup('topics-popup')" role="button" tabindex="0" aria-label="فتح عناصر المواضيع">عناصر المواضيع</div>
      <div class="section" onclick="togglePopup('homework-popup')" role="button" tabindex="0" aria-label="فتح الواجب">الواجب</div>
    </div>

    <div id="summary-popup" class="popup">
      <div class="popup-content">
        <h2 class="title title-summary"><i class="fas fa-calendar-week"></i> ملخص الأسبوع</h2>
        <p id="summary-content">${toIconLines(summaryText)}</p>
      </div>
      <button class="close-btn close-summary" onclick="closePopup('summary-popup')" aria-label="إغلاق ملخص الأسبوع">إغلاق</button>
    </div>

    <div id="topics-popup" class="popup">
      <div class="popup-content">
        <h2 class="title title-topics"><i class="fas fa-book-open"></i> عناصر المواضيع</h2>
        <p id="topics-content">${toIconLines(topicsText)}</p>
      </div>
      <button class="close-btn close-topics" onclick="closePopup('topics-popup')" aria-label="إغلاق عناصر المواضيع">إغلاق</button>
    </div>

    <div id="homework-popup" class="popup">
      <div class="popup-content">
        <h2 class="title title-homework"><i class="fas fa-tasks"></i> الواجب</h2>
        <p id="homework-content">${toIconLines(homeworkText)}</p>
      </div>
      <button class="close-btn close-homework" onclick="closePopup('homework-popup')" aria-label="إغلاق الواجب">إغلاق</button>
    </div>

    <div id="overlay" class="overlay"></div>
  `
}

function renderCss(): string {
  return `
  <style>
    body { font-family: 'Cairo', sans-serif; text-align: center; color: #1f2937; padding: 10px; direction: rtl; font-size: 18px; background: linear-gradient(135deg, #e0e7ff, #f5d0fe, #ccfbf1); min-height: 100svh; }
    .sections-wrap { max-width: 860px; margin: 12px auto; }
    .section { padding: 15px; margin: 12px auto; border-radius: 18px; border: 1px solid rgba(148,163,184,.45); cursor: pointer; font-size: 18px; font-weight: 700; width: 92%; background: rgba(255,255,255,.86); box-shadow: 0 20px 38px -14px rgba(15,23,42,.28), 0 10px 20px -14px rgba(15,23,42,.18); transition: transform .3s ease-in-out, opacity .3s ease-in-out; opacity: .95; }
    .section:hover { transform: translateY(-3px); opacity: 1; }
    .popup { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 95%; max-width: 760px; max-height: 80vh; overflow-y: auto; background: rgba(255,255,255,.9); border: 2px solid rgba(148,163,184,.45); padding: 25px; border-radius: 24px; box-shadow: 0 20px 38px -14px rgba(15,23,42,.28), 0 10px 20px -14px rgba(15,23,42,.18); z-index: 1000; text-align: right; }
    .popup-content p { white-space: pre-line; line-height: 1.9; color: #475569; font-size: 20px; display: block; }
    .title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .title-summary { color: #60a5fa; } .title-topics { color: #fb7185; } .title-homework { color: #34d399; }
    .close-btn { color: #fff; border: none; border-radius: 14px; padding: 10px 22px; cursor: pointer; margin-top: 20px; }
    .close-summary { background-color: #60a5fa; } .close-topics { background-color: #fb7185; } .close-homework { background-color: #34d399; }
    .overlay { display: none; position: fixed; inset: 0; background: rgba(2,6,23,.45); z-index: 999; }
    .hand-icon { margin-left: 8px; font-size: 16px; }
  </style>`
}

function renderScript(): string {
  return `
  <script>
    function animateIn(id, paragraph) {
      paragraph.style.opacity = '1';
      if (id === 'summary-popup') paragraph.style.transform = 'translateX(0)';
      else if (id === 'topics-popup') paragraph.style.transform = 'translateY(0)';
      else paragraph.style.transform = 'scale(1)';
    }
    function animateOut(id, paragraph) {
      paragraph.style.opacity = '0';
      if (id === 'summary-popup') paragraph.style.transform = 'translateX(60px)';
      else if (id === 'topics-popup') paragraph.style.transform = 'translateY(40px)';
      else paragraph.style.transform = 'scale(.95)';
    }
    function togglePopup(id) {
      const popup = document.getElementById(id);
      const overlay = document.getElementById('overlay');
      popup.style.display = 'block';
      overlay.style.display = 'block';
      setTimeout(function(){ animateIn(id, popup.querySelector('p')); }, 20);
    }
    function closePopup(id) {
      const popup = document.getElementById(id);
      const overlay = document.getElementById('overlay');
      animateOut(id, popup.querySelector('p'));
      setTimeout(function(){ popup.style.display = 'none'; overlay.style.display = 'none'; }, 350);
    }
    document.getElementById('overlay').addEventListener('click', function() {
      ['summary-popup', 'topics-popup', 'homework-popup'].forEach(closePopup);
    });
  <\/script>`
}

export function buildPopupStandaloneHtml(state: PopupFormState): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة الشاشات المنبثقة</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  ${renderCss()}
</head>
<body>
  ${renderMainMarkup(state.summaryText, state.topicsText, state.homeworkText)}
  ${renderScript()}
</body>
</html>`
}

export function buildPopupEmbedSnippet(state: PopupFormState): string {
  return `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
${renderCss()}
${renderMainMarkup(state.summaryText, state.topicsText, state.homeworkText)}
${renderScript()}
`
}
