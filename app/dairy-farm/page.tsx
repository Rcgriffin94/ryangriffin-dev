'use client';

import { useEffect, useState } from 'react';
import { supabase } from './_lib/supabase';
import type { GallonBag, LooseBag } from './_lib/types';
import Dashboard from './_components/Dashboard';
import InventoryList from './_components/InventoryList';
import Charts from './_components/Charts';
import ExpiryChart from './_components/ExpiryChart';
import AddGallonBagModal from './_components/AddGallonBagModal';
import AddLooseBagsModal from './_components/AddLooseBagsModal';
import RemoveBagsModal from './_components/RemoveBagsModal';

type Modal = 'add-gallon' | 'add-loose' | 'remove' | null;
type Tab = 'inventory' | 'monitoring';

const tabs: { id: Tab; label: string }[] = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'monitoring', label: 'Monitoring' },
];

export default function DairyFarmPage() {
  const [gallonBags, setGallonBags] = useState<GallonBag[]>([]);
  const [looseBags, setLooseBags] = useState<LooseBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [tab, setTab] = useState<Tab>('inventory');

  async function fetchInventory() {
    const [gallonRes, looseRes] = await Promise.all([
      supabase
        .from('gallon_bags')
        .select('*')
        .gt('remaining_bags', 0)
        .order('pump_date', { ascending: true }),
      supabase
        .from('loose_bags')
        .select('*')
        .order('pump_date', { ascending: true }),
    ]);

    if (gallonRes.error || looseRes.error) {
      setError('Failed to load inventory.');
      return;
    }

    setGallonBags(gallonRes.data ?? []);
    setLooseBags(looseRes.data ?? []);
  }

  useEffect(() => {
    fetchInventory().finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="border-b border-black/10 px-6 max-w-2xl mx-auto w-full">
        <div className="py-5">
          <span className="text-lg font-semibold tracking-tight">Dairy Farm</span>
        </div>
        <nav className="flex gap-1 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-black text-black'
                  : 'border-transparent text-black/40 hover:text-black/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-10 pb-32">
        {loading && <p className="text-black/30 text-sm">Loading...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && !error && tab === 'inventory' && (
          <>
            <Dashboard gallonBags={gallonBags} looseBags={looseBags} />
            <InventoryList gallonBags={gallonBags} looseBags={looseBags} />
          </>
        )}

        {!loading && !error && tab === 'monitoring' && (
          <>
            <ExpiryChart gallonBags={gallonBags} />
            <Charts />
          </>
        )}
      </section>

      {tab === 'inventory' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 px-6">
          <button
            onClick={() => setModal('add-gallon')}
            className="flex-1 max-w-xs bg-white border border-black/10 rounded-xl py-3 text-sm font-medium shadow-sm hover:border-black/30 transition-colors"
          >
            + Gallon bag
          </button>
          <button
            onClick={() => setModal('add-loose')}
            className="flex-1 max-w-xs bg-white border border-black/10 rounded-xl py-3 text-sm font-medium shadow-sm hover:border-black/30 transition-colors"
          >
            + Loose bags
          </button>
          <button
            onClick={() => setModal('remove')}
            className="flex-1 max-w-xs bg-[#111111] text-white rounded-xl py-3 text-sm font-medium shadow-sm hover:bg-black/80 transition-colors"
          >
            Use bags
          </button>
        </div>
      )}

      {modal === 'add-gallon' && (
        <AddGallonBagModal looseBags={looseBags} onClose={() => setModal(null)} onSuccess={fetchInventory} />
      )}
      {modal === 'add-loose' && (
        <AddLooseBagsModal onClose={() => setModal(null)} onSuccess={fetchInventory} />
      )}
      {modal === 'remove' && (
        <RemoveBagsModal
          gallonBags={gallonBags}
          looseBags={looseBags}
          onClose={() => setModal(null)}
          onSuccess={fetchInventory}
        />
      )}
    </main>
  );
}
