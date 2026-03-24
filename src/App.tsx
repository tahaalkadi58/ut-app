import { useCallback, useEffect, useState } from 'react'
import {
  buildEmbedSnippet,
  buildStandalonePreviewHtml,
  type CourseFormState,
} from './course/buildCourseHtml'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader } from './components/ui/Card'
import { Modal } from './components/ui/Modal'
import { Tooltip } from './components/ui/Tooltip'
import { cn } from './lib/cn'
import { Copy, ExternalLink, Moon, Sparkles, Sun } from 'lucide-react'

const initialState: CourseFormState = {
  textDirection: 'rtl',
  description: '',
  objectivesText: '',
  outcomesText: '',
  textColor: '#333333',
  bgColor: '#DADADA',
  headerBorderColor: '#800020',
  subBgColor: '#DCDCDC',
  subBorderColor: '#800020',
  fontFamily: "'Cairo', sans-serif",
  fontSize: 18,
  bold: false,
  italic: false,
  underline: false,
}

const inputClass =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-[var(--text-primary)] shadow-inner transition-all duration-300 ease-in-out placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35'

const labelRowClass = 'mb-1 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--text-primary)]'

function useThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      root.classList.add('dark')
      setDark(true)
    } else if (stored === 'light') {
      root.classList.remove('dark')
      setDark(false)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
      setDark(true)
    }
  }, [])

  const toggle = useCallback(() => {
    const root = document.documentElement
    const next = !root.classList.contains('dark')
    root.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }, [])

  return { dark, toggle }
}

