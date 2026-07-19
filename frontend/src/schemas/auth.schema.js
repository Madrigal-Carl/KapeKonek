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
        lastName: z
            .string({ required_error: "Last name is required" })
            .min(2, "Last name must be at least 2 characters"),
        firstName: z
            .string({ required_error: "First name is required" })
            .min(2, "First name must be at least 2 characters"),
        middleName: z.string().optional(),
        username: z
            .string({ required_error: "Username is required" })
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        email: z
            .string({ required_error: "Email is required" })
            .email("Invalid email format"),
        contactNumber: z
            .string({ required_error: "Contact number is required" })
            .min(10, "Contact number must be at least 10 digits")
            .max(15, "Contact number must not exceed 15 digits")
            .regex(
                /^[0-9+\-\s]+$/,
                "Contact number can only contain digits, spaces, + and -",
            ),
        address: z
            .string({ required_error: "Address is required" })
            .min(5, "Address must be at least 5 characters"),
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