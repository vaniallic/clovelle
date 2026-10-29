import { useState, FormEvent, ReactNode } from 'react'
import logo from '../assets/clovelle-logo.png'

const STORAGE_KEY = 'clovelle-gate-ok'

export function Gate({ children }: { children: ReactNode }) {
  const required = import.meta.env.VITE_APP_PASSWORD as string | undefined
  const [ok, setOk] = useState(() => !required || localStorage.getItem(STORAGE_KEY) === 'yes')
  const [input, setInput] = useState('')
  const [err, setErr] = useState(false)

  if (ok) return <>{children}</>

  function submit(e: FormEvent) {
    e.preventDefault()
    if (input === required) {
      localStorage.setItem(STORAGE_KEY, 'yes')
      setOk(true)
    } else {
      setErr(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form onSubmit={submit} className="bg-paper border border-mango/20 rounded-xl2 overflow-hidden w-full max-w-sm">
        <div
          className="h-2.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #F5C98A 0, #F5C98A 5px, transparent 5px, transparent 10px), repeating-linear-gradient(-45deg, #F5C98A 0, #F5C98A 5px, transparent 5px, transparent 10px)',
            backgroundColor: '#FBF6EC',
          }}
        />
        <div className="p-7 text-center">
          <img src={logo} alt="Clovelle" className="h-14 w-auto mx-auto mb-4" />
          <p className="text-sm text-ink/50 mb-5">Masukin kata sandi yang dipakai bareng tim.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setErr(false)
            }}
            className="w-full text-sm bg-cream/70 rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-1 focus:ring-pool"
            placeholder="Kata sandi"
            autoFocus
          />
          {err && <p className="text-xs text-rust mt-2">Salah, coba lagi.</p>}
          <button
            type="submit"
            className="w-full mt-4 text-sm px-4 py-2.5 rounded-lg bg-mango text-white hover:bg-mango-dark"
          >
            Masuk
          </button>
        </div>
      </form>
    </div>
  )
}
