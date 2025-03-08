import { Router } from "express";
import ClientUniversityController from "../../controllers/client/university.controller";

const router = Router();

// Client routes (public)
router.get("/:id", ClientUniversityController.getUniversityById);
router.get("/", ClientUniversityController.getAllUniversities);

export default router;