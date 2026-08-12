import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["build/**", "node_modules/**", "dist/**"],
    env: {
      MONGODB_URI: "mongodb://localhost:27017/test",
      CLOUDINARY_NAME: "test",
      API_KEY: "test",
      API_SECRET: "test",
      JWT_SECRET: "test",
      ADMIN: "admin",
      PASSWORD: "$2b$10$abcdefghijklmnopqrstuv",
      PORT: "3001",
    },
  },
});