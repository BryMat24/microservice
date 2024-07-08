import { z } from "zod";

export const jwtPayloadSchema = z.object({
    id: z.number(),
    email: z.string().email(),
});
