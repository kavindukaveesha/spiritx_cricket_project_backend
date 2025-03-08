import express from "express";
import PlayerController from "../../controllers/client/player.controller";
import { authenticateJWT, authorizePlayer } from "../../middlewares/auth.middleware";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", PlayerController.register);
router.get("/verify/:id/:token", PlayerController.verifyAccount);
router.post("/login", PlayerController.login);
router.post("/forgot-password", PlayerController.forgotPassword);
router.post("/reset-password/:id/:token", PlayerController.resetPassword);

// Protected routes - require authentication and player role
router.use(authenticateJWT, authorizePlayer);

// Profile
router.get("/profile", PlayerController.getProfile);
router.put("/profile", PlayerController.updateProfile);

// Password management
router.post("/change-password", PlayerController.changePassword);

// Two-factor authentication
router.post("/generate-otp", PlayerController.generateOTP);
router.post("/verify-otp", PlayerController.verifyOTP);

// Team management
router.post("/teams", PlayerController.createTeam);
router.post("/teams/join", PlayerController.joinTeam);

// Token management
router.post("/refresh-token", PlayerController.refreshToken);
router.post("/logout", PlayerController.logout);

export default router;