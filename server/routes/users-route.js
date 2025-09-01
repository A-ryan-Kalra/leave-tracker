import express from "express";
import { verifyToken, requireRole } from "../util/auth-middleware.js";
import { listAllUsers } from "../controller/admin-controller.js";

const router = express.Router();

router.get("/list-all", verifyToken, requireRole(["ADMIN"]), listAllUsers);

export default router;
