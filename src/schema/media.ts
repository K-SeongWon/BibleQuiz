import { z } from "zod";

export const MediaPlacement = z.enum(["stage", "pad", "both", "explanation"]).default("both");

const MediaUrl = z
  .string()
  .min(1)
  .refine((v) => v.startsWith("https://") || v.startsWith("data:"), {
    message: "media url must start with https:// or data:",
  });

const ImageMedia = z.object({
  type: z.literal("image"),
  url: MediaUrl,
  alt: z.string().optional(),
  caption: z.string().optional(),
  placement: MediaPlacement,
});

const AudioMedia = z.object({
  type: z.literal("audio"),
  url: MediaUrl,
  autoPlay: z.boolean().default(false),
  controls: z.boolean().default(true),
  placement: MediaPlacement,
});

const VideoMedia = z.object({
  type: z.literal("video"),
  url: MediaUrl,
  poster: MediaUrl.optional(),
  loop: z.boolean().default(false),
  autoPlay: z.boolean().default(false),
  controls: z.boolean().default(true),
  placement: MediaPlacement,
});

const YouTubeMedia = z.object({
  type: z.literal("youtube"),
  videoId: z.string().min(1),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().positive().optional(),
  placement: MediaPlacement,
});

export const MediaAttachment = z.discriminatedUnion("type", [
  ImageMedia,
  AudioMedia,
  VideoMedia,
  YouTubeMedia,
]);

export type MediaAttachment = z.infer<typeof MediaAttachment>;
