'use client';

import type { GallonBag, LooseBag } from '../_lib/types';

type Props = {
  gallonBags: GallonBag[];
  looseBags: LooseBag[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InventoryList({ gallonBags, looseBags }: Props) {
  const empty = gallonBags.length === 0 && looseBags.length === 0;

  if (empty) {
    return (
      <p className="text-black/30 text-sm text-center py-12">
        No inventory yet. Add a bag to get started.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {gallonBags.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-black/40 mb-3">Gallon bags</h2>
          <div className="space-y-2">
            {gallonBags.map((bag) => (
              <div
                key={bag.id}
                className="flex items-center justify-between border border-black/10 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-sm">#{bag.bag_number}</p>
                  <p className="text-black/40 text-xs mt-0.5">{formatDate(bag.pump_date)}</p>
                  {bag.note && (
                    <p className="text-black/40 text-xs mt-0.5">{bag.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {bag.remaining_bags} / {bag.total_bags} bags
                  </p>
                  <p className="text-black/40 text-xs">{bag.remaining_bags * 5} oz remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {looseBags.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-black/40 mb-3">Loose bags</h2>
          <div className="space-y-2">
            {looseBags.map((bag) => (
              <div
                key={bag.id}
                className="flex items-center justify-between border border-black/10 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium">{formatDate(bag.pump_date)}</p>
                  {bag.note && (
                    <p className="text-black/40 text-xs mt-0.5">{bag.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{bag.count} bags</p>
                  <p className="text-black/40 text-xs">{bag.count * 5} oz</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
