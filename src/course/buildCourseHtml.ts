export type CourseFormState = {
  textDirection: 'rtl' | 'ltr'
  description: string
  objectivesText: string
  outcomesText: string
  textColor: string
  bgColor: string
  headerBorderColor: string
  subBgColor: string
  subBorderColor: string
  fontFamily: string
  fontSize: number
  bold: boolean
  italic: boolean
  underline: boolean
}

export function getSectionTitles(textDirection: 'rtl' | 'ltr') {
  return {
    description:
      textDirection === 'rtl' ? '📘 وصف المادة' : '📘 Course Description',
    objectives:
      textDirection === 'rtl' ? '🎯 أهداف المادة' : '🎯 Course Objectives',
    outcomes:
      textDirection === 'rtl'
        ? '✅ مخرجات التعلم'
        : '✅ Learning Outcomes',
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function linesToItems(text: string): string[] {
  return text.split('\n').map((l) => l.trim())
}

export function buildStandalonePreviewHtml(state: CourseFormState): string {
  const uniqueId = Date.now()
  const {
    textDirection,
    description,
    objectivesText,
    outcomesText,
    textColor,
    bgColor,
    headerBorderColor,
    subBgColor,
    subBorderColor,
    fontFamily,
    fontSize,
    bold,
    italic,
    underline,
  } = state

  const objectives = linesToItems(objectivesText).filter(Boolean)
  const outcomes = linesToItems(outcomesText).filter(Boolean)
  const titles = getSectionTitles(textDirection)

  const align = textDirection === 'rtl' ? 'right' : 'left'
  const lang = textDirection === 'rtl' ? 'ar' : 'en'
  const fontWeight = bold ? 'bold' : 'normal'
  const fontStyle = italic ? 'italic' : 'normal'
  const textDecoration = underline ? 'underline' : 'none'

  const objectivesHtml = objectives
    .map(
      (obj) =>
        `<div class="objective"><b>${escapeHtml(obj)}</b></div>`,
    )
    .join('')

  const outcomesHtml = outcomes
    .map(
      (out) =>
        `<div class="objective"><b>${escapeHtml(out)}</b></div>`,
    )
    .join('')

  const descJson = JSON.stringify(description)

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${textDirection}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>معاينة المقرر</title>
    <style>
        body {
            font-family: ${fontFamily};
            text-align: ${align};
            background: linear-gradient(120deg, #FFFFFF, ${bgColor});
            color: ${textColor};
            padding: 10px;
            direction: ${textDirection};
            font-size: ${fontSize}px;
        }
        .week-container {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 15px;
        }
        .section {
            background: white;
            color: ${textColor};
            padding: 15px;
            margin: 10px auto;
            border-radius: 10px;
            border: 2px solid ${headerBorderColor};
            cursor: pointer;
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            font-style: ${fontStyle};
            text-decoration: ${textDecoration};
            width: 90%;
        }
        .content {
            display: none;
            background: white;
            padding: 15px;
            border-radius: 10px;
            text-align: ${align};
            font-size: ${fontSize}px;
            width: 90%;
            margin: auto;
        }
        .objective {
            background: ${subBgColor};
            border: 1px solid ${subBorderColor};
            padding: 10px;
            margin: 8px auto;
            border-radius: 10px;
            transition: transform 0.3s ease;
            width: 88%;
            text-align: ${align};
        }
        .objective:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="week-container" data-week-id="${uniqueId}">
        <div class="section" onclick="handleDescriptionToggle(this)">
            ${titles.description}
        </div>
        <div class="content" id="desc_${uniqueId}"></div>

        <div class="section" onclick="handleContentToggle(this, 'obj')">
            ${titles.objectives}
        </div>
        <div class="content" id="obj_${uniqueId}">
            ${objectivesHtml}
        </div>

        <div class="section" onclick="handleContentToggle(this, 'out')">
            ${titles.outcomes}
        </div>
        <div class="content" id="out_${uniqueId}">
            ${outcomesHtml}
        </div>
    </div>

    <script>
        function handleDescriptionToggle(element) {
            const container = element.closest('.week-container');
            const content = container.querySelector('#desc_${uniqueId}');

            if (content.style.display === 'block') {
                content.style.display = 'none';
                content.innerHTML = '';
                if (content.intervalId) clearInterval(content.intervalId);
            } else {
                content.style.display = 'block';
                content.innerHTML = '';
                const text = ${descJson};
                const words = text.split(' ');
                let index = 0;

                if (content.intervalId) clearInterval(content.intervalId);
                content.intervalId = setInterval(() => {
                    if (index < words.length) {
                        content.innerHTML += words[index] + ' ';
                        index++;
                    } else {
                        clearInterval(content.intervalId);
                    }
                }, 150);
            }
        }

        function handleContentToggle(element, type) {
            const container = element.closest('.week-container');
            const content = container.querySelector('#' + type + '_${uniqueId}');
            if (content) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        }
    <\/script>
</body>
</html>`
}

/** Snippet للنسخ — نفس السلوك تقريباً مع سكربت مضمّن */
export function buildEmbedSnippet(state: CourseFormState): string {
  const uniqueId = Date.now()
  const {
    textDirection,
    description,
    objectivesText,
    outcomesText,
    textColor,
    bgColor,
    headerBorderColor,
    subBgColor,
    subBorderColor,
    fontFamily,
    fontSize,
    bold,
    italic,
    underline,
  } = state

  const objectives = linesToItems(objectivesText).filter(Boolean)
  const outcomes = linesToItems(outcomesText).filter(Boolean)
  const titles = getSectionTitles(textDirection)

  const align = textDirection === 'rtl' ? 'right' : 'left'
  const fontWeight = bold ? 'bold' : 'normal'
  const fontStyle = italic ? 'italic' : 'normal'
  const textDecoration = underline ? 'underline' : 'none'

  const objectivesBlocks = objectives
    .map(
      (obj) =>
        `<div style="background: ${subBgColor}; border: 1px solid ${subBorderColor}; padding: 10px; margin: 8px auto; border-radius: 10px; transition: transform 0.3s ease; width: 88%; text-align: ${align};" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><b>${escapeHtml(obj)}</b></div>`,
    )
    .join('')

  const outcomesBlocks = outcomes
    .map(
      (out) =>
        `<div style="background: ${subBgColor}; border: 1px solid ${subBorderColor}; padding: 10px; margin: 8px auto; border-radius: 10px; transition: transform 0.3s ease; width: 88%; text-align: ${align};" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><b>${escapeHtml(out)}</b></div>`,
    )
    .join('')

  const descJson = JSON.stringify(description)

  return `<div style="font-family: ${fontFamily}; text-align: ${align}; background: linear-gradient(120deg, #FFFFFF, ${bgColor}); color: ${textColor}; padding: 10px; direction: ${textDirection}; font-size: ${fontSize}px;">

    <div style="margin-bottom: 30px; border: 1px solid #ddd; border-radius: 10px; padding: 15px;">
        <div style="background: white; color: ${textColor}; padding: 15px; margin: 10px auto; border-radius: 10px; border: 2px solid ${headerBorderColor}; cursor: pointer; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration};" onclick="handleDescriptionToggle(this)">
            ${titles.description}
        </div>
        <div id="desc_${uniqueId}" style="display: none; background: white; padding: 15px; border-radius: 10px; text-align: ${align}; font-size: ${fontSize}px; width: 90%; margin: auto;"></div>

        <div style="background: white; color: ${textColor}; padding: 15px; margin: 10px auto; border-radius: 10px; border: 2px solid ${headerBorderColor}; cursor: pointer; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration};" onclick="handleContentToggle(this, 'obj')">
            ${titles.objectives}
        </div>
        <div id="obj_${uniqueId}" style="display: none; background: white; padding: 15px; border-radius: 10px; text-align: ${align}; font-size: ${fontSize}px; width: 90%; margin: auto;">
            ${objectivesBlocks}
        </div>

        <div style="background: white; color: ${textColor}; padding: 15px; margin: 10px auto; border-radius: 10px; border: 2px solid ${headerBorderColor}; cursor: pointer; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration};" onclick="handleContentToggle(this, 'out')">
            ${titles.outcomes}
        </div>
        <div id="out_${uniqueId}" style="display: none; background: white; padding: 15px; border-radius: 10px; text-align: ${align}; font-size: ${fontSize}px; width: 90%; margin: auto;">
            ${outcomesBlocks}
        </div>
    </div>

    <script>
        function handleDescriptionToggle(element) {
            const container = element.parentElement;
            const content = container.querySelector('#desc_${uniqueId}');

            if (content.style.display === 'block') {
                content.style.display = 'none';
                content.innerHTML = '';
                if (content.intervalId) clearInterval(content.intervalId);
            } else {
                content.style.display = 'block';
                content.innerHTML = '';
                const text = ${descJson};
                const words = text.split(' ');
                let index = 0;

                if (content.intervalId) clearInterval(content.intervalId);
                content.intervalId = setInterval(() => {
                    if (index < words.length) {
                        content.innerHTML += words[index] + ' ';
                        index++;
                    } else {
                        clearInterval(content.intervalId);
                    }
                }, 150);
            }
        }

        function handleContentToggle(element, type) {
            const container = element.parentElement;
            const content = container.querySelector('#' + type + '_${uniqueId}');
            if (content) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        }
    <\/script>
</div>`
}
