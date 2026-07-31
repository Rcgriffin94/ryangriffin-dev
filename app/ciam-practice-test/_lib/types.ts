export type Letter = 'A' | 'B' | 'C' | 'D';

export type Choices = Record<Letter, string>;

export type Question = {
  id: number;
  section: string;
  question: string;
  choices: Choices;
  answer: Letter;
};

export type QuizQuestion = Omit<Question, 'answer'>;

export type GradedQuestion = {
  id: number;
  section: string;
  question: string;
  choices: Choices;
  correctAnswer: Letter;
  selectedAnswer: Letter | null;
  isCorrect: boolean;
};

export type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  results: GradedQuestion[];
};
