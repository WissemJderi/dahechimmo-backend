import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["build/**", "node_modules/**", "dist/**"],
    hookTimeout: 60_000, // mongodb-memory-server start is slow when files run in parallel
    env: {
      MONGODB_URI: "mongodb://localhost:27017/test",
      CLOUDINARY_NAME: "test",
      API_KEY: "test",
      API_SECRET: "test",
      JWT_SECRET: "test",
      ADMIN: "admin",
      PASSWORD: "$2b$10$QDNOjEwvhdFgnZcsI2Nv3uH6eK91oUFQAdwIAYZK.QWuA/jxTvHZa",
      PORT: "3001",
    },
  },
});