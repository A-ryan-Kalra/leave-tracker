import express from "express";
import { googleLogin, shareCalendar } from "../controller/auth-controller.js";
import { verifyToken, requireRole } from "../util/auth-middleware.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/grant-calendar-permission", shareCalendar);

router.get("/admin", verifyToken, requireRole(["admin"]), (req, res) => {
  res.json({
    message: "Admin area accessed",
    user: req.user,
  });
});

export default router;
