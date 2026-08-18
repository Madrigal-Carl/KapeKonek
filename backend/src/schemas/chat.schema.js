import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // images
const MAX_FILE_BYTES = 20 * 1024 * 1024; // pdfs, documents, videos

const attachmentItem = z
    .object({
        name: z.string().trim().min(1, "File name is required"),
        url: z.string().url("Invalid file URL"),
        type: z.enum(["image", "pdf", "document", "video"]).optional(),
        size: z.number().nonnegative().optional(),
    })
    .refine(
        (attachment) =>
            attachment.size == null ||
            (attachment.type === "image"
                ? attachment.size <= MAX_IMAGE_BYTES
                : attachment.size <= MAX_FILE_BYTES),
        (attachment) => ({
            message: `"${attachment.name}" exceeds the ${
                attachment.type === "image" ? "5 MB" : "20 MB"
            } size limit`,
        }),
    );

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

export const toggleReactionSchema = z.object({
    emoji: z
        .string({ error: "Reaction is required" })
        .trim()
        .min(1, "Reaction is required")
        .max(32, "Reaction must not exceed 32 characters"),
});
