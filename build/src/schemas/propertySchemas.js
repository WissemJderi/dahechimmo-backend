"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectIdSchema = exports.searchParamsSchema = exports.propertySchema = void 0;
const zod_1 = __importDefault(require("zod"));
const types_1 = require("../types");
exports.propertySchema = zod_1.default.object({
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
exports.searchParamsSchema = zod_1.default.object({
    location: zod_1.default.union([zod_1.default.enum(types_1.Location), zod_1.default.literal("none")]).optional(),
    type: zod_1.default.union([zod_1.default.enum(types_1.PropertyType), zod_1.default.literal("none")]).optional(),
});
exports.objectIdSchema = zod_1.default.string().regex(/^[0-9a-fA-F]{24}$/);
