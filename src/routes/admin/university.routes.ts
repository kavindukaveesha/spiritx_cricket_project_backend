import { Router } from "express";
import AdminUniversityController from "../../controllers/admin/university.controller";
// import { isAdmin } from "../../middlewares/auth.middleware";

const router = Router();

// Admin routes (protected)
router.post("/", AdminUniversityController.createUniversity);
router.get("/:id", AdminUniversityController.getUniversityById);
router.get("/", AdminUniversityController.getAllUniversities);
router.put("/:id", AdminUniversityController.updateUniversity);
router.delete("/:id", AdminUniversityController.deleteUniversity);

export default router;