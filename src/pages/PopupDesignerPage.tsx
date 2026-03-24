import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Tooltip } from '../components/ui/Tooltip'
import { cn } from '../lib/cn'
import {
  buildPopupEmbedSnippet,
  buildPopupStandaloneHtml,
  type PopupFormState,
} from '../course/buildPopupHtml'
import { Copy, ExternalLink, MessageSquareMore } from 'lucide-react'

const initialState: PopupFormState = {
  summaryText: '',
  topicsText: '',
  homeworkText: '',
}

const inputClass =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-[var(--text-primary)] shadow-inner transition-all duration-300 ease-in-out placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35'
const labelRowClass =
  'mb-1 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--text-primary)]'

export function PopupDesignerPage() {
  const [state, setState] = useState<PopupFormState>(initialState)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const patch = useCallback(<K extends keyof PopupFormState>(key: K, value: PopupFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
  }, [])

  const openPreview = useCallback(() => {
    const html = buildPopupStandaloneHtml(state)
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
      await navigator.clipboard.writeText(buildPopupEmbedSnippet(state))
      setModalTitle('تم النسخ')
      setModalMessage('تم نسخ كود الشاشات المنبثقة إلى الحافظة.')
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
          <MessageSquareMore className="size-6 text-[var(--accent)]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            تحديث النصوص في الشاشات المنبثقة
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            الصفحة الثانية: تحويل `mlk.html` إلى جزء من التطبيق
          </p>
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">محتوى النوافذ</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            اكتب كل عنصر في سطر مستقل ليظهر مع أيقونة داخل النافذة
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className={labelRowClass}>
              <label htmlFor="summary-text">ملخص الأسبوع</label>
              <Tooltip label="مثال: أهم النقاط، النشاطات، الإنجازات" />
            </div>
            <textarea
              id="summary-text"
              rows={5}
              className={cn(inputClass, 'min-h-[130px] resize-y')}
              value={state.summaryText}
              onChange={(e) => patch('summaryText', e.target.value)}
            />
          </div>

          <div>
            <div className={labelRowClass}>
              <label htmlFor="topics-text">عناصر المواضيع</label>
              <Tooltip label="كل سطر يمثل عنصر موضوع مستقل" />
            </div>
            <textarea
              id="topics-text"
              rows={5}
              className={cn(inputClass, 'min-h-[130px] resize-y')}
              value={state.topicsText}
              onChange={(e) => patch('topicsText', e.target.value)}
            />
          </div>

          <div>
            <div className={labelRowClass}>
              <label htmlFor="homework-text">شرح الواجب</label>
              <Tooltip label="كل سطر سيظهر مع رمز ✍️ في المخرجات" />
            </div>
            <textarea
              id="homework-text"
              rows={5}
              className={cn(inputClass, 'min-h-[130px] resize-y')}
              value={state.homeworkText}
              onChange={(e) => patch('homeworkText', e.target.value)}
            />
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
