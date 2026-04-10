import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Navbar } from './components/Layout/Navbar'
import { BottomNav } from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { ApplicationsProvider } from './hooks/useApplications'
import { supabaseConfigError } from './lib/supabase'
import { ProtectedRoute } from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Jobs = lazy(() => import('./pages/Jobs'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'))
const Board = lazy(() => import('./pages/Board'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Exam = lazy(() => import('./pages/Exam'))
const Profile = lazy(() => import('./pages/Profile'))
const BoardPreview = lazy(() => import('./components/BoardPreview'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-page">
      <div className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-none">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        页面加载中
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-page px-4">
      <div className="border border-gray-200 bg-white px-6 py-8 text-center shadow-none">
        <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">NOT FOUND</p>
        <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">404</p>
        <p className="mt-3 text-sm text-gray-600">页面不存在</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center bg-black px-6 py-3 text-sm font-bold tracking-[0.18em] text-white transition-colors hover:bg-gray-800"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

function ApplicationsBoundary() {
  return (
    <ApplicationsProvider>
      <Outlet />
    </ApplicationsProvider>
  )
}

export default function App() {
  if (supabaseConfigError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-4">
        <div className="max-w-md border border-gray-200 bg-white p-6 text-center shadow-none">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">CONFIG</p>
          <p className="mt-3 text-base font-medium text-gray-900">配置错误</p>
          <p className="text-sm text-ink-muted">
            请检查环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确设置
          </p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-page pb-20 md:pb-0">
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/profile" element={<Profile />} />
                <Route element={<ApplicationsBoundary />}>
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:jobId" element={<JobDetail />} />
                  <Route
                    path="/applications/:applicationId"
                    element={
                      <ProtectedRoute>
                        <ApplicationDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/board"
                    element={
                      <ProtectedRoute fallback={<BoardPreview />}>
                        <Board />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <BottomNav />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
