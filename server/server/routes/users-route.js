import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import {
  addLeaveType,
  addMemberToManager,
  addNewUser,
  addUserLeaveType,
  assignManagers,
  assignRoles,
  createProjects,
  deleteLeaveType,
  deleteProject,
  deleteUserLeaveType,
  fetchLeaveTypeById,
  fetchUsers,
  getUserDetail,
  listALlProjects,
  listAllUsers,
  listLeaveType,
  listProject,
  updateGroup,
  updateLeaveType,
  updateUserLeaveType,
} from "../controller/admin-controller.js";

const router = express.Router();

router.get("/list-all", verifyToken, listAllUsers);

router.post(
  "/managers/:id/members",
  verifyToken,

  addMemberToManager
);
router.post(
  "/assign-manager/:id",
  verifyToken,

  assignManagers
);
router.get(
  "/manager/:id/list-users",
  verifyToken,

  fetchUsers
);
router.post(
  "/create-project",
  verifyToken,

  createProjects
);
router.patch("/delete-project/:id", verifyToken, deleteProject);
router.post("/add-new-user", verifyToken, addNewUser);

router.get(
  "/list-all-project",
  verifyToken,

  listALlProjects
);
router.get(
  "/list-project/:id",
  verifyToken,

  listProject
);
router.patch(
  "/update-group/:id",
  verifyToken,

  updateGroup
);
router.post(
  "/add-leave-type",
  verifyToken,

  addLeaveType
);

router.get(
  "/list-leave-type",
  verifyToken,

  listLeaveType
);
router.get(
  "/list-leave-type/:id",
  verifyToken,

  fetchLeaveTypeById
);
router.patch(
  "/update-leave-type/:id",
  verifyToken,

  updateLeaveType
);
router.patch(
  "/delete-leave-type/:id",
  verifyToken,

  deleteLeaveType
);
router.get(
  "/get-user-detail/:id",
  verifyToken,

  getUserDetail
);
router.post(
  "/add-user-leavetype/:id",
  verifyToken,

  addUserLeaveType
);
router.patch(
  "/update-user-leavetype/:id",
  verifyToken,

  updateUserLeaveType
);
router.patch(
  "/delete-user-leavetype/:id",
  verifyToken,

  deleteUserLeaveType
);
router.patch(
  "/assignRoles/:id",
  verifyToken,

  assignRoles
);

export default router;
