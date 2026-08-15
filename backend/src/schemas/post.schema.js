import { z } from "zod";

const objectId = (label) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

export const POST_TAGS = [
    "pruning",
    "harvesting",
    "processing",
    "soil",
    "advisory",
    "announcement",
];

const description = z
    .string({ error: "Description is required" })
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description must not exceed 5000 characters");

const tags = z
    .array(z.enum(POST_TAGS))
    .max(6, "A post can have at most 6 tags")
    .optional();

const imageUrls = z
    .array(z.string().url("Invalid image URL"))
    .max(10, "A post can have at most 10 images")
    .optional();

const mediaUrls = z
    .array(z.string().url("Invalid media URL"))
    .max(5, "A post can have at most 5 videos")
    .optional();

export const createPostSchema = z.object({
    description,
    tags,
    imageUrl: imageUrls,
    mediaUrl: mediaUrls,
});

export const updatePostSchema = z
    .object({
        description: description.optional(),
        tags: tags.optional(),
        imageUrl: imageUrls,
        mediaUrl: mediaUrls,
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const postIdParamSchema = z.object({
    id: objectId("post id"),
});

export const getPostsQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
});

const commentMessage = z
    .string({ error: "Comment is required" })
    .trim()
    .min(1, "Comment is required")
    .max(1000, "Comment must not exceed 1000 characters");

export const createCommentSchema = z.object({
    message: commentMessage,
});

export const updateCommentSchema = z
    .object({
        message: commentMessage.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export const commentIdParamSchema = z.object({
    id: objectId("post id"),
    commentId: objectId("comment id"),
});

export const getCommentsQuerySchema = z.object({
    all: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
});
