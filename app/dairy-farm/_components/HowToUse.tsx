'use client';

const steps = [
  {
    title: 'Add loose bags',
    description:
      'After a pumping session, tap "+ Loose bags" and enter the pump date, how many 5 oz bags you filled, and an optional note. Bags are grouped by date.',
  },
  {
    title: 'Create a gallon bag',
    description:
      'Once you have enough loose bags to fill a gallon freezer bag, tap "+ Gallon bag". Pick the pump date and how many loose bags to consolidate. The app auto-assigns a number (e.g. 0610-1) — write it on the physical bag.',
  },
  {
    title: 'Use bags',
    description:
      'When you need milk, tap "Use bags". The app recommends the oldest gallon bag first (FIFO), but you choose what to pull and how many bags to remove.',
  },
  {
    title: 'Monitor expiry',
    description:
      'The Monitoring tab shows gallon bags expiring within 30, 60, and 90 days (based on a 12-month shelf life). The table below the chart lists each bag and how many days it has left.',
  },
  {
    title: 'Explore your data',
    description:
      'The Data tab shows a full table of all loose bags in inventory. Filter by date range or note text to find specific batches.',
  },
];

export default function HowToUse() {
  return (
    <div className="pt-2 space-y-4">
      {steps.map((step, i) => (
        <div key={step.title} className="flex gap-4 border border-black/10 rounded-xl px-5 py-4">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs font-semibold text-black/40">
            {i + 1}
          </div>
          <div>
            <p className="font-semibold text-sm mb-1">{step.title}</p>
            <p className="text-sm text-black/50 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
