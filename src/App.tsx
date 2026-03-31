import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
            </Routes>
          </Suspense>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
