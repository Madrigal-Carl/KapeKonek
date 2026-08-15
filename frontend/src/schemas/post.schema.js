import { z } from "zod";

export const POST_TAGS = [
  "pruning",
  "harvesting",
  "processing",
  "soil",
  "advisory",
  "announcement",
];

export const POST_TAG_OPTIONS = POST_TAGS.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

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

const videoUrls = z
  .array(z.string().url("Invalid video URL"))
  .max(5, "A post can have at most 5 videos")
  .optional();

export const createPostSchema = z.object({
  description,
  tags,
  imageUrl: imageUrls,
  mediaUrl: videoUrls,
});

export const updatePostSchema = z
  .object({
    description: description.optional(),
    tags: tags.optional(),
    imageUrl: imageUrls,
    mediaUrl: videoUrls,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createCommentSchema = z.object({
  message: z
    .string({ error: "Comment is required" })
    .trim()
    .min(1, "Comment is required")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export const updateCommentSchema = z.object({
  message: z
    .string({ error: "Comment is required" })
    .trim()
    .min(1, "Comment is required")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export const getFieldErrors = (error) => {
  const errors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] ?? "form";
    if (!errors[field]) errors[field] = issue.message;
  }

  return errors;
};
