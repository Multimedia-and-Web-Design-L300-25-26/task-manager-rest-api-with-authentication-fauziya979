import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const options = process.env.NODE_ENV === "test"
      ? { serverSelectionTimeoutMS: 1500 }
      : {};

    await mongoose.connect(process.env.MONGO_URI, options);

    console.log("MongoDB connected");
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Database connection failed");
    }
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;