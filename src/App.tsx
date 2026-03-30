import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Layout/Navbar'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import ApplicationDetail from './pages/ApplicationDetail'
import Board from './pages/Board'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-[#F7F8FA]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
            <Route path="/board" element={<Board />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
