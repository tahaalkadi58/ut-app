import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Tooltip } from '../components/ui/Tooltip'
import { cn } from '../lib/cn'
import {
  buildCirclePopupEmbedSnippet,
  buildCirclePopupStandaloneHtml,
  type CirclePopupState,
  type CircleSection,
} from '../course/buildCirclePopupHtml'
import { Copy, ExternalLink, LayoutGrid, Plus } from 'lucide-react'

const inputClass =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-[var(--text-primary)] shadow-inner transition-all duration-300 ease-in-out placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35'

const labelRowClass =
  'mb-1 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--text-primary)]'

const colorPalettes: string[][] = [
  ['#FF5733', '#E39F82'],
  ['#6CB4EE', '#A0E9FF'],
  ['#7FD7A6', '#B0F2B4'],
  ['#E0BBE4', '#957DAD'],
  ['#F9F871', '#FEEB65'],
  ['#FF6B6B', '#FFA07A'],
  ['#4ECDC4', '#88D8B0'],
  ['#45B7D1', '#96D4D0'],
  ['#96CEB4', '#FEE0A2'],
  ['#FFEEAD', '#FFD700'],
  ['#C7CEEA', '#B5EAD7'],
  ['#FF9AA2', '#FFB7B2'],
  ['#A0CED2', '#ADE2D5'],
  ['#D4A5A5', '#E5D9B6'],
  ['#A2B3A1', '#D4E1B5'],
  ['#8A9BA8', '#B6D0E2'],
  ['#F6BDC0', '#F2D0A4'],
  ['#A0D2EB', '#CFE0FC'],
  ['#B5EAD7', '#8CC084'],
  ['#FFD700', '#FFA500'],
]

