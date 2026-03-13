import { Request, Router } from "express";
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

      const newProperty = await propertiesService.addProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).send({ error: error.issues });
        return;
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

propertiesRouter.put(
  "/:id",
  upload.array("images", 5), // Allow new images
  async (req: Request<{ id: string }>, res, next) => {
    const token = authService.getTokenFrom(req);

    if (!token) {
      res.status(401).json({ error: "token missing" });
      return;
    }

    try {
      jwt.verify(token, SECRET);

      // Get existing property
      const existingProperty = await propertiesService.getProperty(
        req.params.id,
      );

      if (!existingProperty) {
        res.status(404).json({ error: "Property not found" });
        return;
      }

      // Handle new images if uploaded
      const newImageUrls =
        (req.files as Express.Multer.File[])?.map((file: any) => file.path) ||
        [];

      // Parse existing images from request body (if frontend sends them)
      const existingImages = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : existingProperty.images;

      // Combine existing + new images
      const allImages = [...existingImages, ...newImageUrls];

      // Validate max 5 images
      if (allImages.length > 5) {
        res.status(400).json({ error: "Maximum 5 images allowed" });
        return;
      }

      // Find deleted images (were in DB but not in request)
      const deletedImages = existingProperty.images.filter(
        (img) => !existingImages.includes(img),
      );

      // Delete removed images from Cloudinary
      if (deletedImages.length > 0) {
        const deletePromises = deletedImages.map((imageUrl) => {
          const publicId = getPublicIdFromUrl(imageUrl);
          console.log("Deleting old image:", publicId);
          return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);
      }

      // Build update data with Zod validation
      const updatePropertySchema = z.object({
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

      const propertyData = updatePropertySchema.parse({
        title: req.body.title,
        ref: req.body.ref,
        description: req.body.description,
        price: Number(req.body.price),
        propertyType: req.body.propertyType,
        location: req.body.location,
        area: Number(req.body.area),
        status: req.body.status,
        images: allImages,
        bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
        bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
        floor: req.body.floor ? Number(req.body.floor) : undefined,
        parking: req.body.parking === "true",
      });

      const updatedProperty = await propertiesService.updateProperty(
        req.params.id,
        propertyData,
      );

      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
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

export default propertiesRouter;
