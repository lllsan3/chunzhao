import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Navbar } from './components/Layout/Navbar'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './contexts/AuthContext'
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

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-line mb-2">404</p>
        <p className="text-ink-muted mb-6">页面不存在</p>
        <Link to="/" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover">
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  if (supabaseConfigError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">配置错误</p>
          <p className="text-sm text-ink-muted">请检查环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 是否正确设置</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-page">
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/applications/:applicationId" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
              <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
