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
const zod_1 = __importDefault(require("zod"));
const types_1 = require("../types");
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
        const { location, type } = req.query;
        if (typeof location !== "string" || typeof type !== "string") {
            res.status(400).json({ message: "Invalid query parameters" });
            return;
        }
        const result = yield propertiesService_1.default.searchProperties(location, type);
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
        const imageUrls = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path)) ||
            [];
        if (imageUrls.length === 0) {
            res.status(400).json({ error: "At least one image is required" });
            return;
        }
        const newPropertySchema = zod_1.default.object({
            title: zod_1.default.string(),
            ref: zod_1.default.string(),
            description: zod_1.default.string(),
            price: zod_1.default.number().gte(1),
            propertyType: zod_1.default.enum(types_1.PropertyType),
            location: zod_1.default.enum(types_1.Location),
            area: zod_1.default.number().gte(1),
            status: zod_1.default.enum(types_1.Status),
            images: zod_1.default.array(zod_1.default.string()).check(zod_1.default.minLength(1), zod_1.default.maxLength(5)),
            bedrooms: zod_1.default.number().optional(),
            bathrooms: zod_1.default.number().optional(),
            floor: zod_1.default.number().optional(),
            parking: zod_1.default.boolean(),
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
        const newImageUrls = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path)) ||
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
        const deletedImages = existingProperty.images.filter((img) => !existingImages.includes(img));
        // Delete removed images from Cloudinary
        if (deletedImages.length > 0) {
            const deletePromises = deletedImages.map((imageUrl) => {
                const publicId = (0, utils_1.getPublicIdFromUrl)(imageUrl);
                console.log("Deleting old image:", publicId);
                return cloudinary_1.cloudinary.uploader.destroy(publicId);
            });
            yield Promise.all(deletePromises);
        }
        // Build update data with Zod validation
        const updatePropertySchema = zod_1.default.object({
            title: zod_1.default.string(),
            ref: zod_1.default.string(),
            description: zod_1.default.string(),
            price: zod_1.default.number().gte(1),
            propertyType: zod_1.default.enum(types_1.PropertyType),
            location: zod_1.default.enum(types_1.Location),
            area: zod_1.default.number().gte(1),
            status: zod_1.default.enum(types_1.Status),
            images: zod_1.default.array(zod_1.default.string()).min(1).max(5),
            bedrooms: zod_1.default.number().optional(),
            bathrooms: zod_1.default.number().optional(),
            floor: zod_1.default.number().optional(),
            parking: zod_1.default.boolean(),
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
