import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

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
    setMessages((prev) => prev.filter((message) => message.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col items-end gap-2 md:bottom-6 md:left-auto md:right-6">
        {messages.map((message) => (
          <ToastItem key={message.id} message={message} onDismiss={dismiss} />
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
    const timer = setTimeout(() => onDismiss(message.id), 5000)
    return () => clearTimeout(timer)
  }, [message.id, onDismiss])

  const accentClass = message.type === 'success' ? 'text-gray-700' : 'text-red-600'

  return (
    <div className="flex items-start gap-3 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-none md:max-w-sm">
      <div className={`pt-0.5 ${accentClass}`}>
        {message.type === 'success' ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <CircleAlert className="h-4 w-4 shrink-0" />
        )}
      </div>

      <span className="flex-1 leading-6">{message.text}</span>

      <button onClick={() => onDismiss(message.id)} className="shrink-0 text-gray-400 transition-colors hover:text-black">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
