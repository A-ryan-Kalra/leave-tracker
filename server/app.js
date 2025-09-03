import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

import fs from "fs";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users-route.js";
import dashboardRoute from "./routes/dashboard-route.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __direname = path.dirname(__filename);

const clientPath = path.join(__direname, "../client/dist");
app.use(express.static(clientPath));

app.get("*splat", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// 1. load service-account JSON
const keyFile = JSON.parse(
  fs.readFileSync(path.resolve(process.env.GOOGLE_SERVICE_KEY_PATH), "utf8")
);
// 2. configure auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: keyFile.client_email,
    private_key: keyFile.private_key.replace(/\\n/g, "\n"), // fix line breaks
  },
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
  ],
});
export const gmail = google.gmail({ version: "v1", auth });
export const sender = process.env.NOTIFICATION_SENDER_EMAIL;
// 3. reusable calendar client
export const calendar = google.calendar({ version: "v3", auth });

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
