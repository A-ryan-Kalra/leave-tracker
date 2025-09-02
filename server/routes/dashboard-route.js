import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addLeaveRequest,
  listUserLeaveType,
} from "../controller/dashboard-controller.js";

const router = express.Router();

router.get(
  "/list-user-leave-types/:id",
  verifyToken,
  // requireRole(["ADMIN"]),
  listUserLeaveType
);
router.post("/add-leave-request/:id", verifyToken, addLeaveRequest);

export default router;