export default function App() {
  const [state, setState] = useState<CourseFormState>(initialState)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const { dark, toggle } = useThemeToggle()

  const patch = useCallback(
    <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => {
      setState((s) => ({ ...s, [key]: value }))
    },
    [],
  )

  const openPreview = useCallback(() => {
    const html = buildStandalonePreviewHtml(state)
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
  }, [state])

  const copyCode = useCallback(async () => {
    const snippet = buildEmbedSnippet(state)
    try {
      await navigator.clipboard.writeText(snippet)
      setModalTitle('تم النسخ')
      setModalMessage('تم نسخ الكود إلى الحافظة بنجاح.')
      setModalOpen(true)
    } catch {
      setModalTitle('خطأ في النسخ')
      setModalMessage('تعذر الوصول إلى الحافظة. حاول نسخ المحتوى يدوياً من أدوات المطوّر.')
      setModalOpen(true)
    }
  }, [state])

  return (
    <div className="min-h-svh px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <span className="flex size-12 items-center justify-center rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl transition-transform duration-300 ease-in-out hover:-translate-y-0.5">
              <Sparkles className="size-6 text-[var(--accent)]" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                تصميم مقرر دراسي
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                أنشئ كود HTML تفاعلياً مع معاينة فورية ونسخ سريع
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={toggle}
            aria-label={dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            className="shrink-0"
          >
            {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
            <span>{dark ? 'فاتح' : 'داكن'}</span>
          </Button>
        </header>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">البيانات والتنسيق</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              املأ الحقول ثم استخدم المعاينة أو نسخ الكود
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className={labelRowClass}>
                <label htmlFor="textDirection">اتجاه النص</label>
                <Tooltip label="يحدد اتجاه الصفحة المُنشأة والعناوين بالعربية أو الإنجليزية" />
              </div>
              <select
                id="textDirection"
                className={inputClass}
                value={state.textDirection}
                onChange={(e) =>
                  patch('textDirection', e.target.value as 'rtl' | 'ltr')
                }
              >
                <option value="rtl">عربي (يمين لليسار)</option>
                <option value="ltr">إنجليزي (يسار لليمين)</option>
              </select>
            </div>

            <div>
              <div className={labelRowClass}>
                <label htmlFor="description">وصف المادة</label>
                <Tooltip label="يظهر عند فتح قسم وصف المادة، مع عرض تدريجي للكلمات" />
              </div>
              <textarea
                id="description"
                rows={4}
                placeholder="أدخل وصف المادة هنا..."
                className={cn(inputClass, 'min-h-[120px] resize-y')}
                value={state.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </div>

            <div>
              <div className={labelRowClass}>
                <label htmlFor="objectives">الأهداف</label>
                <Tooltip label="كل هدف في سطر جديد" />
              </div>
              <textarea
                id="objectives"
                rows={4}
                placeholder="أدخل الأهداف هنا..."
                className={cn(inputClass, 'min-h-[120px] resize-y')}
                value={state.objectivesText}
                onChange={(e) => patch('objectivesText', e.target.value)}
              />
            </div>

            <div>
              <div className={labelRowClass}>
                <label htmlFor="outcomes">مخرجات التعلم</label>
                <Tooltip label="كل مخرج في سطر جديد" />
              </div>
              <textarea
                id="outcomes"
                rows={4}
                placeholder="أدخل مخرجات التعلم هنا..."
                className={cn(inputClass, 'min-h-[120px] resize-y')}
                value={state.outcomesText}
                onChange={(e) => patch('outcomesText', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelRowClass} htmlFor="textColor">
                  لون الخط
                </label>
                <input
                  id="textColor"
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state.textColor}
                  onChange={(e) => patch('textColor', e.target.value)}
                />
              </div>
              <div>
                <label className={labelRowClass} htmlFor="bgColor">
                  لون الخلفية
                </label>
                <input
                  id="bgColor"
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state.bgColor}
                  onChange={(e) => patch('bgColor', e.target.value)}
                />
              </div>
              <div>
                <label className={labelRowClass} htmlFor="headerBorderColor">
                  لون إطار العناوين
                </label>
                <input
                  id="headerBorderColor"
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state.headerBorderColor}
                  onChange={(e) => patch('headerBorderColor', e.target.value)}
                />
              </div>
              <div>
                <label className={labelRowClass} htmlFor="subBgColor">
                  لون خلفية الجمل الفرعية
                </label>
                <input
                  id="subBgColor"
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state.subBgColor}
                  onChange={(e) => patch('subBgColor', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelRowClass} htmlFor="subBorderColor">
                  لون إطار الجمل الفرعية
                </label>
                <input
                  id="subBorderColor"
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state.subBorderColor}
                  onChange={(e) => patch('subBorderColor', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelRowClass} htmlFor="fontFamily">
                اختيار الخط
              </label>
              <select
                id="fontFamily"
                className={inputClass}
                value={state.fontFamily}
                onChange={(e) => patch('fontFamily', e.target.value)}
              >
                <option value="'Cairo', sans-serif">Cairo</option>
                <option value="'Amiri', serif">Amiri</option>
                <option value="'Arial', sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>

            <div>
              <div className={labelRowClass}>
                <label htmlFor="fontSize">حجم الخط</label>
                <Tooltip label="بين 10 و 30 بكسل كما في النموذج الأصلي" />
              </div>
              <input
                id="fontSize"
                type="number"
                min={10}
                max={30}
                className={inputClass}
                value={state.fontSize}
                onChange={(e) => patch('fontSize', Number(e.target.value))}
              />
            </div>

            <fieldset className="rounded-2xl border border-[var(--glass-border)] bg-white/5 p-4 dark:bg-white/5">
              <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">
                نمط الخط
              </legend>
              <div className="mt-2 flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[var(--input-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={state.bold}
                    onChange={(e) => patch('bold', e.target.checked)}
                  />
                  عريض
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[var(--input-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={state.italic}
                    onChange={(e) => patch('italic', e.target.checked)}
                  />
                  مائل
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[var(--input-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={state.underline}
                    onChange={(e) => patch('underline', e.target.checked)}
                  />
                  تحته خط
                </label>
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={openPreview}>
                <ExternalLink className="size-4" aria-hidden />
                معاينة في نافذة جديدة
              </Button>
              <Button type="button" variant="primary" onClick={() => void copyCode()}>
                <Copy className="size-4" aria-hidden />
                نسخ الكود
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)]" aria-live="polite">
          نصيحة: إن لم تُفتح المعاينة، تحقق من حظر النوافذ المنبثقة.
        </p>
      </div>

      <Modal
        open={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  )
}
