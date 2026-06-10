'use client';

import type { GallonBag, LooseBag } from '../_lib/types';

type Props = {
  gallonBags: GallonBag[];
  looseBags: LooseBag[];
};

const GOAL_OZ = 2700;

export default function Dashboard({ gallonBags, looseBags }: Props) {
  const looseCount = looseBags.reduce((sum, b) => sum + b.count, 0);
  const gallonCount = gallonBags.length;
  const totalSmallBags =
    gallonBags.reduce((sum, b) => sum + b.remaining_bags, 0) + looseCount;
  const totalOz = totalSmallBags * 5;
  const diff = totalOz - GOAL_OZ;

  return (
    <div className="space-y-4 mb-10">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Loose bags" value={looseCount} />
        <StatCard label="Gallon bags" value={gallonCount} />
        <StatCard label="Total oz" value={totalOz} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Goal" value={GOAL_OZ} unit=" oz" />
        <div className="border border-black/10 rounded-xl p-5">
          <p className="text-black/40 text-xs uppercase tracking-widest mb-1">Difference</p>
          <p className={`text-3xl font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {diff >= 0 ? '+' : ''}{diff} oz
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div className="border border-black/10 rounded-xl p-5">
      <p className="text-black/40 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}{unit}</p>
    </div>
  );
}
