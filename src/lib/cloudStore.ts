import { useCallback, useEffect, useRef, useState } from 'react'
import { Batch, Purchase, Store, Withdrawal, emptyStore } from './types'
import { supabase, supabaseConfigured } from './supabase'
import { debounce } from './debounce'

// ---- row <-> app-model mapping ----

function rowToBatch(r: any, purchaseRows: any[]): Batch {
  return {
    id: r.id,
    name: r.name ?? '',
    date: r.date ?? '',
    unitsProduced: Number(r.units_produced) || 0,
    unitsSold: Number(r.units_sold) || 0,
    sellPrice: Number(r.sell_price) || 0,
    note: r.note ?? '',
    purchases: purchaseRows
      .filter((p) => p.batch_id === r.id)
      .map((p) => ({ id: p.id, name: p.name ?? '', qty: Number(p.qty) || 0, price: Number(p.price) || 0 })),
  }
}

function rowToWithdrawal(w: any): Withdrawal {
  return { id: w.id, date: w.date ?? '', amount: Number(w.amount) || 0, note: w.note ?? '' }
}

function batchPatchToRow(patch: Partial<Batch>) {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.date !== undefined) row.date = patch.date
  if (patch.unitsProduced !== undefined) row.units_produced = patch.unitsProduced
  if (patch.unitsSold !== undefined) row.units_sold = patch.unitsSold
  if (patch.sellPrice !== undefined) row.sell_price = patch.sellPrice
  if (patch.note !== undefined) row.note = patch.note
  return row
}

async function fetchAll(): Promise<Store> {
  const [settingsRes, batchesRes, purchasesRes, withdrawalsRes] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('batches').select('*').order('created_at', { ascending: true }),
    supabase.from('purchases').select('*').order('created_at', { ascending: true }),
    supabase.from('withdrawals').select('*').order('date', { ascending: true }),
  ])
  if (settingsRes.error) throw settingsRes.error
  if (batchesRes.error) throw batchesRes.error
  if (purchasesRes.error) throw purchasesRes.error
  if (withdrawalsRes.error) throw withdrawalsRes.error

  const purchaseRows = purchasesRes.data ?? []
  const batches = (batchesRes.data ?? []).map((r) => rowToBatch(r, purchaseRows))
  const withdrawals = (withdrawalsRes.data ?? []).map(rowToWithdrawal)

  return {
    startingCapital: settingsRes.data ? Number(settingsRes.data.starting_capital) || 0 : 0,
    startingCapitalSet: !!settingsRes.data,
    batches,
    withdrawals,
  }
}

