import express from "express";
import { google } from "googleapis";
import { googleLogin } from "../controller/auth-controller.js";

const router = express.Router();

function adminOnly(req, res, next) {
  const role = req.headers["x-user-role"]; // demo: pass role in header
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
router.get("/google", googleLogin);

// router.get("/google", (req, res) => {
//   res.json({ message: "Google auth endpoint is working" });
// });

export default router;
