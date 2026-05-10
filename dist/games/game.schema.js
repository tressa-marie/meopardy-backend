import { z } from "zod";
export const importGameSchema = z.object({
    title: z.string().min(1),
    rounds: z.array(z.object({
        name: z.string().min(1),
        categories: z.array(z.object({
            name: z.string().min(1),
            clues: z.array(z.object({
                question: z.string().min(1),
                correctAnswer: z.string().min(1),
                acceptableAnswers: z.array(z.string()).default([]),
                basePoints: z.number().int().positive(),
                timeLimitSeconds: z.number().int().positive().default(20)
            }))
        }))
    }))
});