export function useCloudStore() {
  const [store, setStore] = useState<Store>(emptyStore)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pendingBatch = useRef<Record<string, Partial<Batch>>>({})
  const batchTimer = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingPurchase = useRef<Record<string, Partial<Purchase>>>({})
  const purchaseTimer = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const capitalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCapital = useRef<number | null>(null)

  const refetch = useCallback(async () => {
    if (!supabaseConfigured) return
    try {
      const fresh = await fetchAll()
      // Reapply any edits that are still debounced (not yet written to the DB) so a
      // sync triggered elsewhere doesn't overwrite what the person is mid-typing.
      const merged: Store = {
        ...fresh,
        startingCapital: pendingCapital.current !== null ? pendingCapital.current : fresh.startingCapital,
        batches: fresh.batches.map((b) => {
          const bPatch = pendingBatch.current[b.id]
          const withBatch = bPatch ? { ...b, ...bPatch } : b
          return {
            ...withBatch,
            purchases: withBatch.purchases.map((p) => {
              const pPatch = pendingPurchase.current[p.id]
              return pPatch ? { ...p, ...pPatch } : p
            }),
          }
        }),
      }
      setStore(merged)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    refetch()
    const debouncedRefetch = debounce(() => refetch(), 400)
    const channel = supabase
      .channel('clovelle-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, debouncedRefetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, debouncedRefetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, debouncedRefetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, debouncedRefetch)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  const setStartingCapital = useCallback((amount: number) => {
    setStore((s) => ({ ...s, startingCapital: amount, startingCapitalSet: true }))
    pendingCapital.current = amount
    if (capitalTimer.current) clearTimeout(capitalTimer.current)
    capitalTimer.current = setTimeout(async () => {
      await supabase.from('settings').upsert({ id: 1, starting_capital: amount })
      if (pendingCapital.current === amount) pendingCapital.current = null
    }, 400)
  }, [])

  const addBatch = useCallback(async (): Promise<string> => {
    const n = store.batches.length + 1
    const { data, error: err } = await supabase
      .from('batches')
      .insert({ name: `Batch ${n}`, date: new Date().toISOString().slice(0, 10) })
      .select()
      .single()
    if (err || !data) throw err
    const batch = rowToBatch(data, [])
    setStore((s) => ({ ...s, batches: [...s.batches, batch] }))
    return batch.id
  }, [store.batches.length])

  const updateBatch = useCallback((id: string, patch: Partial<Batch>) => {
    setStore((s) => ({
      ...s,
      batches: s.batches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
    pendingBatch.current[id] = { ...pendingBatch.current[id], ...patch }
    if (batchTimer.current[id]) clearTimeout(batchTimer.current[id])
    batchTimer.current[id] = setTimeout(async () => {
      const p = pendingBatch.current[id]
      if (!p) return
      await supabase.from('batches').update(batchPatchToRow(p)).eq('id', id)
      // Only clear if nothing newer was typed while this write was in flight.
      if (pendingBatch.current[id] === p) delete pendingBatch.current[id]
    }, 500)
  }, [])

  const deleteBatch = useCallback(async (id: string) => {
    setStore((s) => ({ ...s, batches: s.batches.filter((b) => b.id !== id) }))
    await supabase.from('batches').delete().eq('id', id)
  }, [])

  const addPurchase = useCallback(async (batchId: string) => {
    const { data, error: err } = await supabase
      .from('purchases')
      .insert({ batch_id: batchId, name: '', qty: 0, price: 0 })
      .select()
      .single()
    if (err || !data) return
    const purchase: Purchase = { id: data.id, name: data.name ?? '', qty: Number(data.qty) || 0, price: Number(data.price) || 0 }
    setStore((s) => ({
      ...s,
      batches: s.batches.map((b) => (b.id === batchId ? { ...b, purchases: [...b.purchases, purchase] } : b)),
    }))
  }, [])

  const updatePurchase = useCallback(
    (batchId: string, purchaseId: string, patch: Partial<Purchase>) => {
      setStore((s) => ({
        ...s,
        batches: s.batches.map((b) =>
          b.id === batchId
            ? { ...b, purchases: b.purchases.map((p) => (p.id === purchaseId ? { ...p, ...patch } : p)) }
            : b,
        ),
      }))
      pendingPurchase.current[purchaseId] = { ...pendingPurchase.current[purchaseId], ...patch }
      if (purchaseTimer.current[purchaseId]) clearTimeout(purchaseTimer.current[purchaseId])
      purchaseTimer.current[purchaseId] = setTimeout(async () => {
        const p = pendingPurchase.current[purchaseId]
        if (!p) return
        await supabase.from('purchases').update(p).eq('id', purchaseId)
        // Only clear if nothing newer was typed while this write was in flight.
        if (pendingPurchase.current[purchaseId] === p) delete pendingPurchase.current[purchaseId]
      }, 500)
    },
    [],
  )

  const deletePurchase = useCallback(async (batchId: string, purchaseId: string) => {
    setStore((s) => ({
      ...s,
      batches: s.batches.map((b) =>
        b.id === batchId ? { ...b, purchases: b.purchases.filter((p) => p.id !== purchaseId) } : b,
      ),
    }))
    await supabase.from('purchases').delete().eq('id', purchaseId)
  }, [])

  const addWithdrawal = useCallback(async (w: Omit<Withdrawal, 'id'>) => {
    const { data, error: err } = await supabase
      .from('withdrawals')
      .insert({ date: w.date, amount: w.amount, note: w.note })
      .select()
      .single()
    if (err || !data) return
    setStore((s) => ({ ...s, withdrawals: [...s.withdrawals, rowToWithdrawal(data)] }))
  }, [])

  const deleteWithdrawal = useCallback(async (id: string) => {
    setStore((s) => ({ ...s, withdrawals: s.withdrawals.filter((w) => w.id !== id) }))
    await supabase.from('withdrawals').delete().eq('id', id)
  }, [])

  return {
    store,
    loading,
    error,
    setStartingCapital,
    addBatch,
    updateBatch,
    deleteBatch,
    addPurchase,
    updatePurchase,
    deletePurchase,
    addWithdrawal,
    deleteWithdrawal,
  }
}
