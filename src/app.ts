import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Express => {
    const app: Express = express();

    // Middleware
    app.use(helmet()); // Security headers
    app.use(cors()); // Enable CORS
    app.use(express.json()); // Parse JSON bodies
    app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

    // Routes
    app.use("/api/v1", routes);

    // Global Error Handler
    app.use(errorHandler);

    return app;
};

export default createApp;