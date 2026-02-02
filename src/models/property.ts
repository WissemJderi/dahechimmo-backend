import mongoose, { Document, Schema } from "mongoose";
import { Location, PropertyType } from "../types";

interface IProperty extends Document {
  title: string;
  description?: string;
  price: number;
  propetyType: PropertyType;
  location: Location;
  surfaceArea?: number;
  rooms?: number;
  isForRent: boolean;
  images: string[];
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    propetyType: {
      type: String,
      enum: Object.values(PropertyType),
      required: true,
    },
    location: {
      type: String,
      enum: Object.values(Location),
      required: true,
    },
    surfaceArea: { type: Number },
    rooms: { type: Number },
    isForRent: { type: Boolean, required: true },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "You can upload a maximum of 5 images",
      },
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IProperty>("Property", propertySchema);
