import oauth2Client from "../util/google-config.js";
import axios from "axios";
import { prisma } from "../util/db.js";
import jwt from "jsonwebtoken";
import errorHandler from "../util/error-handlet.js";

export const googleLogin = async (req, res, next) => {
  try {
    const { code, role } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    console.log("Code: ", code);
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    const { email, name, picture } = userRes.data;

    console.log("email", email);
    console.log("name", name);
    console.log("picture", picture);

    // Check if user already exists
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      // Create new user if they don't exist
      console.log("Creating new user:");
      user = await prisma.user.create({
        data: {
          email,
          fullName: name,
          role: role || "team_member",
          avatarUrl: picture,
        },
      });
    }
    console.log("user", user);
    const { id, email: userEmail, role: userRole } = user;

    const token = jwt.sign(
      { id, userEmail, userRole },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TIMEOUT || "7d",
      }
    );

    res.status(200).json({
      token,
      user,
      message: "Success",
    });
  } catch (error) {
    // console.error("Error in googleLogin:", error);
    errorHandler(error);
  }
};