function isLightColor(color: string) {
  const hex = (color || '').replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

function calculateCircleSize(text: string, isMain = false) {
  const baseSize = isMain ? 120 : 85
  const safe = text ?? ''
  const textLength = safe.length
  const extraSize = textLength * 3
  return Math.max(baseSize, baseSize + extraSize)
}

function getRandomPaletteColor(used: number[]) {
  const available = colorPalettes
    .map((_, i) => i)
    .filter((i) => !used.includes(i))
  if (!available.length) {
    used.length = 0
  }
  const randomIndex = Math.floor(Math.random() * (available.length || 1))
  const chosenPaletteIndex = available[randomIndex] ?? 0
  used.push(chosenPaletteIndex)
  return colorPalettes[chosenPaletteIndex][0]
}

function toSectionIconLines(text: string) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

type PopupId = { kind: 'main' } | { kind: 'section'; index: number }

export function CirclePopupDesignerPage() {
  const [mainTitle, setMainTitle] = useState('العنوان الرئيسي')
  const [sections, setSections] = useState<CircleSection[]>([])
  const [mainColor, setMainColor] = useState('#6CB4EE')
  const [mainTextColor, setMainTextColor] = useState('#FFFFFF')

  const [openPopupId, setOpenPopupId] = useState<PopupId | null>(null)
  const [closing, setClosing] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const regenerateColors = useCallback(() => {
    const used: number[] = []
    const nextMainColor = getRandomPaletteColor(used)
    setMainColor(nextMainColor)
    setMainTextColor(isLightColor(nextMainColor) ? '#000000' : '#FFFFFF')

    setSections((prev) =>
      prev.map((s) => {
        const color = getRandomPaletteColor(used)
        return { ...s, color, textColor: isLightColor(color) ? '#000000' : '#FFFFFF' }
      }),
    )
  }, [])

  const addSection = useCallback(() => {
    setSections((prev) => {
      const index = prev.length + 1
      return [
        ...prev,
        {
          title: `عنوان ${index}`,
          text: '',
          color: '#4ECDC4',
          textColor: '#FFFFFF',
        },
      ]
    })
  }, [])

  const updateSection = useCallback(
    (index: number, patch: Partial<CircleSection>) => {
      setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
    },
    [],
  )

  const removeSection = useCallback((index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const layout = useMemo(() => {
    const count = sections.length
    const subSize =
      Math.max(85, ...sections.map((s) => calculateCircleSize(s.title, false))) || 85

    const mainSize = Math.max(calculateCircleSize(mainTitle, true), subSize * 1.5)
    const mainRadius = mainSize / 2
    const radius = mainRadius + 100
    const subRadius = subSize / 2

    const centerX = 200
    const centerY = 200

    const positions = sections.map((_, i) => {
      if (count === 0) return { left: 0, top: 0 }
      const angle = (2 * Math.PI / count) * i
      const x = centerX + radius * Math.cos(angle) - subRadius
      const y = centerY + radius * Math.sin(angle) - subRadius
      return { left: Math.round(x), top: Math.round(y) }
    })

    return { subSize, mainSize, positions }
  }, [mainTitle, sections])

  const closePopup = useCallback(() => {
    if (!openPopupId) return
    setClosing(true)
    window.setTimeout(() => {
      setOpenPopupId(null)
      setClosing(false)
    }, 300)
  }, [openPopupId])

  const startOpenPopup = useCallback((id: PopupId) => {
    setClosing(false)
    setOpenPopupId(id)
  }, [])

  const onUpdatePopups = useCallback(() => {
    regenerateColors()
    setModalTitle('تم تحديث النصوص بنجاح!')
    setModalMessage('تم تحديث العناوين والألوان وإعادة حساب تخطيط الدوائر.')
    setModalOpen(true)
  }, [regenerateColors])

  const copyEmbed = useCallback(async () => {
    const state: CirclePopupState = {
      mainTitle,
      mainColor,
      mainTextColor,
      sections,
    }
    try {
      await navigator.clipboard.writeText(buildCirclePopupEmbedSnippet(state))
      setModalTitle('تم نسخ الكود')
      setModalMessage('تم نسخ كود المخطط إلى الحافظة.')
      setModalOpen(true)
    } catch {
      setModalTitle('خطأ في النسخ')
      setModalMessage('تعذر الوصول إلى الحافظة. حاول نسخ المحتوى يدوياً.')
      setModalOpen(true)
    }
  }, [mainColor, mainTextColor, mainTitle, sections])

  const openStandalone = useCallback(() => {
    const state: CirclePopupState = {
      mainTitle,
      mainColor,
      mainTextColor,
      sections,
    }
    const html = buildCirclePopupStandaloneHtml(state)
    const w = window.open()
    if (!w) {
      setModalTitle('تعذر فتح المعاينة')
      setModalMessage('اسمح للمتصفح بفتح النوافذ المنبثقة ثم أعد المحاولة.')
      setModalOpen(true)
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }, [mainColor, mainTextColor, mainTitle, sections])

  const popup = useMemo(() => {
    if (!openPopupId) return null
    if (openPopupId.kind === 'main') {
      return {
        borderColor: mainColor,
        title: mainTitle,
        contentLines: toSectionIconLines('هذا هو محتوى العنوان الرئيسي.'),
      }
    }
    const s = sections[openPopupId.index]
    if (!s) return null
    return {
      borderColor: s.color,
      title: s.title || `عنوان ${openPopupId.index + 1}`,
      contentLines: toSectionIconLines(s.text),
    }
  }, [mainColor, mainTitle, openPopupId, sections])

  const popupParagraphClass = cn(
    'text-xl md:text-2xl text-[var(--text-muted)]',
    'opacity-0 translate-x-12 transition-all duration-300 ease-in-out leading-relaxed',
    openPopupId && !closing && 'opacity-100 translate-x-0',
    openPopupId && closing && 'opacity-0 translate-x-12',
  )

  return (
    <>
      <header className="flex items-center gap-3 text-right">
        <span className="flex size-12 items-center justify-center rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl">
          <LayoutGrid className="size-6 text-[var(--accent)]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            نموذج تفاعلي مع مخطط الدوائر
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            الصفحة الرابعة: تحويل `fn.html` إلى جزء من التطبيق
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">المدخلات</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">أضف عنواناً رئيسياً ثم عناوين فرعية</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className={labelRowClass}>
                <label htmlFor="mainTitle">العنوان الرئيسي</label>
                <Tooltip label="حجم الدائرة يتغير حسب طول النص" />
              </div>
              <input
                id="mainTitle"
                type="text"
                className={inputClass}
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                placeholder="أدخل العنوان الرئيسي"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="secondary" onClick={addSection} type="button">
                <Plus className="size-4" aria-hidden />
                إضافة عنوان فرعي
              </Button>
              <Button variant="secondary" onClick={onUpdatePopups} type="button">
                تحديث النصوص
              </Button>
            </div>

            {sections.length ? (
              <div className="space-y-3">
                {sections.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--glass-border)] bg-white/5 p-3 backdrop-blur-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">عنوان #{i + 1}</p>
                      <Button
                        variant="ghost"
                        className="!px-3 !py-1"
                        type="button"
                        onClick={() => removeSection(i)}
                        aria-label={`حذف عنوان ${i + 1}`}
                      >
                        حذف
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`section-${i}-title`} className={labelRowClass}>
                          عنوان فرعي
                        </label>
                        <input
                          id={`section-${i}-title`}
                          type="text"
                          className={inputClass}
                          value={s.title}
                          onChange={(e) => updateSection(i, { title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor={`section-${i}-text`} className={labelRowClass}>
                          نص العنوان الفرعي
                        </label>
                        <textarea
                          id={`section-${i}-text`}
                          rows={3}
                          className={cn(inputClass, 'min-h-[84px] resize-y')}
                          value={s.text}
                          onChange={(e) => updateSection(i, { text: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                لا توجد عناوين فرعية بعد. اضغط `إضافة عنوان فرعي`.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={openStandalone} type="button">
                <ExternalLink className="size-4" aria-hidden />
                معاينة
              </Button>
              <Button onClick={() => void copyEmbed()} type="button">
                <Copy className="size-4" aria-hidden />
                إنشاء ونسخ الكود
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">المعاينة التفاعلية</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">اضغط على الدوائر لفتح النوافذ المنبثقة</p>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto">
              <div className="relative mx-auto h-[400px] w-[400px]">
                <button
                  type="button"
                  onClick={() => startOpenPopup({ kind: 'main' })}
                  className="absolute rounded-full p-4 font-bold text-[20px] transition-all duration-300 ease-in-out hover:scale-[1.08]"
                  style={{
                    width: layout.mainSize,
                    height: layout.mainSize,
                    backgroundColor: mainColor,
                    color: mainTextColor,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                  aria-label="فتح نافذة العنوان الرئيسي"
                >
                  {mainTitle || 'العنوان الرئيسي'}
                </button>

                {sections.map((s, i) => {
                  const pos = layout.positions[i]
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => startOpenPopup({ kind: 'section', index: i })}
                      className="absolute rounded-full p-3 font-bold text-[16px] transition-all duration-300 ease-in-out hover:scale-[1.08]"
                      style={{
                        width: layout.subSize,
                        height: layout.subSize,
                        backgroundColor: s.color,
                        color: s.textColor,
                        left: pos.left,
                        top: pos.top,
                        zIndex: 5,
                      }}
                      aria-label={`فتح نافذة ${s.title || `عنوان ${i + 1}`}`}
                    >
                      {s.title || `عنوان ${i + 1}`}
                    </button>
                  )
                })}
              </div>
            </div>

            {openPopupId && popup ? (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out"
                  aria-hidden
                  onClick={closePopup}
                />
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border-4 bg-[var(--glass-surface)] p-6 shadow-[var(--shadow-hover)] backdrop-blur-xl"
                  style={{ borderColor: popup.borderColor }}
                  role="dialog"
                  aria-modal="true"
                  aria-label={popup.title}
                >
                  <div className="flex items-center justify-end gap-3">
                    <h2 className="flex items-center gap-2 text-2xl font-bold" style={{ color: popup.borderColor }}>
                      <span>{popup.title}</span>
                      <span aria-hidden>
                        {openPopupId.kind === 'main' ? '🔖' : '🏷️'}
                      </span>
                    </h2>
                  </div>

                  <div className="mt-3">
                    <p className={popupParagraphClass}>
                      {popup.contentLines.length ? (
                        popup.contentLines.map((line, idx) => (
                          <span key={idx}>
                            <span aria-hidden className="mr-[10px]">
                              ✍️
                            </span>
                            {line}
                            {idx < popup.contentLines.length - 1 ? <br /> : null}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--text-muted)]"> </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Button
                      variant="secondary"
                      className="!bg-transparent !border-0 !shadow-none !text-white !px-6 !py-2"
                      style={
                        {
                          backgroundColor: popup.borderColor,
                          borderRadius: '14px',
                        } as any
                      }
                      onClick={closePopup}
                      type="button"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        <p>{modalMessage}</p>
      </Modal>
    </>
  )
}

