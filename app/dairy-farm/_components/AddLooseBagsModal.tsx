'use client';

import { useState } from 'react';
import { supabase } from '../_lib/supabase';
import Modal from './Modal';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddLooseBagsModal({ onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [pumpDate, setPumpDate] = useState(today);
  const [bagCount, setBagCount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = parseInt(bagCount, 10);
    if (!pumpDate || isNaN(count) || count < 1) return;

    setSubmitting(true);
    setError(null);

    const { data: existing } = await supabase
      .from('loose_bags')
      .select('id, count')
      .eq('pump_date', pumpDate)
      .maybeSingle();

    const noteValue = note.trim() || null;

    let err;
    if (existing) {
      ({ error: err } = await supabase
        .from('loose_bags')
        .update({ count: existing.count + count, note: noteValue })
        .eq('id', existing.id));
    } else {
      ({ error: err } = await supabase
        .from('loose_bags')
        .insert({ pump_date: pumpDate, count, note: noteValue }));
    }

    if (err) {
      setError('Failed to add bags.');
      setSubmitting(false);
      return;
    }

    await supabase.from('transactions').insert({ type: 'add', oz: count * 5 });

    onSuccess();
    onClose();
  }

  return (
    <Modal title="Add loose bags" onClose={onClose}>
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
          <label className="block text-sm font-medium mb-1.5">Number of bags</label>
          <input
            type="number"
            min="1"
            value={bagCount}
            onChange={(e) => setBagCount(e.target.value)}
            placeholder="e.g. 3"
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Note <span className="text-black/40 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. extra thick session"
            className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#111111] text-white rounded-lg py-3 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add bags'}
        </button>
      </form>
    </Modal>
  );
}
