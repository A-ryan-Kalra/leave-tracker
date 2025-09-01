import express from "express";
import { googleLogin } from "../controller/auth-controller.js";
import { verifyToken, requireRole } from "../util/auth-middleware.js";

const router = express.Router();

function adminOnly(req, res, next) {
  const role = req.headers["x-user-role"]; // demo: pass role in header
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

router.get("/google", googleLogin);

// Protected route example - requires valid JWT token
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profile accessed successfully",
    user: req.user,
  });
});

// Protected route with role requirement
router.get("/admin", verifyToken, requireRole(["admin"]), (req, res) => {
  res.json({
    message: "Admin area accessed",
    user: req.user,
  });
});

// router.get("/google", (req, res) => {
//   res.json({ message: "Google auth endpoint is working" });
// });

export default router;
