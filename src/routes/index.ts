import { Router } from "express";
import adminUniversityRoutes from "./admin/university.routes";
import clientUniversityRoutes from "./client/university.routes";
import clientPlayerRouts from "./client/player.routes";

const router = Router();

//admin  routes
router.use("/admin/universities", adminUniversityRoutes);

//client routes
router.use("/universities", clientUniversityRoutes);
router.use("/players", clientPlayerRouts);



export default router;