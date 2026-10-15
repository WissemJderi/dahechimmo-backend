import z from "zod";
import { Location, PropertyType, Status } from "../types";

export const propertySchema = z.object({
  title: z.string().trim().min(1).max(200),
  ref: z.string().trim().min(1).max(50),
  description: z.string().min(1).max(5000),
  price: z.number().gte(1).lte(1_000_000_000),
  propertyType: z.enum(PropertyType),
  location: z.enum(Location),
  area: z.number().gte(1).lte(1_000_000),
  status: z.enum(Status),
  images: z.array(z.string().max(1000)).min(1).max(5),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  floor: z.number().int().min(-10).max(200).optional(),
  parking: z.boolean(),
});

export const searchParamsSchema = z.object({
  location: z.union([z.enum(Location), z.literal("none")]).optional(),
  type: z.union([z.enum(PropertyType), z.literal("none")]).optional(),
});

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const pageParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(16),
});