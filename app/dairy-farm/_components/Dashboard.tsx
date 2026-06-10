'use client';

import type { GallonBag, LooseBag } from '../_lib/types';

type Props = {
  gallonBags: GallonBag[];
  looseBags: LooseBag[];
};

export default function Dashboard({ gallonBags, looseBags }: Props) {
  const looseCount = looseBags.reduce((sum, b) => sum + b.count, 0);
  const gallonCount = gallonBags.length;
  const totalSmallBags =
    gallonBags.reduce((sum, b) => sum + b.remaining_bags, 0) + looseCount;
  const totalOz = totalSmallBags * 5;

  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      <StatCard label="Loose bags" value={looseCount} />
      <StatCard label="Gallon bags" value={gallonCount} />
      <StatCard label="Total oz" value={totalOz} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-black/10 rounded-xl p-5">
      <p className="text-black/40 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
