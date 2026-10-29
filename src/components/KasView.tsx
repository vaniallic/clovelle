import { useState } from 'react'
import { Store } from '../lib/types'
import { batchTotals, kasUsaha } from '../lib/calc'
import { formatRp, formatDate } from '../lib/format'
import { WalletIcon, PlusIcon, TrashIcon } from './icons'

type LedgerEntry = {
  date: string
  label: string
  amount: number
  kind: 'modal' | 'belanja' | 'penjualan' | 'tarik'
}

export function KasView({
  store,
  onSetStartingCapital,
  onAddWithdrawal,
  onDeleteWithdrawal,
}: {
  store: Store
  onSetStartingCapital: (n: number) => void
  onAddWithdrawal: (w: { date: string; amount: number; note: string }) => void
  onDeleteWithdrawal: (id: string) => void
}) {
  const kas = kasUsaha(store)
  const [capitalInput, setCapitalInput] = useState(String(store.startingCapital || ''))
  const [wAmount, setWAmount] = useState('')
  const [wNote, setWNote] = useState('')
  const [wDate, setWDate] = useState(new Date().toISOString().slice(0, 10))

  const entries: LedgerEntry[] = []
  if (store.startingCapital > 0) {
    entries.push({
      date: '0000-00-00',
      label: 'Modal awal usaha',
      amount: store.startingCapital,
      kind: 'modal',
    })
  }
  store.batches.forEach((b) => {
    const t = batchTotals(b)
    if (t.totalModal > 0) entries.push({ date: b.date, label: `Belanja — ${b.name}`, amount: -t.totalModal, kind: 'belanja' })
    if (t.totalPemasukan > 0)
      entries.push({ date: b.date, label: `Penjualan — ${b.name}`, amount: t.totalPemasukan, kind: 'penjualan' })
  })
  store.withdrawals.forEach((w) => {
    entries.push({ date: w.date, label: w.note ? `Tarik profit — ${w.note}` : 'Tarik profit', amount: -w.amount, kind: 'tarik' })
  })
  entries.sort((a, b) => a.date.localeCompare(b.date))

  let running = 0
  const withBalance = entries.map((e) => {
    running += e.amount
    return { ...e, balance: running }
  })

  const kindColor: Record<LedgerEntry['kind'], string> = {
    modal: 'text-ink',
    belanja: 'text-mango-dark',
    penjualan: 'text-clover-dark',
    tarik: 'text-rust',
  }

  return (
    <div className="w-full pb-16">
      <div className="flex items-center gap-2 mb-1">
        <WalletIcon className="w-6 h-6 text-pool-dark" />
        <h1 className="font-display text-3xl">Kas usaha</h1>
      </div>
      <p className="text-ink/60 text-sm mb-6">
        Uang berputar: penjualan batch ini otomatis jadi modal buat batch berikutnya, kecuali kamu tarik
        sebagian sebagai profit pribadi.
      </p>

      <div className="bg-gradient-to-br from-blush to-blush-soft rounded-xl2 px-5 py-5 mb-6">
        <p className="text-xs text-ink/50">Kas usaha sekarang</p>
        <p className="font-display text-4xl mt-1 tabular text-rust">{formatRp(kas)}</p>
        <p className="text-xs text-ink/45 mt-1">Modal yang siap dipakai buat batch selanjutnya</p>
      </div>

      <section className="bg-paper rounded-xl2 border border-ink/10 px-5 py-4 mb-5">
        <h2 className="font-display text-base mb-1">Modal awal usaha</h2>
        <p className="text-xs text-ink/50 mb-3">
          Uang pertama yang kamu suntik ke usaha ini, di luar hasil jualan.
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            value={capitalInput}
            onChange={(e) => setCapitalInput(e.target.value)}
            placeholder="0"
            className="flex-1 text-sm bg-cream/70 rounded-lg px-3 py-2 tabular focus:outline-none focus:ring-1 focus:ring-pool"
          />
          <button
            onClick={() => onSetStartingCapital(Number(capitalInput) || 0)}
            className="text-sm px-4 py-2 rounded-lg bg-pool text-white hover:bg-pool-dark"
          >
            Simpan
          </button>
        </div>
      </section>

      <section className="bg-paper rounded-xl2 border border-ink/10 px-5 py-4 mb-5">
        <h2 className="font-display text-base mb-1">Tarik profit pribadi</h2>
        <p className="text-xs text-ink/50 mb-3">
          Ambil sebagian untung buat dipakai sendiri. Sisanya tetap jadi modal batch berikutnya.
        </p>
        <div className="grid grid-cols-[120px_1fr_100px_auto] gap-2">
          <input
            type="date"
            value={wDate}
            onChange={(e) => setWDate(e.target.value)}
            className="text-sm bg-cream/70 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-pool"
          />
          <input
            value={wNote}
            onChange={(e) => setWNote(e.target.value)}
            placeholder="Catatan (opsional)"
            className="text-sm bg-cream/70 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-pool"
          />
          <input
            type="number"
            value={wAmount}
            onChange={(e) => setWAmount(e.target.value)}
            placeholder="Jumlah"
            className="text-sm bg-cream/70 rounded-lg px-2.5 py-2 text-right tabular focus:outline-none focus:ring-1 focus:ring-pool"
          />
          <button
            onClick={() => {
              const amt = Number(wAmount)
              if (amt > 0) {
                onAddWithdrawal({ date: wDate, amount: amt, note: wNote })
                setWAmount('')
                setWNote('')
              }
            }}
            className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-rust/10 text-rust hover:bg-rust/20"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Tarik
          </button>
        </div>

        {store.withdrawals.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {[...store.withdrawals].reverse().map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm px-1">
                <span className="text-ink/60">
                  {formatDate(w.date)} {w.note && `— ${w.note}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="tabular text-rust">-{formatRp(w.amount)}</span>
                  <button
                    onClick={() => onDeleteWithdrawal(w.id)}
                    className="text-ink/30 hover:text-rust"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-paper rounded-xl2 border border-ink/10 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ink/10">
          <h2 className="font-display text-base">Riwayat perputaran kas</h2>
        </div>
        {withBalance.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink/40">Belum ada pergerakan kas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink/50 text-xs border-b border-ink/10">
                <th className="text-left font-normal px-5 py-2">Tanggal</th>
                <th className="text-left font-normal px-3 py-2">Keterangan</th>
                <th className="text-right font-normal px-3 py-2">Mutasi</th>
                <th className="text-right font-normal px-5 py-2">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {withBalance.map((e, i) => (
                <tr key={i} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-2.5 text-ink/60">{e.kind === 'modal' ? '—' : formatDate(e.date)}</td>
                  <td className="px-3 py-2.5">{e.label}</td>
                  <td className={`px-3 py-2.5 text-right tabular ${kindColor[e.kind]}`}>
                    {e.amount >= 0 ? '+' : ''}
                    {formatRp(e.amount)}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular font-medium">{formatRp(e.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
