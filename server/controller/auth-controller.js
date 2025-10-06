import oauth2Client from "../util/google-config.js";
import axios from "axios";
import { prisma } from "../util/db.js";
import jwt from "jsonwebtoken";
import errorHandler from "../util/error-handler.js";
import { calendar } from "../app.js";

export const googleLogin = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `${process.env.GOOGLE_OAUTH_URL}${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;
    const refresh_token = googleRes.tokens?.refresh_token;

    // Check if user already exists
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      // Create new user if they don't exist
      console.log("Creating a new user...");

      user = await prisma.user.create({
        data: {
          email,
          avatarUrl: picture,
          fullName: name,
          refresh_token,
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
    const userDetails = {
      id,
      userEmail,
      userRole,
      avatarUrl,
      fullName,
      createdAt,
    };
    const token = jwt.sign(userDetails, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT || "7d",
    });
    const refresh = jwt.sign(userDetails, process.env.JWT_SECRET_REFRESH, {
      expiresIn: process.env.JWT_TIMEOUT_REFRESH || "7d",
    });
    // req.headers.authorization = `Bearer ${token}`;

    // For - cookies
    // res
    //   .cookie("refresh", refreshToken, {
    //     httpOnly: true,
    //     sameSite: "strict",
    //     secure: false,
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    //   })
    //   .cookie("user-info", accessToken, {
    //     httpOnly: true,
    //     sameSite: "strict",
    //     secure: false,
    //     maxAge: 15 * 60 * 1000,
    //   })
    //   .sendStatus(204);
    return res
      .cookie("refresh", refresh, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
      })
      .status(201)
      .json({
        token,
        user,
        message: "Success",
      });
  } catch (error) {
    // console.error("Error in googleLogin:", error);
    next(errorHandler(error));
  }
};

export const shareCalendar = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email.includes("gmail.com")) {
      throw new Error("Please login with authenticated gmail account.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const respnse = await calendar.acl.insert({
      calendarId: "primary", // service account’s own primary calendar
      requestBody: {
        role: "owner", // or "writer" if you just want edit rights
        scope: {
          type: "user",
          value: user.email, // <-- replace with your account
        },
      },
    });

    console.log("Calendar shared:", res.data);
    return res.status(200).json({
      respnse,
      message: "Success",
    });
  } catch (err) {
    next(errorHandler(err));
  }
};
