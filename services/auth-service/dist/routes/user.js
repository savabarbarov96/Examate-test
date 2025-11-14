import express from "express";
import rateLimit from "express-rate-limit";
import { forgotPassword, login, logout, protect, refreshAccessToken, changePassword, verify2fa, getLastLogin, } from "../controllers/authentication.js";
import { getMe } from "../controllers/user.js";
const router = express.Router();
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many requests from this IP, please try again after 10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.get("/refresh", refreshAccessToken);
// router.get("/verify/:token", verifyActivationToken);
import { validate, loginSchema, verify2faSchema, forgotPasswordSchema, changePasswordSchema, } from "../middlewares/validation.js";
// ...
router.post("/login", validate(loginSchema), login);
router.post("/verify-2fa", validate(verify2faSchema), verify2fa);
router.post("/logout", logout);
router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);
router.patch("/change-password", validate(changePasswordSchema), changePassword);
router.get("/me", protect, getMe);
router.get("/last-login", protect, getLastLogin);
export default router;
