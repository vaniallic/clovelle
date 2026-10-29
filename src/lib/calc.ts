import { Batch, Store } from './types'

export function batchTotals(b: Batch) {
  const totalModal = b.purchases.reduce((sum, p) => sum + p.qty * p.price, 0)
  const totalPemasukan = b.unitsSold * b.sellPrice
  const hppPerUnit = b.unitsProduced > 0 ? totalModal / b.unitsProduced : 0
  const untung = totalPemasukan - totalModal
  const marginPct = totalPemasukan > 0 ? untung / totalPemasukan : 0
  const sisaStok = Math.max(b.unitsProduced - b.unitsSold, 0)
  return { totalModal, totalPemasukan, hppPerUnit, untung, marginPct, sisaStok }
}

export function kasUsaha(store: Store): number {
  const dariBatch = store.batches.reduce((sum, b) => {
    const t = batchTotals(b)
    return sum + t.totalPemasukan - t.totalModal
  }, 0)
  const ditarik = store.withdrawals.reduce((sum, w) => sum + w.amount, 0)
  return store.startingCapital + dariBatch - ditarik
}

export function ringkasan(store: Store) {
  let totalModal = 0
  let totalPemasukan = 0
  store.batches.forEach((b) => {
    const t = batchTotals(b)
    totalModal += t.totalModal
    totalPemasukan += t.totalPemasukan
  })
  const totalUntung = totalPemasukan - totalModal
  const totalDitarik = store.withdrawals.reduce((sum, w) => sum + w.amount, 0)
  return { totalModal, totalPemasukan, totalUntung, totalDitarik, kas: kasUsaha(store) }
}
