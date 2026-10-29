import { Store } from '../lib/types'
import { batchTotals, kasUsaha } from '../lib/calc'
import { formatRp } from '../lib/format'
import { PlusIcon, WalletIcon } from './icons'
import logo from '../assets/clovelle-logo.png'

type View = 'dashboard' | 'kas' | { batchId: string }

export function Sidebar({
  store,
  view,
  setView,
  onAddBatch,
}: {
  store: Store
  view: View
  setView: (v: View) => void
  onAddBatch: () => void
}) {
  const kas = kasUsaha(store)

  return (
    <aside className="w-full md:w-64 shrink-0 md:h-screen md:sticky md:top-0 bg-cream border-r border-mango/15 flex flex-col">
      <div className="px-5 pt-6 pb-3 flex items-center gap-2.5">
        <img src={logo} alt="Clovelle" className="h-12 w-auto -ml-1" />
        <p className="font-display text-sm text-ink/70">clovelle's book</p>
      </div>

      <div
        className="mx-5 h-2 rounded-full mb-4"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #F5C98A 0, #F5C98A 4px, transparent 4px, transparent 8px), repeating-linear-gradient(-45deg, #F5C98A 0, #F5C98A 4px, transparent 4px, transparent 8px)',
          backgroundColor: '#FBF6EC',
        }}
      />

      <button
        onClick={() => setView('kas')}
        className="mx-5 mb-4 rounded-xl2 p-4 text-left transition bg-gradient-to-br from-blush to-blush-soft hover:brightness-95"
      >
        <div className="flex items-center gap-1.5 text-ink/60 text-xs">
          <WalletIcon className="w-3.5 h-3.5" />
          <span>Kas usaha sekarang</span>
        </div>
        <p className="font-display text-2xl mt-1 tabular text-rust">{formatRp(kas)}</p>
        <p className="text-[11px] text-ink/45 mt-0.5">Modal siap buat batch berikutnya</p>
      </button>

      <button
        onClick={() => setView('dashboard')}
        className={`mx-5 mb-2 px-3 py-2 rounded-lg text-sm text-left transition ${
          view === 'dashboard' ? 'bg-mango/15 text-mango-dark font-medium' : 'hover:bg-ink/5 text-ink/70'
        }`}
      >
        Ringkasan
      </button>

      <div className="mx-5 mt-2 mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-ink/35">Batch</p>
        <button
          onClick={onAddBatch}
          className="w-5 h-5 rounded-full bg-mango hover:bg-mango-dark flex items-center justify-center text-white"
          title="Tambah batch baru"
        >
          <PlusIcon className="w-3 h-3" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-6 space-y-1">
        {store.batches.length === 0 && (
          <p className="text-xs text-ink/35 py-2">Belum ada batch. Tambah dulu, yuk.</p>
        )}
        {[...store.batches].reverse().map((b) => {
          const t = batchTotals(b)
          const active = typeof view === 'object' && view.batchId === b.id
          const status = t.totalPemasukan === 0 ? null : t.untung >= 0
          return (
            <button
              key={b.id}
              onClick={() => setView({ batchId: b.id })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition ${
                active ? 'bg-mango/15 text-mango-dark font-medium' : 'hover:bg-ink/5 text-ink/70'
              }`}
            >
              <span>{b.name}</span>
              {status !== null && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-clover' : 'bg-rust'}`}
                  title={status ? 'Untung' : 'Rugi'}
                />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export type { View }
