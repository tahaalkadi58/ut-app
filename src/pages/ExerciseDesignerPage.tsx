import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Tooltip } from '../components/ui/Tooltip'
import { cn } from '../lib/cn'
import {
  buildExerciseEmbedSnippet,
  buildExerciseStandaloneHtml,
  buildShuffledRights,
  type ExercisePair,
} from '../course/buildExerciseHtml'
import { BookOpenCheck, Copy, ExternalLink, Plus } from 'lucide-react'

type PairState = ExercisePair & { id: string }

const inputClass =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-[var(--text-primary)] shadow-inner transition-all duration-300 ease-in-out placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35'
const labelRowClass =
  'mb-1 flex items-center justify-end gap-2 text-sm font-semibold text-[var(--text-primary)]'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function ExerciseDesignerPage() {
  const [question, setQuestion] = useState('')
  const [pairs, setPairs] = useState<PairState[]>([{ id: uid(), left: '', right: '' }])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const validPairs = useMemo(
    () => pairs.filter((p) => p.left.trim() && p.right.trim()),
    [pairs],
  )
  const rightChoices = useMemo(() => buildShuffledRights(validPairs), [validPairs])

  const addPair = () =>
    setPairs((prev) => [...prev, { id: uid(), left: '', right: '' }])

  const updatePair = (id: string, key: 'left' | 'right', value: string) => {
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)))
  }

  const checkAnswers = () => {
    if (!validPairs.length) return
    const correct = validPairs.reduce((acc, p) => acc + (answers[p.id] === p.right ? 1 : 0), 0)
    setResults({ correct, total: validPairs.length })
  }

  const resetAnswers = () => {
    setAnswers({})
    setResults(null)
  }

  const openPreview = () => {
    if (!validPairs.length) {
      setModalTitle('بيانات ناقصة')
      setModalMessage('أدخل زوجاً واحداً على الأقل قبل المعاينة.')
      setModalOpen(true)
      return
    }
    const html = buildExerciseStandaloneHtml(question, validPairs)
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
  }

  const copyCode = async () => {
    if (!validPairs.length) {
      setModalTitle('بيانات ناقصة')
      setModalMessage('أدخل زوجاً واحداً على الأقل قبل النسخ.')
      setModalOpen(true)
      return
    }
    try {
      await navigator.clipboard.writeText(buildExerciseEmbedSnippet(question, validPairs))
      setModalTitle('تم النسخ')
      setModalMessage('تم نسخ كود التمرين إلى الحافظة.')
      setModalOpen(true)
    } catch {
      setModalTitle('خطأ في النسخ')
      setModalMessage('تعذر الوصول إلى الحافظة. حاول مرة أخرى.')
      setModalOpen(true)
    }
  }

  return (
    <>
      <header className="flex items-center gap-3 text-right">
        <span className="flex size-12 items-center justify-center rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl">
          <BookOpenCheck className="size-6 text-[var(--accent)]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            النظام الذكي للتمارين
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            الصفحة الثالثة: تحويل `fnt.html` إلى جزء من التطبيق
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">منشئ التمرين</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">أدخل السؤال والأزواج ثم أنشئ المعاينة</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className={labelRowClass}>
                <label htmlFor="exercise-question">السؤال</label>
                <Tooltip label="يظهر كعنوان أعلى التمرين للطالب" />
              </div>
              <input
                id="exercise-question"
                className={inputClass}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب السؤال هنا"
              />
            </div>

            {pairs.map((pair, index) => (
              <div key={pair.id} className="rounded-2xl border border-[var(--glass-border)] bg-white/10 p-3">
                <p className="mb-2 text-xs text-[var(--text-muted)]">زوج #{index + 1}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="العنصر الأيسر"
                    value={pair.left}
                    onChange={(e) => updatePair(pair.id, 'left', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="العنصر الأيمن"
                    value={pair.right}
                    onChange={(e) => updatePair(pair.id, 'right', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="secondary" onClick={addPair} aria-label="إضافة زوج جديد">
                <Plus className="size-4" aria-hidden />
                إضافة زوج
              </Button>
              <Button variant="secondary" onClick={openPreview}>
                <ExternalLink className="size-4" aria-hidden />
                معاينة
              </Button>
              <Button onClick={() => void copyCode()}>
                <Copy className="size-4" aria-hidden />
                نسخ الكود
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">المعاينة الحية</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">تحقق من مطابقة العناصر وتصحيحها</p>
          </CardHeader>
          <CardContent>
            {validPairs.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">أدخل أزواجاً لعرض المعاينة.</p>
            ) : (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {question || 'تمرين تفاعلي'}
                </h3>
                {validPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className={cn(
                      'grid grid-cols-1 gap-2 rounded-2xl border border-[var(--glass-border)] p-3 sm:grid-cols-2',
                      results
                        ? answers[pair.id] === pair.right
                          ? 'bg-emerald-100/60 dark:bg-emerald-500/20'
                          : 'bg-rose-100/60 dark:bg-rose-500/20'
                        : 'bg-white/10',
                    )}
                  >
                    <div className="rounded-xl bg-white/60 px-3 py-2 text-[var(--text-primary)] dark:bg-white/5">
                      {pair.left}
                    </div>
                    <select
                      className={inputClass}
                      value={answers[pair.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [pair.id]: e.target.value }))
                      }
                    >
                      <option value="">اختر الإجابة</option>
                      {rightChoices.map((choice, idx) => (
                        <option key={`${pair.id}-${idx}`} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <Button variant="secondary" onClick={resetAnswers}>
                    إعادة المحاولة
                  </Button>
                  <Button onClick={checkAnswers}>تصحيح الإجابات</Button>
                </div>

                {results ? (
                  <div className="rounded-2xl border border-[var(--glass-border)] bg-white/20 p-4 text-sm text-[var(--text-primary)] dark:bg-white/5">
                    <p>✅ الصحيحة: {results.correct}</p>
                    <p>❌ الخاطئة: {results.total - results.correct}</p>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        <p>{modalMessage}</p>
      </Modal>
    </>
  )
}
