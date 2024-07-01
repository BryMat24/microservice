import { z } from "zod";

export const userSchema = z.object({
    name: z
        .string()
        .trim()
        .min(5, { message: "minimum name length is 5" })
        .max(20, { message: "maximum name length is 20" }),
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "minimum password length is 8" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
            message:
                "password need to include atlease a uppercase, lowercase and number",
        }),
});
