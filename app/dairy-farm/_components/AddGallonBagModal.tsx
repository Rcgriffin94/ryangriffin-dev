'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabase';
import type { LooseBag } from '../_lib/types';
import Modal from './Modal';

type Props = {
  looseBags: LooseBag[];
  onClose: () => void;
  onSuccess: () => void;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toBagNumberPrefix(dateStr: string) {
  const [, month, day] = dateStr.split('-');
  return `${month}${day}`;
}

export default function AddGallonBagModal({ looseBags, onClose, onSuccess }: Props) {
  const [selectedId, setSelectedId] = useState(looseBags[0]?.id ?? '');
  const [bagCount, setBagCount] = useState('');
  const [previewNumber, setPreviewNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBag = looseBags.find((b) => b.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedBag) return;
    const prefix = toBagNumberPrefix(selectedBag.pump_date);
    supabase
      .from('gallon_bags')
      .select('bag_number')
      .like('bag_number', `${prefix}-%`)
      .then(({ data }) => {
        const sequence = (data?.length ?? 0) + 1;
        setPreviewNumber(`${prefix}-${sequence}`);
      });
  }, [selectedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = parseInt(bagCount, 10);
    if (!selectedBag || isNaN(count) || count < 1 || count > selectedBag.count) return;

    setSubmitting(true);
    setError(null);

    const prefix = toBagNumberPrefix(selectedBag.pump_date);

    const { data: existing, error: fetchErr } = await supabase
      .from('gallon_bags')
      .select('bag_number')
      .like('bag_number', `${prefix}-%`);

    if (fetchErr) {
      setError('Failed to generate bag number.');
      setSubmitting(false);
      return;
    }

    const sequence = (existing?.length ?? 0) + 1;
    const bagNumber = `${prefix}-${sequence}`;

    const { error: insertErr } = await supabase.from('gallon_bags').insert({
      bag_number: bagNumber,
      pump_date: selectedBag.pump_date,
      total_bags: count,
      remaining_bags: count,
      note: selectedBag.note ?? null,
    });

    if (insertErr) {
      setError('Failed to create gallon bag.');
      setSubmitting(false);
      return;
    }

    const newCount = selectedBag.count - count;
    if (newCount <= 0) {
      await supabase.from('loose_bags').delete().eq('id', selectedBag.id);
    } else {
      await supabase.from('loose_bags').update({ count: newCount }).eq('id', selectedBag.id);
    }

    onSuccess();
    onClose();
  }

  if (looseBags.length === 0) {
    return (
      <Modal title="Create gallon bag" onClose={onClose}>
        <p className="text-black/40 text-sm text-center py-6">
          No loose bags in inventory. Add some loose bags first.
        </p>
      </Modal>
    );
  }

  return (
    <Modal title="Create gallon bag" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Pump date</label>
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setBagCount(''); }}
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          >
            {looseBags.map((b) => (
              <option key={b.id} value={b.id}>
                {formatDate(b.pump_date)} ({b.count} available)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Number of bags{' '}
            {selectedBag && (
              <span className="text-black/40 font-normal">
                (max {selectedBag.count})
              </span>
            )}
          </label>
          <input
            type="number"
            min="1"
            max={selectedBag?.count ?? 1}
            value={bagCount}
            onChange={(e) => setBagCount(e.target.value)}
            placeholder="e.g. 6"
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        {previewNumber && (
          <div className="bg-black/5 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-black/40 uppercase tracking-widest">Bag name</span>
            <span className="font-semibold text-sm">#{previewNumber}</span>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#111111] text-white rounded-lg py-3 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create gallon bag'}
        </button>
      </form>
    </Modal>
  );
}
