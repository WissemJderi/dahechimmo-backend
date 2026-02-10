export const getPublicIdFromUrl = (url: string): string => {
  // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v123/properties/abc123.jpg
  const parts = url.split("/");
  const versionIndex = parts.findIndex((part) => part.startsWith("v"));
  const pathAfterVersion = parts.slice(versionIndex + 1).join("/");
  return pathAfterVersion.replace(/\.[^/.]+$/, ""); // Remove extension
};
