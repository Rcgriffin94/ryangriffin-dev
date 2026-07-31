'use server';

import { getAllQuestions } from './questions';
import type { GradedQuestion, Letter, QuizQuestion, QuizResult } from './types';

const QUIZ_LENGTH = 100;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function startQuiz(): Promise<QuizQuestion[]> {
  const selected = shuffle(getAllQuestions()).slice(0, QUIZ_LENGTH);
  return selected.map(({ answer: _answer, ...rest }) => rest);
}

export async function gradeQuiz(answers: Record<number, Letter | null>): Promise<QuizResult> {
  const byId = new Map(getAllQuestions().map((q) => [q.id, q]));
  const results: GradedQuestion[] = [];
  let score = 0;

  for (const [idStr, selectedAnswer] of Object.entries(answers)) {
    const question = byId.get(Number(idStr));
    if (!question) continue;

    const isCorrect = selectedAnswer === question.answer;
    if (isCorrect) score++;

    results.push({
      id: question.id,
      section: question.section,
      question: question.question,
      choices: question.choices,
      correctAnswer: question.answer,
      selectedAnswer,
      isCorrect,
    });
  }

  return {
    score,
    total: results.length,
    percentage: results.length > 0 ? Math.round((score / results.length) * 100) : 0,
    results,
  };
}
