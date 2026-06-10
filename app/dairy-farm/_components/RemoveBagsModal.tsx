'use client';

import { useState } from 'react';
import { supabase } from '../_lib/supabase';
import type { GallonBag, LooseBag } from '../_lib/types';
import Modal from './Modal';

type Source =
  | { type: 'gallon'; bag: GallonBag }
  | { type: 'loose'; bag: LooseBag };

type Props = {
  gallonBags: GallonBag[];
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

function fifoRecommendation(gallonBags: GallonBag[], looseBags: LooseBag[]): Source | null {
  if (gallonBags.length > 0) return { type: 'gallon', bag: gallonBags[0] };
  if (looseBags.length > 0) return { type: 'loose', bag: looseBags[0] };
  return null;
}

function sourceKey(s: Source) {
  return s.type === 'gallon' ? `gallon:${s.bag.id}` : `loose:${s.bag.id}`;
}

function sourceLabel(s: Source) {
  return s.type === 'gallon'
    ? `Gallon bag #${s.bag.bag_number} — ${formatDate(s.bag.pump_date)} (${s.bag.remaining_bags} bags left)`
    : `Loose — ${formatDate(s.bag.pump_date)} (${s.bag.count} bags)`;
}

function maxForSource(s: Source) {
  return s.type === 'gallon' ? s.bag.remaining_bags : s.bag.count;
}

export default function RemoveBagsModal({ gallonBags, looseBags, onClose, onSuccess }: Props) {
  const allSources: Source[] = [
    ...gallonBags.map((b): Source => ({ type: 'gallon', bag: b })),
    ...looseBags.map((b): Source => ({ type: 'loose', bag: b })),
  ];

  const recommendation = fifoRecommendation(gallonBags, looseBags);
  const [selectedKey, setSelectedKey] = useState<string>(
    recommendation ? sourceKey(recommendation) : ''
  );
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSource = allSources.find((s) => sourceKey(s) === selectedKey) ?? null;
  const max = selectedSource ? maxForSource(selectedSource) : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSource) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > max) return;

    setSubmitting(true);
    setError(null);

    let err;
    if (selectedSource.type === 'gallon') {
      const newRemaining = selectedSource.bag.remaining_bags - qty;
      ({ error: err } = await supabase
        .from('gallon_bags')
        .update({ remaining_bags: newRemaining })
        .eq('id', selectedSource.bag.id));
    } else {
      const newCount = selectedSource.bag.count - qty;
      if (newCount <= 0) {
        ({ error: err } = await supabase
          .from('loose_bags')
          .delete()
          .eq('id', selectedSource.bag.id));
      } else {
        ({ error: err } = await supabase
          .from('loose_bags')
          .update({ count: newCount })
          .eq('id', selectedSource.bag.id));
      }
    }

    if (err) {
      setError('Failed to remove bags.');
      setSubmitting(false);
      return;
    }

    await supabase.from('transactions').insert({ type: 'remove', oz: qty * 5 });

    onSuccess();
    onClose();
  }

  if (allSources.length === 0) {
    return (
      <Modal title="Remove bags" onClose={onClose}>
        <p className="text-black/40 text-sm text-center py-6">No inventory to remove from.</p>
      </Modal>
    );
  }

  return (
    <Modal title="Remove bags" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {recommendation && (
          <div className="bg-black/5 rounded-lg px-4 py-3 text-sm">
            <p className="text-black/40 text-xs uppercase tracking-widest mb-1">FIFO recommendation</p>
            <p className="font-medium">{sourceLabel(recommendation)}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Pull from</label>
          <select
            value={selectedKey}
            onChange={(e) => {
              setSelectedKey(e.target.value);
              setQuantity('1');
            }}
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          >
            {allSources.map((s) => (
              <option key={sourceKey(s)} value={sourceKey(s)}>
                {sourceLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Quantity <span className="text-black/40 font-normal">(max {max})</span>
          </label>
          <input
            type="number"
            min="1"
            max={max}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#111111] text-white rounded-lg py-3 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Removing...' : 'Remove bags'}
        </button>
      </form>
    </Modal>
  );
}
