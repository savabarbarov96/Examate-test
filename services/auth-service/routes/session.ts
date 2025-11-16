import express from "express";
import { getActiveSessions } from "../controllers/user.js";

const router = express.Router();

router.get("/count", getActiveSessions);
// router.post("/logout", logout);

export default router;