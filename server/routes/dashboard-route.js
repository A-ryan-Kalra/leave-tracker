import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import { listUserLeaveType } from "../controller/dashboard-controller.js";

const router = express.Router();

router.get(
  "/list-user-leave-types/:id",
  verifyToken,
  // requireRole(["ADMIN"]),
  listUserLeaveType
);

export default router;
