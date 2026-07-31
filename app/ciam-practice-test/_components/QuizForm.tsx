'use client';

import { useState } from 'react';
import type { Letter, QuizQuestion } from '../_lib/types';

const OPTIONS: Letter[] = ['A', 'B', 'C', 'D'];

export default function QuizForm({
  questions,
  onSubmit,
  loading,
}: {
  questions: QuizQuestion[];
  onSubmit: (answers: Record<number, Letter | null>) => void;
  loading: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, Letter | null>>({});

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const allAnswered = answeredCount === questions.length;

  function handleSelect(id: number, option: Letter) {
    setAnswers((prev) => ({ ...prev, [id]: option }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    onSubmit(answers);
  }

  return (
    <div>
      <div className="sticky top-0 bg-[#fafafa]/95 backdrop-blur-sm border-b border-black/10 py-3 mb-8 z-10">
        <span className="text-sm text-black/40">
          {answeredCount} / {questions.length} answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="border border-black/10 rounded-xl p-5">
            <p className="text-xs text-black/30 mb-1">{q.section}</p>
            <p className="font-medium mb-4">
              {index + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-start gap-3 border rounded-lg px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    answers[q.id] === opt
                      ? 'border-garnet bg-garnet/5'
                      : 'border-black/10 hover:border-black/30'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSelect(q.id, opt)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium mr-1">{opt}.</span>
                    {q.choices[opt]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="w-full max-w-xs bg-[#111111] text-white rounded-xl py-3 text-sm font-medium shadow-sm hover:bg-black/80 transition-colors disabled:opacity-40"
        >
          {loading
            ? 'Grading...'
            : allAnswered
              ? 'Submit quiz'
              : `Answer all questions (${questions.length - answeredCount} left)`}
        </button>
      </div>
    </div>
  );
}
