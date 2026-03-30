import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastMessage {
  id: number
  type: 'success' | 'error'
  text: string
}

interface ToastContextType {
  toast: (type: 'success' | 'error', text: string) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((type: 'success' | 'error', text: string) => {
    const id = nextId++
    setMessages((prev) => [...prev, { id, type, text }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {messages.map((msg) => (
          <ToastItem key={msg.id} message={msg} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(message.id), 3000)
    return () => clearTimeout(timer)
  }, [message.id, onDismiss])

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm ${
        message.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {message.type === 'success' ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{message.text}</span>
      <button onClick={() => onDismiss(message.id)} className="ml-2 shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
