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

const updateProperty = async (id: string, data: Partial<IProperty>) => {
  try {
    const updateProperty = await Property.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return updateProperty;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
    throw new Error("Failed to update property due to unknown error");
  }
};

const deleteProperty = async (id: string) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    return deletedProperty;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
    throw new Error("Failed to delete property due to unknown error");
  }
};

const searchProperties = async (location: string, type: string) => {
  try {
    if (location === "none") {
      const properties = await Property.find({ propertyType: type });
      return properties;
    } else {
      const properties = await Property.find({
        location: location,
        propertyType: type,
      });

      return properties;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
    throw new Error("Failed to delete property due to unknown error");
  }
};

export default {
  getProperties,
  addProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
};
