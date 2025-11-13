import express from "express";
import rateLimit from "express-rate-limit";

import {
  forgotPassword,
  login,
  logout,
  protect,
  refreshAccessToken,
  changePassword,
  verify2fa,
} from "../controllers/authentication.js";
import { getActiveSessions, getMe } from "../controllers/user.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many requests from this IP, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/refresh", refreshAccessToken);
// router.get("/verify/:token", verifyActivationToken);
router.post("/login", 
  // loginLimiter 
  login);
router.post("/verify-2fa", verify2fa);

router.post("/logout", logout);

router.post("/forgotPassword", 
  // loginLimiter,
  forgotPassword);
// router.post("/verify-code", verifyResetCode);
router.patch("/change-password", changePassword);

router.get("/me", protect, getMe);

export default router;
