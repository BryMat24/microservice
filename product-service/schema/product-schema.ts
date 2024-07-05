import { z } from "zod";

export const querySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => {
            return !isNaN(Number(val)) && Number(val) > 0 ? Number(val) : 1;
        }),

    category: z.string().optional(),
});
