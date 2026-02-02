import Property, { IProperty } from "../models/property";

const getProperties = async () => {
  try {
    const data = await Property.find({});
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
    throw new Error("Failed to fetch properties due to unknown error");
  }
};

const addProperty = async (propertyData: Partial<IProperty>) => {
  try {
    const property = new Property(propertyData);
    return await property.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
    throw new Error("Failed to create property due to unknown error");
  }
};

const getProperty = async (id: string) => {
  try {
    const property = await Property.findById(id);
    return property;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to find property: ${error.message}`);
    }
    throw new Error("Failed to create property due to unknown error");
  }
};

export default { getProperties, addProperty, getProperty };
