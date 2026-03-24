import { useCallback, useEffect, useState } from 'react'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader } from './components/ui/Card'
import { Moon, PanelsTopLeft, Sun } from 'lucide-react'
import { CourseDesignerPage } from './pages/CourseDesignerPage'
import { PopupDesignerPage } from './pages/PopupDesignerPage'
import { ExerciseDesignerPage } from './pages/ExerciseDesignerPage'
import { CirclePopupDesignerPage } from './pages/CirclePopupDesignerPage'
import { InteractiveQuizDesignerPage } from './pages/InteractiveQuizDesignerPage'

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
  const [activePage, setActivePage] = useState<
    'course' | 'popups' | 'exercises' | 'circles' | 'quiz'
  >('course')
  const { dark, toggle } = useThemeToggle()

  return (
    <div className="min-h-svh px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] backdrop-blur-xl">
            <PanelsTopLeft className="size-4" aria-hidden />
            تطبيق متعدد الصفحات
          </span>
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">التنقل بين الصفحات</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">المقرر، النوافذ المنبثقة، ومنشئ التمارين</p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-end gap-3">
            <Button
              variant={activePage === 'course' ? 'primary' : 'secondary'}
              onClick={() => setActivePage('course')}
              aria-label="الذهاب إلى صفحة تصميم المقرر"
            >
              صفحة المقرر
            </Button>
            <Button
              variant={activePage === 'popups' ? 'primary' : 'secondary'}
              onClick={() => setActivePage('popups')}
              aria-label="الذهاب إلى صفحة الشاشات المنبثقة"
            >
              صفحة الشاشات المنبثقة
            </Button>
            <Button
              variant={activePage === 'exercises' ? 'primary' : 'secondary'}
              onClick={() => setActivePage('exercises')}
              aria-label="الذهاب إلى صفحة منشئ التمارين"
            >
              صفحة التمارين
            </Button>
            <Button
              variant={activePage === 'circles' ? 'primary' : 'secondary'}
              onClick={() => setActivePage('circles')}
              aria-label="الذهاب إلى صفحة مخطط الدوائر"
            >
              مخطط الدوائر
            </Button>
            <Button
              variant={activePage === 'quiz' ? 'primary' : 'secondary'}
              onClick={() => setActivePage('quiz')}
              aria-label="الذهاب إلى صفحة الاختبارات التفاعلية"
            >
              الاختبارات التفاعلية
            </Button>
          </CardContent>
        </Card>

        {activePage === 'course' ? <CourseDesignerPage /> : null}
        {activePage === 'popups' ? <PopupDesignerPage /> : null}
        {activePage === 'exercises' ? <ExerciseDesignerPage /> : null}
        {activePage === 'circles' ? <CirclePopupDesignerPage /> : null}
        {activePage === 'quiz' ? <InteractiveQuizDesignerPage /> : null}
      </div>
    </div>
  )
}
