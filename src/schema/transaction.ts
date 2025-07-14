import { z } from "zod";

export const CreateTransactionSchema = z.object({
    // amount: z.coerce.number().positive().multipleOf(0.01),
    amount: z.number().positive().multipleOf(0.01),
    description: z.string().optional(),
    // date: z.coerce.date(),
    date: z.date(),
    category: z.string(),
    type: z.union([z.literal("income"), z.literal("expense")]),
});

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;
export type CreateTransactionSchemaInput = z.input<typeof CreateTransactionSchema>;
export type CreateTransactionSchemaOutput = z.output<typeof CreateTransactionSchema>;