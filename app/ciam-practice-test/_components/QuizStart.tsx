export default function QuizStart({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="text-center pt-16">
      <h1 className="text-3xl font-bold tracking-tight mb-3">CIAM Practice Test</h1>
      <p className="text-black/40 text-sm mb-10 max-w-md mx-auto leading-relaxed">
        100 randomly selected multiple-choice questions from the CIAM study guide
        question bank. Answer them all, then submit to see your score and review
        anything you missed.
      </p>
      <button
        onClick={onStart}
        disabled={loading}
        className="bg-[#111111] text-white rounded-xl px-8 py-3 text-sm font-medium shadow-sm hover:bg-black/80 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Start quiz'}
      </button>
    </div>
  );
}
