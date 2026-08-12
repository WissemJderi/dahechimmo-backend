"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertiesService_1 = __importDefault(require("../services/propertiesService"));
const cloudinary_1 = require("../config/cloudinary");
const authService_1 = __importDefault(require("../services/authService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const utils_1 = require("../utils");
const propertySchemas_1 = require("../schemas/propertySchemas");
const zod_1 = __importDefault(require("zod"));
const propertiesRouter = (0, express_1.Router)();
propertiesRouter.get("/", (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield propertiesService_1.default.getProperties();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
propertiesRouter.get("/search", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = propertySchemas_1.searchParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid query parameters" });
            return;
        }
        const result = yield propertiesService_1.default.searchProperties(parsed.data);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
propertiesRouter.post("/", cloudinary_1.upload.array("images", 5), // Back to cloudinary upload
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = authService_1.default.getTokenFrom(req);
    if (!token) {
        res.status(401).json({ error: "token missing" });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, env_1.SECRET);
        const imageUrls = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path)) || [];
        if (imageUrls.length === 0) {
            res.status(400).json({ error: "At least one image is required" });
            return;
        }
        const body = req.body;
        const propertyData = propertySchemas_1.propertySchema.parse({
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
        const newProperty = yield propertiesService_1.default.addProperty(propertyData);
        res.status(201).json(newProperty);
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).send({ error: error.issues });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "invalid token" });
            return;
        }
        next(error);
    }
}));
propertiesRouter.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!propertySchemas_1.objectIdSchema.safeParse(req.params.id).success) {
        res.status(400).json({ error: "Invalid property id" });
        return;
    }
    try {
        const property = yield propertiesService_1.default.getProperty(req.params.id);
        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }
        res.json(property);
    }
    catch (error) {
        next(error);
    }
}));
propertiesRouter.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!propertySchemas_1.objectIdSchema.safeParse(req.params.id).success) {
        res.status(400).json({ error: "Invalid property id" });
        return;
    }
    const token = authService_1.default.getTokenFrom(req);
    if (!token) {
        res.status(401).json({ error: "token missing" });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, env_1.SECRET);
        const property = yield propertiesService_1.default.getProperty(req.params.id);
        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }
        const deleteImagePromises = property.images.map((imageUrl) => {
            const publicId = (0, utils_1.getPublicIdFromUrl)(imageUrl);
            return cloudinary_1.cloudinary.uploader.destroy(publicId);
        });
        yield Promise.all(deleteImagePromises);
        const deletedProperty = yield propertiesService_1.default.deleteProperty(req.params.id);
        res.json({
            message: "Property and images deleted successfully",
            deletedProperty,
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "invalid token" });
            return;
        }
        next(error);
    }
}));
propertiesRouter.put("/:id", cloudinary_1.upload.array("images", 5), // Allow new images
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!propertySchemas_1.objectIdSchema.safeParse(req.params.id).success) {
        res.status(400).json({ error: "Invalid property id" });
        return;
    }
    const token = authService_1.default.getTokenFrom(req);
    if (!token) {
        res.status(401).json({ error: "token missing" });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, env_1.SECRET);
        // Get existing property
        const existingProperty = yield propertiesService_1.default.getProperty(req.params.id);
        if (!existingProperty) {
            res.status(404).json({ error: "Property not found" });
            return;
        }
        // Handle new images if uploaded
        const newImageUrls = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path)) || [];
        const body = req.body;
        // Parse existing images from request body (if frontend sends them)
        const rawExistingImages = body.existingImages;
        const existingImages = typeof rawExistingImages === "string"
            ? JSON.parse(rawExistingImages)
            : existingProperty.images;
        // Combine existing + new images
        const allImages = [...existingImages, ...newImageUrls];
        // Validate max 5 images
        if (allImages.length > 5) {
            res.status(400).json({ error: "Maximum 5 images allowed" });
            return;
        }
        // Find deleted images (were in DB but not in request)
        const deletedImages = existingProperty.images.filter((img) => !existingImages.includes(img));
        // Delete removed images from Cloudinary
        if (deletedImages.length > 0) {
            const deletePromises = deletedImages.map((imageUrl) => {
                const publicId = (0, utils_1.getPublicIdFromUrl)(imageUrl);
                return cloudinary_1.cloudinary.uploader.destroy(publicId);
            });
            yield Promise.all(deletePromises);
        }
        const propertyData = propertySchemas_1.propertySchema.parse({
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
        const updatedProperty = yield propertiesService_1.default.updateProperty(req.params.id, propertyData);
        res.json(updatedProperty);
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).json({ error: error.issues });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "invalid token" });
            return;
        }
        next(error);
    }
}));
exports.default = propertiesRouter;
