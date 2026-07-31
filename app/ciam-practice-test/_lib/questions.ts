import fs from 'node:fs';
import path from 'node:path';
import { parseCsv } from './csv';
import type { Letter, Question } from './types';

let cache: Question[] | null = null;

export function getAllQuestions(): Question[] {
  if (cache) return cache;

  const filePath = path.join(process.cwd(), 'app/ciam-practice-test/_lib/questions.csv');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const [, ...dataRows] = parseCsv(raw);

  cache = dataRows.map((row) => {
    const [id, section, question, a, b, c, d, answer] = row;
    return {
      id: Number(id),
      section,
      question,
      choices: { A: a, B: b, C: c, D: d },
      answer: answer.trim() as Letter,
    };
  });

  return cache;
}
