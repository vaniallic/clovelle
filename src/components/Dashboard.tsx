import { Store } from '../lib/types'
import { batchTotals, ringkasan } from '../lib/calc'
import { formatRp, formatPct, formatDate } from '../lib/format'
import { MangoIcon, ButterflyIcon } from './icons'

export function Dashboard({
  store,
  onOpenBatch,
  onAddBatch,
}: {
  store: Store
  onOpenBatch: (id: string) => void
  onAddBatch: () => void
}) {
  const r = ringkasan(store)
  const hasBatches = store.batches.length > 0

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Ringkasan usaha</h1>
          <p className="text-ink/60 mt-1 text-sm">
            Pantau modal, penjualan, dan untung-rugi tiap batch Clovelle di satu tempat.
          </p>
        </div>
        <ButterflyIcon className="w-12 h-12 text-pool hidden sm:block" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total modal keluar" value={formatRp(r.totalModal)} tone="mango" />
        <StatCard label="Total penjualan masuk" value={formatRp(r.totalPemasukan)} tone="pool" />
        <StatCard
          label="Total untung / rugi"
          value={formatRp(r.totalUntung)}
          tone={r.totalUntung >= 0 ? 'clover' : 'rust'}
        />
        <StatCard label="Sudah ditarik" value={formatRp(r.totalDitarik)} tone="ink" />
      </div>

      <div className="bg-paper rounded-xl2 border border-ink/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/10 flex items-center justify-between">
          <h2 className="font-display text-lg">Semua batch</h2>
          <button
            onClick={onAddBatch}
            className="text-sm px-3 py-1.5 rounded-lg bg-mango text-white hover:bg-mango-dark"
          >
            + Batch baru
          </button>
        </div>

        {!hasBatches ? (
          <div className="px-5 py-10 text-center">
            <MangoIcon className="w-10 h-10 text-mango mx-auto mb-3" />
            <p className="text-ink/60 text-sm">
              Belum ada batch. Mulai dengan mencatat belanja batch pertama kamu.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink/50 text-xs border-b border-ink/10">
                <th className="text-left font-normal px-5 py-2.5">Batch</th>
                <th className="text-left font-normal px-3 py-2.5">Tanggal</th>
                <th className="text-right font-normal px-3 py-2.5">Modal</th>
                <th className="text-right font-normal px-3 py-2.5">Penjualan</th>
                <th className="text-right font-normal px-3 py-2.5">Untung/Rugi</th>
                <th className="text-right font-normal px-5 py-2.5">Margin</th>
              </tr>
            </thead>
            <tbody>
              {store.batches.map((b) => {
                const t = batchTotals(b)
                const belumJual = t.totalPemasukan === 0
                return (
                  <tr
                    key={b.id}
                    onClick={() => onOpenBatch(b.id)}
                    className="border-b border-ink/5 last:border-0 hover:bg-cream cursor-pointer"
                  >
                    <td className="px-5 py-3 font-medium">{b.name}</td>
                    <td className="px-3 py-3 text-ink/60">{formatDate(b.date)}</td>
                    <td className="px-3 py-3 text-right tabular">{formatRp(t.totalModal)}</td>
                    <td className="px-3 py-3 text-right tabular">{formatRp(t.totalPemasukan)}</td>
                    <td
                      className={`px-3 py-3 text-right tabular font-medium ${
                        belumJual ? 'text-ink/40' : t.untung >= 0 ? 'text-clover-dark' : 'text-rust'
                      }`}
                    >
                      {belumJual ? 'Belum terjual' : formatRp(t.untung)}
                    </td>
                    <td className="px-5 py-3 text-right tabular text-ink/70">
                      {belumJual ? '—' : formatPct(t.marginPct)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-ink/40 mt-4 max-w-lg">
        Kas usaha = modal awal + semua penjualan − semua belanja − profit yang sudah ditarik.
        Itu yang jadi modal otomatis buat batch selanjutnya.
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'mango' | 'pool' | 'clover' | 'rust' | 'ink'
}) {
  const toneMap: Record<string, string> = {
    mango: 'text-mango-dark',
    pool: 'text-pool-dark',
    clover: 'text-clover-dark',
    rust: 'text-rust',
    ink: 'text-ink',
  }
  return (
    <div className="bg-paper rounded-xl2 border border-ink/10 px-4 py-3.5">
      <p className="text-[11px] text-ink/50 leading-tight">{label}</p>
      <p className={`font-display text-xl mt-1 tabular ${toneMap[tone]}`}>{value}</p>
    </div>
  )
}
