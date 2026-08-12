import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "is required"),
  CLOUDINARY_NAME: z.string().min(1, "is required"),
  API_KEY: z.string().min(1, "is required"),
  API_SECRET: z.string().min(1, "is required"),
  JWT_SECRET: z.string().min(1, "is required"),
  ADMIN: z.string().min(1, "is required"),
  PASSWORD: z.string().min(1, "is required"),
  PORT: z.coerce.number().int().positive().default(3001),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = Object.entries(result.error.flatten().fieldErrors)
    .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(", ")}`)
    .join("\n");
  console.error(`Invalid or missing environment variables:\n${issues}`);
  process.exit(1);
}

export const MONGODB_URI = result.data.MONGODB_URI;
export const PORT = result.data.PORT;
export const CLOUDINARY_NAME = result.data.CLOUDINARY_NAME;
export const API_KEY = result.data.API_KEY;
export const API_SECRET = result.data.API_SECRET;
export const SECRET = result.data.JWT_SECRET;
export const PASSWORD = result.data.PASSWORD;
export const ADMIN = result.data.ADMIN;