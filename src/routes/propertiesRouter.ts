import { Request, Router } from "express";
import propertiesService from "../services/propertiesService";
import { cloudinary, upload } from "../config/cloudinary";
import authService from "../services/authService";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/env";
import { getPublicIdFromUrl } from "../utils";
import {
  objectIdSchema,
  propertySchema,
  searchParamsSchema,
} from "../schemas/propertySchemas";
import z from "zod";

type PropertyFormBody = Record<string, unknown>;

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
    const parsed = searchParamsSchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const result = await propertiesService.searchProperties(parsed.data);
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
        (req.files as Express.Multer.File[])?.map((file) => file.path) || [];

      if (imageUrls.length === 0) {
        res.status(400).json({ error: "At least one image is required" });
        return;
      }

      const body = req.body as PropertyFormBody;

      const propertyData = propertySchema.parse({
        title: body.title,
        ref: body.ref,
        description: body.description,
        price: Number(body.price),
        propertyType: body.propertyType,
        location: body.location,
        area: Number(body.area),
        status: body.status,
        images: imageUrls,
        bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
        floor: body.floor ? Number(body.floor) : undefined,
        parking: body.parking === "true",
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
  if (!objectIdSchema.safeParse(req.params.id).success) {
    res.status(400).json({ error: "Invalid property id" });
    return;
  }

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
  if (!objectIdSchema.safeParse(req.params.id).success) {
    res.status(400).json({ error: "Invalid property id" });
    return;
  }

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
    if (!objectIdSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "Invalid property id" });
      return;
    }

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
        (req.files as Express.Multer.File[])?.map((file) => file.path) || [];

      const body = req.body as PropertyFormBody;

      // Parse existing images from request body (if frontend sends them)
      const rawExistingImages = body.existingImages;
      const existingImages: string[] =
        typeof rawExistingImages === "string"
          ? (JSON.parse(rawExistingImages) as string[])
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
          return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);
      }

      const propertyData = propertySchema.parse({
        title: body.title,
        ref: body.ref,
        description: body.description,
        price: Number(body.price),
        propertyType: body.propertyType,
        location: body.location,
        area: Number(body.area),
        status: body.status,
        images: allImages,
        bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
        floor: body.floor ? Number(body.floor) : undefined,
        parking: body.parking === "true",
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
