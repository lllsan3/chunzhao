import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Navbar } from './components/Layout/Navbar'
import { ToastProvider } from './components/Toast'

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
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-200 mb-2">404</p>
        <p className="text-slate-500 mb-6">页面不存在</p>
        <Link to="/" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-[#F7F8FA]">
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
              <Route path="/board" element={<Board />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
