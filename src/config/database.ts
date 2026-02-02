import mongoose from "mongoose";

const connectToDatabase = async (uri: string) => {
  console.log("connecting to database URI:", uri);

  try {
    await mongoose.connect(uri);
    console.log("connected to MongoDB");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("error connection to MongoDB:", error.message);
      process.exit(1);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

export default connectToDatabase;
