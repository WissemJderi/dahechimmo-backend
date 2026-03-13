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
const property_1 = __importDefault(require("../models/property"));
const getProperties = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield property_1.default.find({});
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch properties: ${error.message}`);
        }
        throw new Error("Failed to fetch properties due to unknown error");
    }
});
const addProperty = (propertyData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = new property_1.default(propertyData);
        return yield property.save();
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create property: ${error.message}`);
        }
        throw new Error("Failed to create property due to unknown error");
    }
});
const getProperty = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield property_1.default.findById(id);
        return property;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to find property: ${error.message}`);
        }
        throw new Error("Failed to create property due to unknown error");
    }
});
const updateProperty = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateProperty = yield property_1.default.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return updateProperty;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update property: ${error.message}`);
        }
        throw new Error("Failed to update property due to unknown error");
    }
});
const deleteProperty = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedProperty = yield property_1.default.findByIdAndDelete(id);
        return deletedProperty;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete property: ${error.message}`);
        }
        throw new Error("Failed to delete property due to unknown error");
    }
});
const searchProperties = (location, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (location === "none") {
            const properties = yield property_1.default.find({ propertyType: type });
            return properties;
        }
        else {
            const properties = yield property_1.default.find({
                location: location,
                propertyType: type,
            });
            return properties;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete property: ${error.message}`);
        }
        throw new Error("Failed to delete property due to unknown error");
    }
});
exports.default = {
    getProperties,
    addProperty,
    getProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
};
