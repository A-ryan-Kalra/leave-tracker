import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addMemberToManager,
  listAllUsers,
} from "../controller/admin-controller.js";

const router = express.Router();

router.get("/list-all", verifyToken, requireRole(["ADMIN"]), listAllUsers);
router.post(
  "/managers/:id/members",
  verifyToken,
  requireRole(["ADMIN"]),
  addMemberToManager
);

export default router;
