import type { QuizResult } from '../_lib/types';

export default function QuizResults({ result, onRetake }: { result: QuizResult; onRetake: () => void }) {
  const missed = result.results.filter((r) => !r.isCorrect);

  return (
    <div>
      <div className="text-center pt-8 pb-10">
        <p className="text-black/40 text-sm mb-2">Your score</p>
        <p className="text-5xl font-bold tracking-tight mb-1">{result.percentage}%</p>
        <p className="text-black/40 text-sm">
          {result.score} / {result.total} correct
        </p>
        <button
          onClick={onRetake}
          className="mt-6 border border-black/10 rounded-xl px-6 py-2.5 text-sm font-medium hover:border-black/30 transition-colors"
        >
          Retake quiz
        </button>
      </div>

      {missed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-black/40 uppercase tracking-wide mb-4">
            Missed questions ({missed.length})
          </h2>
          <div className="space-y-4">
            {missed.map((q) => (
              <div key={q.id} className="border border-black/10 rounded-xl p-5">
                <p className="text-xs text-black/30 mb-1">{q.section}</p>
                <p className="font-medium mb-3">{q.question}</p>
                <p className="text-sm text-red-500 mb-1">
                  Your answer: {q.selectedAnswer ? `${q.selectedAnswer}. ${q.choices[q.selectedAnswer]}` : '—'}
                </p>
                <p className="text-sm text-green-600">
                  Correct answer: {q.correctAnswer}. {q.choices[q.correctAnswer]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
