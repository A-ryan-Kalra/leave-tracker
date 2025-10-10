import express from "express";
import { googleLogin, shareCalendar } from "../controller/auth-controller.js";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import jwt from "jsonwebtoken";
const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/grant-calendar-permission", shareCalendar);

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies?.refresh;

  if (!refreshToken) return res.sendStatus(403);
  const newAccess = jwt.verify(
    refreshToken,
    process.env.JWT_SECRET_REFRESH,
    (err, decoded) => {
      if (err) return res.sendStatus(403);

      const { id, userEmail, userRole, avatarUrl, fullName, createdAt } =
        decoded;

      const token = jwt.sign(
        {
          id,
          userEmail,
          userRole,
          avatarUrl,
          fullName,
          createdAt,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_TIMEOUT_REFRESH || "7d" }
      );
      // For - cookies
      // res
      //   .cookie("access", newAccess, {
      //     httpOnly: true,
      //     sameSite: "strict",
      //     secure: false,
      //     maxAge: 15 * 60 * 1000,
      //   })
      //   .sendStatus(204);

      res.json({
        token,
        message: "Success",
      });
    }
  );
});

router.get("/admin", verifyToken, requireRole(["admin"]), (req, res) => {
  res.json({
    message: "Admin area accessed",
    user: req.user,
  });
});

export default router;
