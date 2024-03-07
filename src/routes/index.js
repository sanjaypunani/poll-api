import express from "express";
const router = express();
import authController from "../controllers/auth-controller";
import pollController from "../controllers/poll-controlle";
import validationMiddleware from "../middleware/validation-middleware";
import { uploadImageFile } from "../middleware/upload";
import { authenticateToken } from "../middleware/validateJwt";

router.post(
  "/signup",
  uploadImageFile.single("profile"),
  validationMiddleware.signup,
  authController.signup
);
router.post("/login", authController.login);

router.post("/poll", authenticateToken, pollController.createPoll);

router.post("/poll", authenticateToken, pollController.createPoll);
router.get("/poll/all", authenticateToken, pollController.getAllPoll);

router.post("/vote", authenticateToken, pollController.votePollItem);

export default router;
