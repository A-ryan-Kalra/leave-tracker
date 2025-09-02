import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addLeaveRequest,
  listLeaveRequest,
  listUserLeaveType,
} from "../controller/dashboard-controller.js";

const router = express.Router();

router.get("/list-user-leave-types/:id", verifyToken, listUserLeaveType);
router.post("/add-leave-request/:id", verifyToken, addLeaveRequest);
router.get("/list-leave-request/:id", verifyToken, listLeaveRequest);

export default router;
