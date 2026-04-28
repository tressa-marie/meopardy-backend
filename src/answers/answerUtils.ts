export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

export function isAnswerCorrect(
  submittedAnswer: string,
  correctAnswer: string,
  acceptableAnswers: string[]
): boolean {
  const normalizedSubmission = normalizeAnswer(submittedAnswer);

  const validAnswers = [
    correctAnswer,
    ...acceptableAnswers
  ].map(normalizeAnswer);

  return validAnswers.includes(normalizedSubmission);
}

export function calculatePoints(
  basePoints: number,
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitSeconds: number
): number {
  if (!isCorrect) return 0;

  const timeLimitMs = timeLimitSeconds * 1000;
  const remainingRatio = Math.max(0, (timeLimitMs - responseTimeMs) / timeLimitMs);

  const speedBonus = Math.round(basePoints * 0.5 * remainingRatio);

  return basePoints + speedBonus;
}