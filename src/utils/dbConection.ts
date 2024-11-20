import mongoose from "mongoose";
import {config} from "../config";

export const db = async () => {
  try {
    await mongoose.connect(config.mongooseConnection);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to database");
  }
};