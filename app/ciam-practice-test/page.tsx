'use client';

import { useState } from 'react';
import { gradeQuiz, startQuiz } from './_lib/actions';
import type { Letter, QuizQuestion, QuizResult } from './_lib/types';
import QuizStart from './_components/QuizStart';
import QuizForm from './_components/QuizForm';
import QuizResults from './_components/QuizResults';

type Screen = 'start' | 'quiz' | 'results';

export default function CiamPracticeTestPage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const qs = await startQuiz();
    setQuestions(qs);
    setScreen('quiz');
    setLoading(false);
  }

  async function handleSubmit(answers: Record<number, Letter | null>) {
    setLoading(true);
    const res = await gradeQuiz(answers);
    setResult(res);
    setScreen('results');
    setLoading(false);
  }

  function handleRetake() {
    setQuestions([]);
    setResult(null);
    setScreen('start');
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="border-b border-black/10 px-6 py-5 max-w-2xl mx-auto w-full">
        <span className="text-lg font-semibold tracking-tight">CIAM Practice Test</span>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-10 pb-32">
        {screen === 'start' && <QuizStart onStart={handleStart} loading={loading} />}
        {screen === 'quiz' && <QuizForm questions={questions} onSubmit={handleSubmit} loading={loading} />}
        {screen === 'results' && result && <QuizResults result={result} onRetake={handleRetake} />}
      </section>
    </main>
  );
}
