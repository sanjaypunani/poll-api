import express from "express";
const router = express();
import authController from "../controllers/auth-controller";
import pollController from "../controllers/poll-controlle";
import validationMiddleware from "../middleware/validation-middleware";
import { authenticateToken } from "../middleware/validateJwt";

router.post("/signup", validationMiddleware.signup, authController.signup);
router.post("/login", authController.login);

router.post("/poll", authenticateToken, pollController.createPoll);

router.post("/poll", authenticateToken, pollController.createPoll);
router.get("/poll/my", authenticateToken, pollController.getAllPoll);
router.get("/poll/:id", authenticateToken, pollController.getPollbyId);

router.post("/vote", authenticateToken, pollController.votePollItem);

export default router;
