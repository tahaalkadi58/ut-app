export type CircleSection = {
  title: string
  text: string
  color: string // background color
  textColor: string
}

export type CirclePopupState = {
  mainTitle: string
  mainColor: string
  mainTextColor: string
  sections: CircleSection[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function calculateCircleSize(text: string, isMain = false) {
  const baseSize = isMain ? 120 : 85
  const safe = text ?? ''
  const textLength = safe.length
  const extraSize = textLength * 3
  return Math.max(baseSize, baseSize + extraSize)
}

function toIconLinesHtml(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<span style="margin-inline-start: 10px; font-size: 20px;">✍️</span> ${escapeHtml(line)}`)
    .join('<br>')
}

function renderBaseStyle(): string {
  return `
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      text-align: center;
      color: #1f2937;
      padding: 10px;
      direction: rtl;
      font-size: 18px;
      background: linear-gradient(135deg, #e0e7ff, #f5d0fe 45%, #ccfbf1);
      min-height: 100svh;
      margin: 0;
    }
    .circle-stage {
      position: relative;
      width: 400px;
      height: 400px;
      margin: 20px auto;
      border: 1px solid transparent;
    }
    .circle {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.3s ease, filter 0.3s ease;
      box-sizing: border-box;
      padding: 12px;
      user-select: none;
    }
    .circle:hover {
      transform: translateZ(0) scale(1.08);
      filter: brightness(85%);
    }
    .popup {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 95%;
      max-width: 760px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 25px;
      border-radius: 24px;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(14px);
      box-shadow: 0 20px 38px -14px rgba(15,23,42,.28), 0 10px 20px -14px rgba(15,23,42,.18);
      z-index: 1000;
      text-align: right;
    }
    .popup-content h2 {
      margin: 0 0 18px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-end;
      font-weight: bold;
      font-size: 28px;
      flex-direction: row-reverse;
    }
    .popup-content p {
      font-size: 24px;
      white-space: pre-line;
      color: #475569;
      opacity: 0;
      transform: translateX(50px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .popup.active .popup-content p {
      opacity: 1;
      transform: translateX(0);
    }
    .close-btn {
      border: none;
      border-radius: 14px;
      padding: 10px 22px;
      cursor: pointer;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      transition: opacity 0.3s ease, transform 0.3s ease;
      margin-top: 20px;
    }
    .close-btn:hover { opacity: 0.92; transform: translateY(-1px); }
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      cursor: pointer;
    }
    .hand-icon { margin-inline-start: 10px; font-size: 20px; }
  </style>
  `
}

function renderHtml(state: CirclePopupState): string {
  const containerCenter = { x: 200, y: 200 }
  const sectionsCount = state.sections.length

  const subSize =
    Math.max(
      85,
      Math.max(
        0,
        ...state.sections.map((s) => calculateCircleSize(s.title, false)),
      ),
    ) || 85

  const mainSize = Math.max(
    calculateCircleSize(state.mainTitle, true),
    subSize * 1.5,
  )

  const mainRadius = mainSize / 2
  const radius = mainRadius + 100
  const subRadius = subSize / 2

  const positions = state.sections.map((_, i) => {
    if (sectionsCount === 0) return { left: 0, top: 0 }
    const angle = (2 * Math.PI / sectionsCount) * i
    const x = containerCenter.x + radius * Math.cos(angle) - subRadius
    const y = containerCenter.y + radius * Math.sin(angle) - subRadius
    return { left: Math.round(x), top: Math.round(y) }
  })

  const mainTitle = state.mainTitle || 'العنوان الرئيسي'

  const mainPopupId = 'main-popup'
  const mainPopupBorder = state.mainColor
  const mainPopupTitleHtml = `
    <h2 style="color: ${mainPopupBorder};">
      <span>${escapeHtml(mainTitle)}</span>
      <i class="fas fa-heading"></i>
    </h2>
  `

  const mainPopupContent = `
    <p id="main-popup-content">${toIconLinesHtml('هذا هو محتوى العنوان الرئيسي.')}</p>
  `

  const subPopupsHtml = state.sections
    .map((s, i) => {
      const popupId = `popup-${i}`
      const borderColor = s.color
      const titleHtml = `
        <h2 style="color: ${borderColor};">
          <span>${escapeHtml(s.title || `عنوان ${i + 1}`)}</span>
          <i class="fas fa-tag"></i>
        </h2>
      `
      const contentHtml = `<p>${toIconLinesHtml(s.text || '')}</p>`
      return `
        <div id="${popupId}" class="popup" style="border: 4px solid ${borderColor};">
          <div class="popup-content">
            ${titleHtml}
            ${contentHtml}
          </div>
          <button class="close-btn" onclick="closePopup('${popupId}')" style="background-color: ${borderColor};">
            إغلاق
          </button>
        </div>
      `
    })
    .join('')

  const subCirclesHtml = state.sections
    .map((s, i) => {
      const left = positions[i].left
      const top = positions[i].top
      const circleTitle = s.title || `عنوان ${i + 1}`
      return `
        <div
          onclick="togglePopup('popup-${i}')"
          role="button"
          tabindex="0"
          aria-label="فتح ${escapeHtml(circleTitle)}"
          class="circle"
          style="
            width: ${subSize}px;
            height: ${subSize}px;
            background-color: ${s.color};
            color: ${s.textColor};
            position: absolute;
            left: ${left}px;
            top: ${top}px;
            font-size: 16px;
            padding: 12px;
          "
        >
          ${escapeHtml(circleTitle)}
        </div>
      `
    })
    .join('')

  return `
  <div class="circle-stage">
    <div
      class="circle"
      onclick="togglePopup('${mainPopupId}')"
      role="button"
      tabindex="0"
      aria-label="فتح العنوان الرئيسي"
      style="
        width: ${mainSize}px;
        height: ${mainSize}px;
        background-color: ${state.mainColor};
        color: ${state.mainTextColor};
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        padding: 15px;
        z-index: 10;
      "
    >
      ${escapeHtml(mainTitle)}
    </div>
    ${subCirclesHtml}
  </div>

  <div id="popups-container">
    <div id="${mainPopupId}" class="popup" style="border: 4px solid ${state.mainColor};">
      <div class="popup-content">
        ${mainPopupTitleHtml}
        ${mainPopupContent}
      </div>
      <button class="close-btn" onclick="closePopup('${mainPopupId}')" style="background-color: ${state.mainColor};">
        إغلاق
      </button>
    </div>
    ${subPopupsHtml}
  </div>

  <div id="overlay" class="overlay" onclick="closeAllPopups()"></div>
  `
}

export function buildCirclePopupStandaloneHtml(state: CirclePopupState): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة المخطط</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  ${renderBaseStyle()}
</head>
<body>
  ${renderHtml(state)}
  <script>
    function closeAllPopups() {
      document.querySelectorAll('.popup').forEach(function(popup) {
        popup.classList.remove('active');
        popup.style.display = 'none';
      });
      var overlay = document.getElementById('overlay');
      if (overlay) overlay.style.display = 'none';
    }

    function togglePopup(popupId) {
      closeAllPopups();
      var popup = document.getElementById(popupId);
      var overlay = document.getElementById('overlay');
      if (!popup || !overlay) return;

      popup.style.display = 'block';
      overlay.style.display = 'block';
      setTimeout(function() {
        popup.classList.add('active');
      }, 30);
    }

    function closePopup(popupId) {
      var popup = document.getElementById(popupId);
      var overlay = document.getElementById('overlay');
      if (!popup) return;

      popup.classList.remove('active');
      setTimeout(function() {
        popup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
      }, 300);
    }
  <\/script>
</body>
</html>`
}

export function buildCirclePopupEmbedSnippet(state: CirclePopupState): string {
  return `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
${renderBaseStyle()}
${renderHtml(state)}
<script>
  function closeAllPopups() {
    document.querySelectorAll('.popup').forEach(function(popup) {
      popup.classList.remove('active');
      popup.style.display = 'none';
    });
    var overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function togglePopup(popupId) {
    closeAllPopups();
    var popup = document.getElementById(popupId);
    var overlay = document.getElementById('overlay');
    if (!popup || !overlay) return;

    popup.style.display = 'block';
    overlay.style.display = 'block';
    setTimeout(function() {
      popup.classList.add('active');
    }, 30);
  }

  function closePopup(popupId) {
    var popup = document.getElementById(popupId);
    var overlay = document.getElementById('overlay');
    if (!popup) return;

    popup.classList.remove('active');
    setTimeout(function() {
      popup.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
    }, 300);
  }
<\/script>
`.trim()
}

