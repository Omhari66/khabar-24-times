import { InternalServerError } from "@/lib/errors";

export class ConfigError extends InternalServerError {
  constructor(message: string, readonly key: string) {
    super(message, { key });
    this.name = "ConfigError";
  }
}

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
const CLOUDINARY_UPLOAD_FOLDER = "news-portal";
const PLACEHOLDER_VALUES = new Set(["mock-cloud-name", "mock-api-key", "mock-api-secret"]);

type NodeEnv = "development" | "test" | "production";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value || PLACEHOLDER_VALUES.has(value)) {
    throw new ConfigError(`${name} is not configured`, name);
  }

  return value;
}

function resolveNodeEnv(): NodeEnv {
  const value = readEnv("NODE_ENV");

  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}

export const appConfig = {
  nodeEnv: resolveNodeEnv(),
  databaseUrl: readEnv("DATABASE_URL") ?? DEFAULT_DATABASE_URL,
  cloudinaryUploadFolder: CLOUDINARY_UPLOAD_FOLDER,
};

export function getCloudinaryConfig() {
  return {
    cloudName: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
    folder: appConfig.cloudinaryUploadFolder,
  };
}
