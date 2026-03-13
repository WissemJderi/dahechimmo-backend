"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicIdFromUrl = void 0;
const getPublicIdFromUrl = (url) => {
    // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v123/properties/abc123.jpg
    const parts = url.split("/");
    const versionIndex = parts.findIndex((part) => part.startsWith("v"));
    const pathAfterVersion = parts.slice(versionIndex + 1).join("/");
    return pathAfterVersion.replace(/\.[^/.]+$/, ""); // Remove extension
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
