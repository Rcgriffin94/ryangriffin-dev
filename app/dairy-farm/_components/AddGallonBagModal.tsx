'use client';

import { useState } from 'react';
import { supabase } from '../_lib/supabase';
import Modal from './Modal';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

function toBagNumberPrefix(dateStr: string) {
  const [, month, day] = dateStr.split('-');
  return `${month}${day}`;
}

export default function AddGallonBagModal({ onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [pumpDate, setPumpDate] = useState(today);
  const [bagCount, setBagCount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = parseInt(bagCount, 10);
    if (!pumpDate || isNaN(count) || count < 1) return;

    setSubmitting(true);
    setError(null);

    const prefix = toBagNumberPrefix(pumpDate);

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
      pump_date: pumpDate,
      total_bags: count,
      remaining_bags: count,
    });

    if (insertErr) {
      setError('Failed to add bag.');
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <Modal title="Add gallon bag" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Pump date</label>
          <input
            type="date"
            value={pumpDate}
            onChange={(e) => setPumpDate(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Number of small bags inside</label>
          <input
            type="number"
            min="1"
            value={bagCount}
            onChange={(e) => setBagCount(e.target.value)}
            placeholder="e.g. 6"
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
          {submitting ? 'Adding...' : 'Add bag'}
        </button>
      </form>
    </Modal>
  );
}
