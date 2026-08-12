import z from "zod";
import { Location, PropertyType, Status } from "../types";

export const propertySchema = z.object({
  title: z.string(),
  ref: z.string(),
  description: z.string(),
  price: z.number().gte(1),
  propertyType: z.enum(PropertyType),
  location: z.enum(Location),
  area: z.number().gte(1),
  status: z.enum(Status),
  images: z.array(z.string()).min(1).max(5),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor: z.number().optional(),
  parking: z.boolean(),
});

export const searchParamsSchema = z.object({
  location: z.union([z.enum(Location), z.literal("none")]).optional(),
  type: z.union([z.enum(PropertyType), z.literal("none")]).optional(),
});

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);