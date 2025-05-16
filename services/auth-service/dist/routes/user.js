import express from "express";
import { forgotPassword, login, resetPassword } from "../controllers/authentication.js";
const router = express.Router();
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
export default router;
// router.get('/logout', logout);
