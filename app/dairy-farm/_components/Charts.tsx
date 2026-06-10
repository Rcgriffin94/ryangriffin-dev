'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabase';

type Transaction = {
  type: 'add' | 'remove';
  oz: number;
  occurred_on: string;
};

type DayData = {
  date: string;
  frozen: number;
  withdrawn: number;
};

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Charts() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const { data: rows } = await supabase
        .from('transactions')
        .select('type, oz, occurred_on')
        .order('occurred_on', { ascending: true });

      if (!rows || rows.length === 0) {
        setLoading(false);
        return;
      }

      const byDay = new Map<string, DayData>();
      for (const row of rows as Transaction[]) {
        const key = row.occurred_on;
        if (!byDay.has(key)) {
          byDay.set(key, { date: key, frozen: 0, withdrawn: 0 });
        }
        const day = byDay.get(key)!;
        if (row.type === 'add') day.frozen += row.oz;
        else day.withdrawn += row.oz;
      }

      setData(Array.from(byDay.values()).map((d) => ({ ...d, date: formatDateLabel(d.date) })));
      setLoading(false);
    }

    fetchTransactions();
  }, []);

  if (loading) return null;

  if (data.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-black/40 mb-3">Daily activity</h2>
        <p className="text-black/30 text-sm text-center py-8">
          No activity recorded yet. Transactions will appear here after your first add or remove.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xs uppercase tracking-widest text-black/40 mb-4">Daily activity</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#00000060' }} />
          <YAxis tick={{ fontSize: 11, fill: '#00000060' }} unit=" oz" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #00000015' }}
            formatter={(value, name) => [`${value} oz`, String(name)]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <Bar dataKey="frozen" fill="#4ade80" name="frozen" radius={[3, 3, 0, 0]} />
          <Bar dataKey="withdrawn" fill="#f87171" name="withdrawn" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
