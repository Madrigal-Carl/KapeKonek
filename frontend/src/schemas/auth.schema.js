import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters"),
});

export const registerSchema = z
    .object({
        lastName: z
            .string({ error: "Last name is required" })
            .trim()
            .min(2, "Last name must be at least 2 characters")
            .max(100, "Last name must not exceed 100 characters"),
        firstName: z
            .string({ error: "First name is required" })
            .trim()
            .min(2, "First name must be at least 2 characters")
            .max(100, "First name must not exceed 100 characters"),
        middleName: z
            .string()
            .trim()
            .max(100, "Middle name must not exceed 100 characters")
            .optional()
            .or(z.literal("")),
        username: z
            .string({ error: "Username is required" })
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        email: z
            .string({ error: "Email is required" })
            .email("Invalid email format"),
        contactNumber: z
            .string({ error: "Contact number is required" })
            .trim()
            .length(11, "Contact number must be exactly 11 characters")
            .regex(
                /^[0-9+\-\s]+$/,
                "Contact number can only contain digits, spaces, + and -",
            ),
        address: z
            .string({ error: "Address is required" })
            .trim()
            .min(5, "Address must be at least 5 characters")
            .max(255, "Address must not exceed 255 characters"),
        password: z
            .string({ error: "Password is required" })
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must not exceed 100 characters"),
        confirmPassword: z.string({
            error: "Please confirm your password",
        }),
        role: z.enum(["buyer", "farmer"], {
            error: "Please select an account type",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });