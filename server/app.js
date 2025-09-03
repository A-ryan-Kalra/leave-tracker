import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users-route.js";
import dashboardRoute from "./routes/dashboard-route.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    // credentials: true,
  })
);

// 1. load service-account JSON
const keyFile = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_SERVICE_KEY_PATH, "utf8")
);

// 2. configure auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: keyFile.client_email,
    private_key: keyFile.private_key.replace(/\\n/g, "\n"), // fix line breaks
  },
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ],
});

// 3. reusable calendar client
export const calendar = google.calendar({ version: "v3", auth });

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/healthz", (req, res) => {
  res.send({ message: "Healthy.." });
});

app.use("/auth", authRouter);

app.use("/users", usersRouter);
app.use("/dashboard", dashboardRoute);

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});

app.use((err, req, res, next) => {
  const errorMessage = err.message;
  const statusCode = err.statusCode || 500;
  console.log("Error at", errorMessage);
  console.log("\nError Code at", statusCode);
  res
    .status(statusCode)
    .json({ success: false, message: errorMessage, statusCode });
});
