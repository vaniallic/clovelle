import { useEffect, useRef } from 'react'
import { Batch } from '../lib/types'
import { batchTotals } from '../lib/calc'
import { formatRp, formatPct } from '../lib/format'
import { PlusIcon, TrashIcon, MangoIcon } from './icons'

function AutoGrowTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [props.value])
  return <textarea ref={ref} {...props} />
}

export function BatchView({
  batch,
  onUpdate,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
  onDelete,
}: {
  batch: Batch
  onUpdate: (patch: Partial<Batch>) => void
  onAddPurchase: () => void
  onUpdatePurchase: (purchaseId: string, patch: Partial<Batch['purchases'][number]>) => void
  onDeletePurchase: (purchaseId: string) => void
  onDelete: () => void
}) {
  const t = batchTotals(batch)
  const belumJual = t.totalPemasukan === 0 && batch.unitsSold === 0

  return (
    <div className="w-full pb-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <input
            value={batch.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="font-display text-3xl bg-transparent focus:outline-none focus:bg-white/60 rounded px-1 -ml-1 w-full"
          />
          <div className="flex items-center gap-2 mt-1.5">
            <label className="text-xs text-ink/50">Tanggal</label>
            <input
              type="date"
              value={batch.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              className="text-sm bg-transparent text-ink/70 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-rust/70 hover:text-rust px-2 py-1 rounded hover:bg-rust/10 shrink-0"
        >
          Hapus batch
        </button>
      </div>

      {/* Belanja */}
      <section className="bg-paper rounded-xl2 border border-ink/10 overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-ink/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base">Belanja bahan &amp; biaya lain</h2>
            <p className="text-xs text-ink/50">Semua yang kamu keluarkan buat produksi batch ini</p>
          </div>
          <button
            onClick={onAddPurchase}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-mango/15 text-mango-dark hover:bg-mango/25"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>

        {batch.purchases.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink/40">Belum ada belanja dicatat.</p>
        ) : (
          <div className="px-5 py-3 space-y-2">
            <div className="grid grid-cols-[1fr_70px_110px_110px_28px] gap-2 text-[11px] text-ink/40 px-1">
              <span>Nama</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Harga satuan</span>
              <span className="text-right">Subtotal</span>
              <span />
            </div>
            {batch.purchases.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_70px_110px_110px_28px] gap-2 items-center">
                <input
                  value={p.name}
                  onChange={(e) => onUpdatePurchase(p.id, { name: e.target.value })}
                  placeholder="mis. Mangga"
                  className="text-sm bg-cream/70 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-mango"
                />
                <input
                  type="number"
                  value={p.qty === 0 ? '' : p.qty}
                  onChange={(e) =>
                    onUpdatePurchase(p.id, { qty: e.target.value === '' ? 0 : Number(e.target.value) })
                  }
                  placeholder="0"
                  className="text-sm bg-cream/70 rounded-lg px-2 py-1.5 text-right tabular focus:outline-none focus:ring-1 focus:ring-mango"
                />
                <input
                  type="number"
                  value={p.price === 0 ? '' : p.price}
                  onChange={(e) =>
                    onUpdatePurchase(p.id, { price: e.target.value === '' ? 0 : Number(e.target.value) })
                  }
                  placeholder="0"
                  className="text-sm bg-cream/70 rounded-lg px-2 py-1.5 text-right tabular focus:outline-none focus:ring-1 focus:ring-mango"
                />
                <span className="text-sm text-right tabular pr-1">{formatRp(p.qty * p.price)}</span>
                <button
                  onClick={() => onDeletePurchase(p.id)}
                  className="text-ink/30 hover:text-rust flex justify-center"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-ink/10 flex justify-between items-center bg-cream/50">
          <span className="text-sm font-medium">Total modal batch ini</span>
          <span className="font-display text-lg tabular text-mango-dark">{formatRp(t.totalModal)}</span>
        </div>
      </section>

      {/* Produksi & Penjualan */}
      <section className="bg-paper rounded-xl2 border border-ink/10 px-5 py-4 mb-5">
        <h2 className="font-display text-base mb-3">Produksi &amp; penjualan</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Unit diproduksi">
            <input
              type="number"
              value={batch.unitsProduced === 0 ? '' : batch.unitsProduced}
              onChange={(e) => onUpdate({ unitsProduced: e.target.value === '' ? 0 : Number(e.target.value) })}
              placeholder="0"
              className="w-full text-sm bg-cream/70 rounded-lg px-2.5 py-2 text-right tabular focus:outline-none focus:ring-1 focus:ring-pool"
            />
          </Field>
          <Field label="Unit terjual">
            <input
              type="number"
              value={batch.unitsSold === 0 ? '' : batch.unitsSold}
              onChange={(e) => onUpdate({ unitsSold: e.target.value === '' ? 0 : Number(e.target.value) })}
              placeholder="0"
              className="w-full text-sm bg-cream/70 rounded-lg px-2.5 py-2 text-right tabular focus:outline-none focus:ring-1 focus:ring-pool"
            />
          </Field>
          <Field label="Harga jual / unit">
            <input
              type="number"
              value={batch.sellPrice === 0 ? '' : batch.sellPrice}
              onChange={(e) => onUpdate({ sellPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
              placeholder="0"
              className="w-full text-sm bg-cream/70 rounded-lg px-2.5 py-2 text-right tabular focus:outline-none focus:ring-1 focus:ring-pool"
            />
          </Field>
        </div>
        {t.sisaStok > 0 && (
          <p className="text-xs text-ink/50 mt-3">
            Sisa stok belum terjual: <span className="font-medium text-ink/70">{t.sisaStok} unit</span>
          </p>
        )}
      </section>

      {/* Hasil */}
      <section className="rounded-xl2 border border-mango/20 px-5 py-4 bg-gradient-to-br from-mango-light/30 to-paper">
        <div className="flex items-center gap-2 mb-3">
          <MangoIcon className="w-5 h-5 text-mango-dark" />
          <h2 className="font-display text-base text-ink">Hasil batch ini</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Result label="HPP / unit" value={formatRp(t.hppPerUnit)} />
          <Result label="Total pemasukan" value={formatRp(t.totalPemasukan)} />
          <Result
            label={belumJual ? 'Untung / rugi' : t.untung >= 0 ? 'Untung' : 'Rugi'}
            value={belumJual ? '—' : formatRp(t.untung)}
            highlight={!belumJual}
            positive={t.untung >= 0}
          />
          <Result label="Margin" value={belumJual ? '—' : formatPct(t.marginPct)} />
        </div>
      </section>

      <AutoGrowTextarea
        value={batch.note}
        onChange={(e) => onUpdate({ note: e.target.value })}
        placeholder="Catatan batch ini (opsional)..."
        rows={2}
        className="w-full mt-4 text-sm bg-paper border border-ink/10 rounded-xl2 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-pool resize-none overflow-hidden"
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] text-ink/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Result({
  label,
  value,
  highlight,
  positive,
}: {
  label: string
  value: string
  highlight?: boolean
  positive?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] text-ink/45">{label}</p>
      <p
        className={`font-display text-xl mt-0.5 tabular ${
          highlight ? (positive ? 'text-clover-dark' : 'text-rust') : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
