import { z } from "zod";

const attachmentItem = z.object({
    name: z.string().trim().min(1, "File name is required"),
    url: z.string().url("Invalid file URL"),
    type: z.enum(["image", "pdf", "document"]).optional(),
    size: z.number().nonnegative().optional(),
});

export const sendMessageSchema = z
    .object({
        text: z
            .string()
            .trim()
            .max(2000, "Message must not exceed 2000 characters")
            .optional(),
        attachments: z.array(attachmentItem).optional(),
    })
    .refine(
        (data) =>
            (data.text?.trim().length ?? 0) > 0 ||
            (data.attachments?.length ?? 0) > 0,
        { message: "Message text or an attachment is required" },
    );

export const updateMessageSchema = z
    .object({
        text: z
            .string()
            .trim()
            .max(2000, "Message must not exceed 2000 characters")
            .optional(),
        attachments: z.array(attachmentItem).optional(),
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
