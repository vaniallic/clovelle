export function formatRp(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.round(Math.abs(n))
  return `${sign}Rp${abs.toLocaleString('id-ID')}`
}

export function formatPct(n: number): string {
  if (!isFinite(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export function formatDate(d: string): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
