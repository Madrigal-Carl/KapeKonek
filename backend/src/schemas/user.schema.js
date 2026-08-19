import { z } from "zod";

const requiredName = (label) =>
    z
        .string({ error: `${label} is required` })
        .trim()
        .min(2, `${label} must be at least 2 characters`)
        .max(100, `${label} must not exceed 100 characters`);

const assignedFarmers = z
    .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmer id"),
    )
    .optional();

const fileItem = z.object({
    name: z
        .string()
        .trim()
        .min(1, "File name is required")
        .max(255, "File name must not exceed 255 characters"),
    url: z.string().url("Invalid file URL"),
    type: z.enum(["image", "pdf", "document"]).optional(),
    size: z.number().nonnegative().optional(),
});

export const createUserSchema = z
    .object({
        lastName: requiredName("Last name"),
        firstName: requiredName("First name"),
        middleName: z
            .string()
            .trim()
            .max(100, "Middle name must not exceed 100 characters")
            .optional(),
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
        role: z.enum(["buyer", "farmer", "manager", "dti", "kaluppa"], {
            error: "Please select an account type",
        }),
        association: z
            .string()
            .trim()
            .min(2, "Association must be at least 2 characters")
            .max(100, "Association must not exceed 100 characters")
            .optional(),
        assignedFarmers,
        files: z.array(fileItem).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.role === "farmer" && (!data.files || data.files.length === 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["files"],
                message: "At least one file is required for a farmer account",
            });
        }

        if (data.role === "manager" && !data.association) {
            ctx.addIssue({
                code: "custom",
                path: ["association"],
                message: "Association Name is required for manager accounts",
            });
        }
    });

export const updateUserSchema = z
    .object({
        lastName: requiredName("Last name").optional(),
        firstName: requiredName("First name").optional(),
        middleName: z
            .string()
            .trim()
            .max(100, "Middle name must not exceed 100 characters")
            .optional(),
        username: z
            .string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            )
            .optional(),
        email: z.string().email("Invalid email format").optional(),
        contactNumber: z
            .string()
            .trim()
            .length(11, "Contact number must be exactly 11 characters")
            .regex(
                /^[0-9+\-\s]+$/,
                "Contact number can only contain digits, spaces, + and -",
            )
            .optional(),
        address: z
            .string()
            .trim()
            .min(5, "Address must be at least 5 characters")
            .max(255, "Address must not exceed 255 characters")
            .optional(),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must not exceed 100 characters")
            .optional(),
        association: z
            .string()
            .trim()
            .min(2, "Association must be at least 2 characters")
            .max(100, "Association must not exceed 100 characters")
            .optional(),
        assignedFarmers,
        files: z.array(fileItem).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const userIdParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id"),
});

// A user updating their own basic profile. Whitelisted to safe, non-unique
// fields only (no email/username/role changes).
export const updateMyProfileSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, "First name is required")
            .max(100)
            .optional(),
        middleName: z.string().trim().max(100).optional(),
        lastName: z
            .string()
            .trim()
            .min(1, "Last name is required")
            .max(100)
            .optional(),
        contactNumber: z.string().trim().max(20).optional(),
        address: z
            .string()
            .trim()
            .min(1, "Address is required")
            .max(200)
            .optional(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const reviewAccountSchema = z.object({
    status: z.enum(["approved", "rejected"]),
    remarks: z
        .string()
        .trim()
        .max(500, "Remarks must not exceed 500 characters")
        .optional(),
});

export const reviewAssociationSchema = z.object({
    status: z.enum(["approved", "rejected"]),
    remarks: z
        .string()
        .trim()
        .max(500, "Remarks must not exceed 500 characters")
        .optional(),
});

export const getUsersQuerySchema = z.object({
    role: z.enum(["buyer", "farmer", "manager", "dti", "kaluppa"]).optional(),
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
});
