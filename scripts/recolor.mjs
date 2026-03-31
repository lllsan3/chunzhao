/**
 * Bulk color replacement script.
 * Only touches Tailwind color classes — no layout, spacing, or structure changes.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const replacements = [
  // Page background
  ['bg-[#F7F8FA]', 'bg-page'],

  // Primary buttons: slate-900 → brand (but NOT bg-slate-900 inside Pricing dark card)
  // We'll handle Pricing separately
  ['bg-slate-900 text-white', 'bg-brand text-white'],
  ['hover:bg-slate-800', 'hover:bg-brand-hover'],

  // Accent blue
  ['bg-blue-600 text-white', 'bg-accent text-white'],
  ['hover:bg-blue-700', 'hover:bg-accent-hover'],
  ['bg-blue-600', 'bg-accent'],

  // Text colors
  ['text-blue-600', 'text-accent'],
  ['text-blue-700', 'text-accent-hover'],
  ['hover:text-blue-600', 'hover:text-accent'],
  ['hover:text-blue-700', 'hover:text-accent-hover'],

  // Blue soft backgrounds
  ['bg-blue-50', 'bg-accent-soft'],
  ['border-blue-200', 'border-accent/30'],

  // Focus states
  ['focus:ring-blue-500/20', 'focus:ring-accent/20'],
  ['focus:border-blue-500', 'focus:border-accent'],
  ['hover:border-blue-300', 'hover:border-accent/40'],
  ['hover:border-blue-400', 'hover:border-accent/50'],
  ['ring-blue-200', 'ring-accent/30'],

  // Borders
  ['border-slate-200', 'border-line'],
  ['border-slate-100', 'border-line-light'],
  ['border-slate-100/80', 'border-line-light'],

  // Primary text
  ['text-slate-800', 'text-ink'],
  ['text-slate-900', 'text-ink'],
  ['text-slate-700', 'text-ink'],

  // Muted text
  ['text-slate-500', 'text-ink-muted'],
  ['text-slate-600', 'text-ink-muted'],
  ['text-slate-400', 'text-ink-muted/70'],

  // Backgrounds
  ['bg-slate-50', 'bg-tag-bg'],
  ['bg-slate-100', 'bg-tag-bg'],

  // Blue text shades for accent
  ['text-blue-400', 'text-accent/70'],
]

function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkDir(full))
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      files.push(full)
    }
  }
  return files
}

const srcDir = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const files = walkDir(srcDir)
let totalChanges = 0

for (const file of files) {
  let content = readFileSync(file, 'utf-8')
  const original = content

  for (const [from, to] of replacements) {
    content = content.replaceAll(from, to)
  }

  if (content !== original) {
    writeFileSync(file, content, 'utf-8')
    const changes = replacements.reduce((sum, [from]) => {
      return sum + (original.split(from).length - content.split(from).length)
    }, 0)
    console.log(`${file.split('src')[1]}: modified`)
    totalChanges++
  }
}

console.log(`\nTotal files modified: ${totalChanges}`)
