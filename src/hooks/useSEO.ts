import { useEffect } from 'react'

const BASE_URL = 'https://www.offer123.cc'

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(path: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = `${BASE_URL}${path}`
}

export function useSEO(opts: { title: string; description?: string; path: string }) {
  useEffect(() => {
    document.title = opts.title
    if (opts.description) {
      setMeta('description', opts.description)
    }
    setCanonical(opts.path)
  }, [opts.title, opts.description, opts.path])
}
