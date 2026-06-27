import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string({
            required_error: "Email is required",
        })
        .email("Invalid email format"),
    password: z
        .string({
            required_error: "Password is required",
        })
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters"),
});

export const registerSchema = z
    .object({
        fullname: z
            .string({ required_error: "Full name is required" })
            .min(2, "Name must be at least 2 characters"),
        email: z
            .string({ required_error: "Email is required" })
            .email("Invalid email format"),
        password: z
            .string({ required_error: "Password is required" })
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must not exceed 100 characters"),
        confirmPassword: z.string({
            required_error: "Please confirm your password",
        }),
        role: z.enum(["buyer", "farmer"], {
            required_error: "Please select an account type",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });