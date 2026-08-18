import { z } from "zod";

const nameField = (label) =>
    z
        .string({ error: `${label} is required` })
        .trim()
        .min(2, `${label} must be at least 2 characters`)
        .max(100, `${label} must not exceed 100 characters`);

const middleName = z
    .string()
    .trim()
    .max(100, "Middle name must not exceed 100 characters")
    .optional()
    .or(z.literal(""));

const username = z
    .string({ error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
    );

const email = z
    .string({ error: "Email is required" })
    .email("Invalid email format");

const contactNumber = z
    .string({ error: "Contact number is required" })
    .trim()
    .length(11, "Contact number must be exactly 11 characters")
    .regex(
        /^[0-9+\-\s]+$/,
        "Contact number can only contain digits, spaces, + and -",
    );

const address = z
    .string({ error: "Address is required" })
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address must not exceed 255 characters");

const password = z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters");

const association = z
    .string()
    .trim()
    .min(2, "Association must be at least 2 characters")
    .max(100, "Association must not exceed 100 characters")
    .optional();

const assignedFarmers = z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmer id"))
    .optional();

const fileItem = z.object({
    name: z.string().trim().min(1, "File name is required"),
    url: z.string().url("Invalid file URL"),
    type: z.enum(["image", "pdf", "document"]).optional(),
    size: z.number().nonnegative().optional(),
});

const files = z.array(fileItem).optional();

const personalFields = {
    lastName: nameField("Last name"),
    firstName: nameField("First name"),
    middleName,
    username,
    email,
    contactNumber,
    address,
    password,
};

export const createManagerSchema = z.object({
    ...personalFields,
    association: z
        .string({ error: "Association Name is required" })
        .trim()
        .min(2, "Association must be at least 2 characters")
        .max(100, "Association must not exceed 100 characters"),
    assignedFarmers,
    files,
});

export const createFarmerSchema = z.object({
    ...personalFields,
    files: files.optional().refine(
        (value) => (value ?? []).length > 0,
        "Please attach at least one file",
    ),
});

export const updateUserSchema = z
    .object({
        lastName: nameField("Last name").optional(),
        firstName: nameField("First name").optional(),
        middleName,
        username: username.optional(),
        email: email.optional(),
        contactNumber: contactNumber.optional(),
        address: address.optional(),
        password: password.optional(),
        association,
        assignedFarmers,
        files,
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const getFieldErrors = (error) => {
    const errors = {};

    for (const issue of error.issues) {
        const field = issue.path[0] ?? "form";
        if (!errors[field]) errors[field] = issue.message;
    }

    return errors;
};
