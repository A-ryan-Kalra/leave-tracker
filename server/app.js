import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users-route.js";
import dashboardRoute from "./routes/dashboard-route.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Health check first
app.get("/healthz", (req, res) => {
  res.send({ message: "Healthy.." });
});

// ✅ API routes should be BEFORE static serving
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/dashboard", dashboardRoute);

// Google API setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFile = JSON.parse(
  fs.readFileSync(path.resolve(process.env.GOOGLE_SERVICE_KEY_PATH), "utf8")
);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: keyFile.client_email,
    private_key: keyFile.private_key.replace(/\\n/g, "\n"),
  },
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
  ],
});

export const gmail = google.gmail({ version: "v1", auth });
export const sender = process.env.NOTIFICATION_SENDER_EMAIL;
export const calendar = google.calendar({ version: "v3", auth });

// ✅ Static React build AFTER APIs
const clientPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientPath));

app.get("*splat", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  const errorMessage = err.message;
  const statusCode = err.statusCode || 500;
  console.log("Error at", errorMessage);
  console.log("Error Code at", statusCode);
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    statusCode,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
