import mongoose from "mongoose";

import { config } from "../config/config";
import log from "./logger";

// To remove Deprecation Warnings.
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(config.dbUri);
    log.info(`Connected to DB: ${connection.connection.host}`);
  } catch (error) {
    log.error(`Error Connecting to DB: ${error}`);

    process.exit(1);
  }
};

export default connectDB;
