import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const attachmentItem = z.object({
    name: z.string().trim().min(1, "File name is required"),
    url: z.string().url("Invalid file URL"),
    type: z.enum(["image", "pdf", "document"]).optional(),
    size: z.number().nonnegative().optional(),
});

export const chatIdParamSchema = z.object({
    id: objectId("association id"),
});

export const messageIdParamSchema = z.object({
    id: objectId("association id"),
    messageId: objectId("message id"),
});

export const getChatMessagesQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
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
