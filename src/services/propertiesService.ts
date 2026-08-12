import Property, { IProperty } from "../models/property";

const getProperties = () => Property.find({});

const addProperty = (propertyData: Partial<IProperty>) => {
  const property = new Property(propertyData);
  return property.save();
};

const getProperty = (id: string) => Property.findById(id);

const updateProperty = (id: string, data: Partial<IProperty>) =>
  Property.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteProperty = (id: string) => Property.findByIdAndDelete(id);

type SearchParams = { location?: string; type?: string };

const searchProperties = ({ location, type }: SearchParams) => {
  const filter: Record<string, string> = {};
  if (location && location !== "none") filter.location = location;
  if (type && type !== "none") filter.propertyType = type;
  return Property.find(filter);
};

export default {
  getProperties,
  addProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
};