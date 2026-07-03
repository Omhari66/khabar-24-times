import { ZodError, ZodSchema, z } from "zod";
import { BadRequestError } from "@/lib/errors";
import { normalizeSlug, sanitizeString } from "@/lib/api/sanitize";

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => issue.message).join(", ");
}

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new BadRequestError("Invalid JSON request body");
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestError(formatZodError(error));
    }

    throw error;
  }
}

export function parseInput<T>(input: unknown, schema: ZodSchema<T>) {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestError(formatZodError(error));
    }

    throw error;
  }
}

export const requiredTrimmedString = (message: string) =>
  z
    .string(message)
    .transform((value) => sanitizeString(value))
    .refine((value) => value.length > 0, { message });

export const optionalTrimmedString = () =>
  z
    .string("Expected a string")
    .transform((value) => sanitizeString(value))
    .optional();

export const requiredSlugString = (message: string) =>
  z
    .string(message)
    .transform((value) => normalizeSlug(value))
    .refine((value) => value.length > 0, { message });
