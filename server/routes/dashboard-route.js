import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addLeaveRequest,
  cancelLeaveRequest,
  listLeaveRequest,
  listUserLeaveType,
} from "../controller/dashboard-controller.js";

const router = express.Router();

router.get("/list-user-leave-types/:id", verifyToken, listUserLeaveType);
router.post("/add-leave-request/:id", verifyToken, addLeaveRequest);
router.get("/list-leave-request/:id", verifyToken, listLeaveRequest);
router.patch("/delete-leave-request/:id", verifyToken, cancelLeaveRequest);

export default router;
