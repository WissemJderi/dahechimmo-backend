"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = __importDefault(require("../models/property"));
const getProperties = () => property_1.default.find({});
const addProperty = (propertyData) => {
    const property = new property_1.default(propertyData);
    return property.save();
};
const getProperty = (id) => property_1.default.findById(id);
const updateProperty = (id, data) => property_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteProperty = (id) => property_1.default.findByIdAndDelete(id);
const searchProperties = ({ location, type }) => {
    const filter = {};
    if (location && location !== "none")
        filter.location = location;
    if (type && type !== "none")
        filter.propertyType = type;
    return property_1.default.find(filter);
};
exports.default = {
    getProperties,
    addProperty,
    getProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
};
