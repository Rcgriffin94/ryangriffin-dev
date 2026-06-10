'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabase';

type DataPoint = {
  date: string;
  oz: number;
};

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Charts() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [gallonRes, looseRes] = await Promise.all([
        supabase.from('gallon_bags').select('pump_date, remaining_bags').gt('remaining_bags', 0),
        supabase.from('loose_bags').select('pump_date, count'),
      ]);

      const byDate = new Map<string, number>();

      for (const bag of gallonRes.data ?? []) {
        byDate.set(bag.pump_date, (byDate.get(bag.pump_date) ?? 0) + bag.remaining_bags * 5);
      }
      for (const bag of looseRes.data ?? []) {
        byDate.set(bag.pump_date, (byDate.get(bag.pump_date) ?? 0) + bag.count * 5);
      }

      const sorted = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, oz]) => ({ date: formatDateLabel(date), oz }));

      setData(sorted);
      setLoading(false);
    }

    fetch();
  }, []);

  if (loading) return null;

  if (data.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-black/40 mb-3">Oz by pump date</h2>
        <p className="text-black/30 text-sm text-center py-8">No inventory in the freezer yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xs uppercase tracking-widest text-black/40 mb-4">Oz by pump date</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#00000060' }} />
          <YAxis tick={{ fontSize: 11, fill: '#00000060' }} unit=" oz" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #00000015' }}
            formatter={(value) => [`${value} oz`, 'In freezer']}
          />
          <Line
            type="monotone"
            dataKey="oz"
            stroke="#111111"
            strokeWidth={2}
            dot={{ r: 3, fill: '#111111' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
