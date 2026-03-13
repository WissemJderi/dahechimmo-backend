import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URI: string = process.env.MONGODB_URI ?? "";
export const PORT = process.env.PORT || 3001;
export const CLOUDINARY_NAME: string = process.env.CLOUDINARY_NAME ?? "";
export const API_KEY: string = process.env.API_KEY ?? "";
export const API_SECRET: string = process.env.API_SECRET ?? "";
export const SECRET: string = process.env.JWT_SECRET ?? "";
export const PASSWORD: string = process.env.PASSWORD ?? "";
export const ADMIN: string = process.env.ADMIN ?? "";
