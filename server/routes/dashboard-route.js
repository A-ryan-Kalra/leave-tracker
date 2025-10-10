import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addLeaveRequest,
  approveLeaveRequest,
  cancelLeaveRequest,
  deleteUser,
  fetchUser,
  listAllApprovedList,
  listLeaveRequest,
  listUserLeaveType,
  manageLeaveRequests,
  rejectLeaveRequest,
} from "../controller/dashboard-controller.js";

const router = express.Router();

router.get("/list-user-leave-types/:id", verifyToken, listUserLeaveType);
router.post("/add-leave-request/:id", verifyToken, addLeaveRequest);
router.get("/list-leave-request/:id", verifyToken, listLeaveRequest);
router.patch("/cancel-leave-request/:id", verifyToken, cancelLeaveRequest);
router.get("/manage-leave-request/:id", verifyToken, manageLeaveRequests);
router.patch("/approve-leave-request/:id", verifyToken, approveLeaveRequest);
router.patch("/reject-leave-request/:id", verifyToken, rejectLeaveRequest);
router.get("/list-approved-leaves/:id", verifyToken, listAllApprovedList);
router.get("/fetch-user", fetchUser);
router.patch("/delete-user/:id", verifyToken, deleteUser);

export default router;
