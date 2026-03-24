import { useCallback, useState } from 'react'
import {
  buildEmbedSnippet,
  buildStandalonePreviewHtml,
  type CourseFormState,
} from '../course/buildCourseHtml'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Tooltip } from '../components/ui/Tooltip'
import { cn } from '../lib/cn'
import { Copy, ExternalLink, Sparkles } from 'lucide-react'

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
const labelRowClass =
  'mb-1 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--text-primary)]'

export function CourseDesignerPage() {
  const [state, setState] = useState<CourseFormState>(initialState)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

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
    try {
      await navigator.clipboard.writeText(buildEmbedSnippet(state))
      setModalTitle('تم النسخ')
      setModalMessage('تم نسخ كود صفحة المقرر إلى الحافظة.')
      setModalOpen(true)
    } catch {
      setModalTitle('خطأ في النسخ')
      setModalMessage('تعذر الوصول إلى الحافظة. حاول مرة أخرى.')
      setModalOpen(true)
    }
  }, [state])

  return (
    <>
      <header className="flex items-center gap-3 text-right">
        <span className="flex size-12 items-center justify-center rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl">
          <Sparkles className="size-6 text-[var(--accent)]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            تصميم مقرر دراسي
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            الصفحة الأولى: إنشاء كود المقرر مع المعاينة
          </p>
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">البيانات والتنسيق</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">املأ الحقول ثم استخدم المعاينة أو نسخ الكود</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className={labelRowClass}>
              <label htmlFor="textDirection">اتجاه النص</label>
              <Tooltip label="يحدد اتجاه الصفحة المُنشأة والعناوين" />
            </div>
            <select
              id="textDirection"
              className={inputClass}
              value={state.textDirection}
              onChange={(e) => patch('textDirection', e.target.value as 'rtl' | 'ltr')}
            >
              <option value="rtl">عربي (يمين لليسار)</option>
              <option value="ltr">إنجليزي (يسار لليمين)</option>
            </select>
          </div>

          <div>
            <div className={labelRowClass}>
              <label htmlFor="description">وصف المادة</label>
              <Tooltip label="يظهر تدريجيا عند فتح القسم في المخرجات" />
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
            {[
              ['textColor', 'لون الخط'],
              ['bgColor', 'لون الخلفية'],
              ['headerBorderColor', 'لون إطار العناوين'],
              ['subBgColor', 'لون خلفية الجمل الفرعية'],
            ].map(([id, label]) => (
              <div key={id}>
                <label className={labelRowClass} htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  type="color"
                  className={cn(inputClass, 'h-12 cursor-pointer py-1')}
                  value={state[id as keyof CourseFormState] as string}
                  onChange={(e) =>
                    patch(id as keyof CourseFormState, e.target.value as never)
                  }
                />
              </div>
            ))}
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

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={openPreview}>
              <ExternalLink className="size-4" aria-hidden />
              معاينة
            </Button>
            <Button type="button" onClick={() => void copyCode()}>
              <Copy className="size-4" aria-hidden />
              نسخ الكود
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        <p>{modalMessage}</p>
      </Modal>
    </>
  )
}
