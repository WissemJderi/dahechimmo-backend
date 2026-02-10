import { Router } from "express";
import propertiesService from "../services/propertiesService";
import { cloudinary, upload } from "../config/cloudinary";
import authService from "../services/authService";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/env";
import { getPublicIdFromUrl } from "../utils";
import z from "zod";
import { Location, PropertyType, Status } from "../types";
const propertiesRouter = Router();

propertiesRouter.get("/", async (_req, res, next) => {
  try {
    const result = await propertiesService.getProperties();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.get("/search", async (req, res, next) => {
  try {
    const { location, type } = req.query;

    if (typeof location !== "string" || typeof type !== "string") {
      res.status(400).json({ message: "Invalid query parameters" });
      return;
    }

    const result = await propertiesService.searchProperties(location, type);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.post(
  "/",
  upload.array("images", 5), // Back to cloudinary upload
  async (req, res, next) => {
    const token = authService.getTokenFrom(req);
    if (!token) {
      res.status(401).json({ error: "token missing" });
      return;
    }

    try {
      jwt.verify(token, SECRET);

      const imageUrls =
        (req.files as Express.Multer.File[])?.map((file: any) => file.path) ||
        [];

      if (imageUrls.length === 0) {
        res.status(400).json({ error: "At least one image is required" });
        return;
      }

      const newPropertySchema = z.object({
        title: z.string(),
        ref: z.string(),
        description: z.string(),
        price: z.number().gte(1),
        propertyType: z.enum(PropertyType),
        location: z.enum(Location),
        area: z.number().gte(1),
        status: z.enum(Status),
        images: z.array(z.string()).check(z.minLength(1), z.maxLength(5)),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        floor: z.number().optional(),
        parking: z.boolean(),
      });

      const propertyData = newPropertySchema.parse({
        title: req.body.title,
        ref: req.body.ref,
        description: req.body.description,
        price: Number(req.body.price),
        propertyType: req.body.propertyType,
        location: req.body.location,
        area: Number(req.body.area),
        status: req.body.status,
        images: imageUrls,
        bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
        bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
        floor: req.body.floor ? Number(req.body.floor) : undefined,
        parking: req.body.parking === "true",
      });

      console.log("Property data:", propertyData);

      const newProperty = await propertiesService.addProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).send({ error: error.issues });
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: "token expired" });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: "invalid token" });
        return;
      }
      next(error);
    }
  },
);
propertiesRouter.get("/:id", async (req, res, next): Promise<void> => {
  try {
    const property = await propertiesService.getProperty(req.params.id);
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProperty = await propertiesService.updateProperty(
      req.params.id,
      req.body,
    );
    if (!updatedProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.delete("/:id", async (req, res, next) => {
  const token = authService.getTokenFrom(req);

  if (!token) {
    res.status(401).json({ error: "token missing" });
    return;
  }

  try {
    jwt.verify(token, SECRET);

    const property = await propertiesService.getProperty(req.params.id);

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const deleteImagePromises = property.images.map((imageUrl) => {
      const publicId = getPublicIdFromUrl(imageUrl);
      console.log("Deleting from Cloudinary:", publicId);
      return cloudinary.uploader.destroy(publicId);
    });

    await Promise.all(deleteImagePromises);
    const deletedProperty = await propertiesService.deleteProperty(
      req.params.id,
    );

    res.json({
      message: "Property and images deleted successfully",
      deletedProperty,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "invalid token" });
      return;
    }
    next(error);
  }
});

export default propertiesRouter;
