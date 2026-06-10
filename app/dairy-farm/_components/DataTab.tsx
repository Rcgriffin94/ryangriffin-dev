'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabase';
import type { LooseBag } from '../_lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DataTab() {
  const [bags, setBags] = useState<LooseBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [noteSearch, setNoteSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('loose_bags')
        .select('*')
        .order('pump_date', { ascending: false });
      setBags(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = bags.filter((bag) => {
    if (dateFrom && bag.pump_date < dateFrom) return false;
    if (dateTo && bag.pump_date > dateTo) return false;
    if (noteSearch && !(bag.note ?? '').toLowerCase().includes(noteSearch.toLowerCase())) return false;
    return true;
  });

  const totalBags = filtered.reduce((sum, b) => sum + b.count, 0);
  const totalOz = totalBags * 5;

  return (
    <div className="pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-black/40 uppercase tracking-widest mb-1.5">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/40 uppercase tracking-widest mb-1.5">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black/40 uppercase tracking-widest mb-1.5">
            Note
          </label>
          <input
            type="text"
            value={noteSearch}
            onChange={(e) => setNoteSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-black/30 text-sm text-center py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-black/30 text-sm text-center py-12">No loose bags match your filters.</p>
      ) : (
        <>
          <div className="border border-black/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Pump date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Note</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Bags</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Oz</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bag, i) => (
                  <tr key={bag.id} className={i < filtered.length - 1 ? 'border-b border-black/5' : ''}>
                    <td className="px-4 py-3 font-medium">{formatDate(bag.pump_date)}</td>
                    <td className="px-4 py-3 text-black/40">{bag.note ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{bag.count}</td>
                    <td className="px-4 py-3 text-right">{bag.count * 5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-6 mt-4 text-sm text-black/40">
            <span>{filtered.length} row{filtered.length !== 1 ? 's' : ''}</span>
            <span>{totalBags} bags</span>
            <span>{totalOz} oz</span>
          </div>
        </>
      )}
    </div>
  );
}
