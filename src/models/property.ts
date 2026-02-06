import mongoose, { Document, Schema } from "mongoose";
import { Location, PropertyType } from "../types";

export interface IProperty extends Document {
  title: string;
  ref: string;
  description: string;
  price: number;
  propertyType: PropertyType;
  location: Location;
  area: number;
  status: "sale" | "rent";
  images: string[];
  // These are optional — only present on apartments/houses
  floor?: number;
  parking?: boolean;
  bedrooms?: number;
  bathrooms?: number;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    ref: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    propertyType: {
      type: String,
      enum: Object.values(PropertyType),
      required: true,
    },
    location: {
      type: String,
      enum: Object.values(Location),
      required: true,
    },
    area: { type: Number, required: true },
    status: { type: String, enum: ["sale", "rent"], required: true },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "You can upload a maximum of 5 images",
      },
      default: [],
    },
    floor: { type: Number },
    parking: { type: Boolean },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
  },
  { timestamps: true },
);

export default mongoose.model<IProperty>("Property", propertySchema);
