import mongoose from "mongoose";

export const connectMongo = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("mongoDB connected successfully...");
  } catch (error) {
    console.error(`mongoDB connection fail error: ${error}`);
  }
};
