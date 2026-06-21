import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required"),
});

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    displayName: z
        .string()
        .trim()
        .min(2, "Display name must be at least 2 characters")
        .max(60, "Display name must be at most 60 characters"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[0-9]/, "Password must include at least one number"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export function getFirstZodError(error: z.ZodError): string {
    return error.issues[0]?.message ?? "Invalid form data";
}