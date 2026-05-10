export function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ");
}
export function isAnswerCorrect(submittedAnswer, correctAnswer, acceptableAnswers) {
    const normalizedSubmission = normalizeAnswer(submittedAnswer);
    const validAnswers = [
        correctAnswer,
        ...acceptableAnswers
    ].map(normalizeAnswer);
    return validAnswers.includes(normalizedSubmission);
}
export function calculatePoints(basePoints, isCorrect, responseTimeMs, timeLimitSeconds) {
    if (!isCorrect)
        return 0;
    const timeLimitMs = timeLimitSeconds * 1000;
    const remainingRatio = Math.max(0, (timeLimitMs - responseTimeMs) / timeLimitMs);
    const speedBonus = Math.round(basePoints * 0.5 * remainingRatio);
    return basePoints + speedBonus;
}
