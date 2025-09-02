import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addMemberToManager,
  assignManagers,
  createProjects,
  fetchUsers,
  listALlProjects,
  listAllUsers,
  listProject,
  updateGroup,
} from "../controller/admin-controller.js";

const router = express.Router();

router.get("/list-all", verifyToken, requireRole(["ADMIN"]), listAllUsers);
router.post(
  "/managers/:id/members",
  verifyToken,
  requireRole(["ADMIN"]),
  addMemberToManager
);
router.post(
  "/assign-manager/:id",
  verifyToken,
  requireRole(["ADMIN"]),
  assignManagers
);
router.get(
  "/manager/:id/list-users",
  verifyToken,
  requireRole(["ADMIN"]),
  fetchUsers
);
router.post(
  "/create-project",
  verifyToken,
  requireRole(["ADMIN"]),
  createProjects
);
router.get(
  "/list-all-project",
  verifyToken,
  requireRole(["ADMIN"]),
  listALlProjects
);
router.get(
  "/list-project/:id",
  verifyToken,
  requireRole(["ADMIN"]),
  listProject
);
router.patch(
  "/update-group/:id",
  verifyToken,
  requireRole(["ADMIN"]),
  updateGroup
);

export default router;
