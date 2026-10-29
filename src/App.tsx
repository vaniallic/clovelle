import { useState } from 'react'
import { useCloudStore } from './lib/cloudStore'
import { supabaseConfigured } from './lib/supabase'
import { Sidebar, View } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { BatchView } from './components/BatchView'
import { KasView } from './components/KasView'
import { Gate } from './components/Gate'
import { CloverIcon } from './components/icons'

export default function App() {
  const {
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
  } = useCloudStore()

  const [view, setView] = useState<View>('dashboard')

  async function handleAddBatch() {
    const id = await addBatch()
    setView({ batchId: id })
  }

  const activeBatch =
    typeof view === 'object' ? store.batches.find((b) => b.id === view.batchId) : undefined

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6 text-center">
        <div className="max-w-md">
          <CloverIcon className="w-10 h-10 text-mango mx-auto mb-3" />
          <h1 className="font-display text-2xl mb-2">Belum tersambung ke database</h1>
          <p className="text-sm text-ink/60">
            Isi <code className="bg-ink/5 px-1 rounded">VITE_SUPABASE_URL</code> dan{' '}
            <code className="bg-ink/5 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> di file{' '}
            <code className="bg-ink/5 px-1 rounded">.env</code> (lokal) atau Environment Variables di
            Vercel. Langkahnya ada di README.md.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Gate>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar store={store} view={view} setView={setView} onAddBatch={handleAddBatch} />
        <main className="flex-1 bg-paper px-5 py-7 md:px-10 md:py-10">
          {loading && <p className="text-sm text-ink/40">Memuat data…</p>}
          {!loading && error && (
            <p className="text-sm text-rust mb-4">Gagal memuat data: {error}</p>
          )}
          {!loading && view === 'dashboard' && (
            <Dashboard
              store={store}
              onOpenBatch={(id) => setView({ batchId: id })}
              onAddBatch={handleAddBatch}
            />
          )}
          {!loading && view === 'kas' && (
            <KasView
              store={store}
              onSetStartingCapital={setStartingCapital}
              onAddWithdrawal={addWithdrawal}
              onDeleteWithdrawal={deleteWithdrawal}
            />
          )}
          {!loading && activeBatch && (
            <BatchView
              batch={activeBatch}
              onUpdate={(patch) => updateBatch(activeBatch.id, patch)}
              onAddPurchase={() => addPurchase(activeBatch.id)}
              onUpdatePurchase={(pid, patch) => updatePurchase(activeBatch.id, pid, patch)}
              onDeletePurchase={(pid) => deletePurchase(activeBatch.id, pid)}
              onDelete={async () => {
                await deleteBatch(activeBatch.id)
                setView('dashboard')
              }}
            />
          )}
        </main>
      </div>
    </Gate>
  )
}
