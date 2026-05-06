import { z } from "zod";

/** Stable identifier. Recommended pattern: lowercase alphanumeric + dashes. */
export const Id = z.string().min(1, "id cannot be empty");

/** ISO 8601 datetime string. */
export const Iso8601 = z.string().datetime();

/** CSS color string (hex / hsl / rgb / named). Stored as-is. */
export const CssColor = z.string().min(1);

/** Markdown content (CommonMark + GFM). Sanitized at render time. */
export const Markdown = z.string();

/** ISO 639-1 language code (e.g. "ko", "en"). */
export const LanguageCode = z.string().min(2).max(8);
