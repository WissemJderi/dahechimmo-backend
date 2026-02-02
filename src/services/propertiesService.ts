import Property from "../models/property";

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

export default { getProperties };
