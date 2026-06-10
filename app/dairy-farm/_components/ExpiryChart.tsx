'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { GallonBag } from '../_lib/types';

type Props = {
  gallonBags: GallonBag[];
};

const BUCKETS = [
  { label: '0–30 days', min: 0, max: 30, color: '#f87171' },
  { label: '31–60 days', min: 31, max: 60, color: '#fb923c' },
  { label: '61–90 days', min: 61, max: 90, color: '#4ade80' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function bucketColor(daysUntil: number) {
  if (daysUntil <= 30) return '#f87171';
  if (daysUntil <= 60) return '#fb923c';
  return '#4ade80';
}

export default function ExpiryChart({ gallonBags }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));

  const expiringBags = gallonBags
    .map((bag) => {
      const expiry = new Date(bag.pump_date + 'T00:00:00');
      expiry.setFullYear(expiry.getFullYear() + 1);
      const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...bag, expiry, daysUntil };
    })
    .filter((bag) => bag.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  for (const bag of expiringBags) {
    const bucket = counts.find((b) => bag.daysUntil >= b.min && bag.daysUntil <= b.max);
    if (bucket) bucket.count++;
  }

  const hasData = expiringBags.length > 0;

  return (
    <div className="mt-8">
      <h2 className="text-xs uppercase tracking-widest text-black/40 mb-4">Expiring gallon bags</h2>

      {!hasData ? (
        <p className="text-black/30 text-sm text-center py-8">
          No gallon bags expiring within 90 days.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={counts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#00000060' }} />
              <YAxis tick={{ fontSize: 11, fill: '#00000060' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #00000015' }}
                formatter={(value) => [`${value} bag${value !== 1 ? 's' : ''}`, 'Expiring']}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {counts.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-5 border border-black/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Bag</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Pump date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Expires</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-black/40 uppercase tracking-widest">Days left</th>
                </tr>
              </thead>
              <tbody>
                {expiringBags.map((bag, i) => (
                  <tr
                    key={bag.id}
                    className={i < expiringBags.length - 1 ? 'border-b border-black/5' : ''}
                  >
                    <td className="px-4 py-3 font-medium">#{bag.bag_number}</td>
                    <td className="px-4 py-3 text-black/60">{formatDate(bag.pump_date)}</td>
                    <td className="px-4 py-3 text-black/60">{formatDate(bag.expiry.toISOString().split('T')[0])}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: bucketColor(bag.daysUntil) }}
                      >
                        {bag.daysUntil}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
