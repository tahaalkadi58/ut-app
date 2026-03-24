import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Tooltip } from '../components/ui/Tooltip'
import { cn } from '../lib/cn'
import {
  buildStudentQuizHtml,
  type QuizAnswer,
  type QuizQuestion,
  type QuizTest,
} from '../course/buildInteractiveQuizHtml'
import { Copy, Eye, Save, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'savedTests_v2'
const inputClass =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-[var(--text-primary)] shadow-inner transition-all duration-300 ease-in-out placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35'

type QuestionState = QuizQuestion

function newQuestion(): QuestionState {
  return {
    text: '',
    scoringType: 'full',
    answers: [
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function InteractiveQuizDesignerPage() {
  const [testName, setTestName] = useState('اختبار جديد')
  const [totalMarks, setTotalMarks] = useState(100)
  const [timeLimit, setTimeLimit] = useState(10)
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [questions, setQuestions] = useState<QuestionState[]>([newQuestion()])
  const [selectedSavedId, setSelectedSavedId] = useState('')

  const [previewScore, setPreviewScore] = useState<number | null>(null)
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, boolean>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const savedTests = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, QuizTest>
    } catch {
      return {}
    }
  }, [modalOpen, selectedSavedId])

  const cleanQuestions = useMemo(() => {
    return questions
      .map((q) => ({
        ...q,
        text: q.text.trim(),
        answers: q.answers
          .map((a) => ({ ...a, text: a.text.trim() }))
          .filter((a) => a.text),
      }))
      .filter((q) => q.text && q.answers.length > 1 && q.answers.some((a) => a.correct))
  }, [questions])

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()])
  const removeQuestion = (qi: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qi))

  const updateQuestion = (qi: number, patch: Partial<QuestionState>) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))

  const addAnswer = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, answers: [...q.answers, { text: '', correct: false }] } : q,
      ),
    )

  const updateAnswer = (qi: number, ai: number, patch: Partial<QuizAnswer>) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              answers: q.answers.map((a, j) => (j === ai ? { ...a, ...patch } : a)),
            }
          : q,
      ),
    )

  const removeAnswer = (qi: number, ai: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q,
      ),
    )

  const makeTestPayload = (): QuizTest | null => {
    if (!cleanQuestions.length) return null
    return {
      id: uid(),
      name: testName || 'اختبار بدون عنوان',
      totalMarks: Math.max(1, totalMarks || 100),
      timeLimit: Math.max(1, timeLimit || 10),
      maxAttempts: Math.max(0, maxAttempts || 0),
      questions: cleanQuestions,
    }
  }

  const saveTest = () => {
    const payload = makeTestPayload()
    if (!payload) {
      setModalTitle('بيانات ناقصة')
      setModalMessage('أضف أسئلة مع إجابات صحيحة قبل الحفظ.')
      setModalOpen(true)
      return
    }
    const tests = { ...savedTests, [payload.id]: payload }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
    setSelectedSavedId(payload.id)
    setModalTitle('تم الحفظ')
    setModalMessage('تم حفظ الاختبار محلياً بنجاح.')
    setModalOpen(true)
  }

  const loadSelected = () => {
    const t = savedTests[selectedSavedId]
    if (!t) return
    setTestName(t.name)
    setTotalMarks(t.totalMarks)
    setTimeLimit(t.timeLimit)
    setMaxAttempts(t.maxAttempts)
    setQuestions(t.questions)
    setPreviewAnswers({})
    setPreviewScore(null)
  }

  const deleteSelected = () => {
    if (!selectedSavedId) return
    const tests = { ...savedTests }
    delete tests[selectedSavedId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
    setSelectedSavedId('')
  }

  const exportStudentHtml = async () => {
    const payload = makeTestPayload()
    if (!payload) {
      setModalTitle('بيانات ناقصة')
      setModalMessage('أضف أسئلة مع إجابات صحيحة قبل التصدير.')
      setModalOpen(true)
      return
    }
    const html = buildStudentQuizHtml(payload)
    try {
      await navigator.clipboard.writeText(html)
      setModalTitle('تم النسخ')
      setModalMessage('تم نسخ صفحة الطالب HTML إلى الحافظة.')
      setModalOpen(true)
    } catch {
      const blob = new Blob([html], { type: 'text/html' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'quiz-student.html'
      a.click()
      URL.revokeObjectURL(a.href)
    }
  }

  const openStudentPreview = () => {
    const payload = makeTestPayload()
    if (!payload) return
    const html = buildStudentQuizHtml(payload)
    const w = window.open()
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const togglePreviewAnswer = (qi: number, ai: number) => {
    const key = `${qi}:${ai}`
    setPreviewAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const checkPreview = () => {
    const valid = cleanQuestions
    if (!valid.length) return
    let sum = 0
    valid.forEach((q, qi) => {
      const selected = q.answers
        .map((_, ai) => ({ ai, checked: !!previewAnswers[`${qi}:${ai}`] }))
        .filter((x) => x.checked)
        .map((x) => x.ai)
      const correctIdx = q.answers.map((a, i) => (a.correct ? i : -1)).filter((i) => i >= 0)
      if (!correctIdx.length) return
      if (q.scoringType === 'full') {
        const ok =
          selected.length === correctIdx.length && correctIdx.every((idx) => selected.includes(idx))
        sum += ok ? 1 : 0
      } else {
        let gain = 0
        selected.forEach((idx) => {
          if (correctIdx.includes(idx)) gain += 1 / correctIdx.length
          else gain -= 1 / q.answers.length
        })
        if (gain < 0) gain = 0
        if (gain > 1) gain = 1
        sum += gain
      }
    })
    const grade = Math.round((sum / valid.length) * totalMarks)
    setPreviewScore(grade)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">النظام الذكي للاختبارات التفاعلية</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">الصفحة الخامسة: تحويل `finml.html` إلى جزء من التطبيق</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input className={inputClass} value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="اسم الاختبار" />
            <input className={inputClass} type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} placeholder="الدرجة الكلية" />
            <input className={inputClass} type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} placeholder="الوقت (دقيقة)" />
            <input className={inputClass} type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} placeholder="عدد المحاولات" />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={addQuestion}>سؤال جديد</Button>
            <Button variant="secondary" onClick={openStudentPreview}><Eye className="size-4" aria-hidden /> معاينة الطالب</Button>
            <Button variant="secondary" onClick={() => void exportStudentHtml()}><Copy className="size-4" aria-hidden /> نسخ/تصدير نسخة الطالب</Button>
            <Button onClick={saveTest}><Save className="size-4" aria-hidden /> حفظ</Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select className={inputClass} value={selectedSavedId} onChange={(e) => setSelectedSavedId(e.target.value)}>
              <option value="">اختبارات محفوظة</option>
              {Object.values(savedTests).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <Button variant="secondary" onClick={loadSelected}>تحميل المحدد</Button>
            <Button variant="ghost" onClick={deleteSelected}><Trash2 className="size-4" aria-hidden /> حذف المحدد</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <Card key={qi} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => removeQuestion(qi)} aria-label={`حذف السؤال ${qi + 1}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">السؤال {qi + 1}</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                className={inputClass}
                placeholder="نص السؤال"
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              />
              <div className="flex items-center justify-end gap-2">
                <Tooltip label="كامل: يجب تحديد كل الصحيح فقط، جزئي: يحتسب جزئيا" />
                <select
                  className={cn(inputClass, 'max-w-[220px]')}
                  value={q.scoringType}
                  onChange={(e) => updateQuestion(qi, { scoringType: e.target.value as 'full' | 'partial' })}
                >
                  <option value="full">تصحيح كامل</option>
                  <option value="partial">تصحيح جزئي</option>
                </select>
              </div>

              {q.answers.map((a, ai) => (
                <div key={ai} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-white/10 p-2">
                  <input
                    className={inputClass}
                    placeholder={`إجابة ${ai + 1}`}
                    value={a.text}
                    onChange={(e) => updateAnswer(qi, ai, { text: e.target.value })}
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={a.correct}
                      onChange={(e) => updateAnswer(qi, ai, { correct: e.target.checked })}
                    />
                    صحيحة
                  </label>
                  <Button variant="ghost" onClick={() => removeAnswer(qi, ai)} aria-label="حذف إجابة">حذف</Button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => addAnswer(qi)}>إضافة إجابة</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">المعاينة الحية والتصحيح</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {cleanQuestions.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-[var(--glass-border)] bg-white/10 p-3">
              <p className="font-semibold text-[var(--text-primary)]">{q.text}</p>
              <div className="mt-2 space-y-2">
                {q.answers.map((a, ai) => (
                  <label key={ai} className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-white/20 p-2 text-sm text-[var(--text-primary)]">
                    <input type="checkbox" checked={!!previewAnswers[`${qi}:${ai}`]} onChange={() => togglePreviewAnswer(qi, ai)} />
                    {a.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => { setPreviewAnswers({}); setPreviewScore(null) }}>إعادة المحاولة</Button>
            <Button onClick={checkPreview}>تصحيح الإجابات</Button>
          </div>
          {previewScore !== null ? (
            <div className="rounded-2xl border border-[var(--glass-border)] bg-white/15 p-3 text-[var(--text-primary)]">
              النتيجة: {previewScore} / {totalMarks}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        <p>{modalMessage}</p>
      </Modal>
    </>
  )
}

