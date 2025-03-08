import express, { Application } from "express";
import createApp from "./app"; // Import the app creator
import config from "./config/environment";
import { connectDB } from "./config/database";
import logger from "./utils/logger";

// Initialize the Express app
const app: Application = createApp();

// Connect to Database
const startServer = async () => {
  try {
    await connectDB();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1);
  }

  // Start Server
  const PORT = config.PORT || 3000; // Use 'port' to match your config
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${config.NODE_ENV || "development"} mode`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => {
      logger.error("Server closed due to unhandled rejection");
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    server.close(() => {
      logger.error("Server closed due to uncaught exception");
      process.exit(1);
    });
  });

  return server;
};

// Start the server
startServer().catch((error) => {
  logger.error("Server startup error:", error);
  process.exit(1);
});

export default app; // Export app for testing or other imports if needed