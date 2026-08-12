import Property, { IProperty } from "../models/property";

const addProperty = (propertyData: Partial<IProperty>) => {
  const property = new Property(propertyData);
  return property.save();
};

const getProperty = (id: string) => Property.findById(id).lean();

const getAllProperties = () => Property.find({}).sort({ _id: -1 }).lean();

const updateProperty = (id: string, data: Partial<IProperty>) =>
  Property.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteProperty = (id: string) => Property.findByIdAndDelete(id);

type SearchParams = { location?: string; type?: string };

type PageParams = { page: number; limit: number };

const buildFilter = ({ location, type }: SearchParams): Record<string, string> => {
  const filter: Record<string, string> = {};
  if (location && location !== "none") filter.location = location;
  if (type && type !== "none") filter.propertyType = type;
  return filter;
};

const findProperties = async (
  filter: Record<string, string>,
  { page, limit }: PageParams,
) => {
  const skip = (page - 1) * limit;
  const [properties, total] = await Promise.all([
    Property.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);
  return { properties, total };
};

const getProperties = (pageParams: PageParams) =>
  findProperties({}, pageParams);

const searchProperties = (searchParams: SearchParams, pageParams: PageParams) =>
  findProperties(buildFilter(searchParams), pageParams);

export default {
  getProperties,
  getAllProperties,
  getProperty,
  addProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
};