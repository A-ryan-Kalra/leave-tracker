import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

export const createToken = async (user) => {
  try {
    const { id, email, role, avatarUrl, fullName, createdAt } = user;

    const token = jwt.sign(
      { id, userEmail: email, userRole: role, avatarUrl, fullName, createdAt },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TIMEOUT || "7d",
      }
    );

    return {
      token,
      user,
      message: "Success",
    };
  } catch (error) {
    console.error(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token required" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    const newSession = await createToken(req?.user);

    if (newSession) {
      req.headers.authorization = `Bearer ${newSession.token}`;
      return res.status(200).json({
        token: newSession?.token,
        user: newSession?.user,
        message: newSession?.message,
      });
    } else {
      return res.status(500).json({ error: "Token verification failed" });
    }
  }
};

export const getUser = async (userId) => {
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      data: {
        email,
        avatarUrl: picture,
        fullName: name,
      },
    });
  }

  const {
    id,
    email: userEmail,
    role: userRole,
    avatarUrl,
    fullName,
    createdAt,
  } = user;

  const token = jwt.sign(
    { id, userEmail, userRole, avatarUrl, fullName, createdAt },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_TIMEOUT || "7d",
    }
  );
  req.headers.authorization = `Bearer ${token}`;
};

// Optional: Middleware to check specific roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
