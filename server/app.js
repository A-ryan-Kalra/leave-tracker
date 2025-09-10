import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users-route.js";
import dashboardRoute from "./routes/dashboard-route.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.get("/healthz", (req, res) => {
  res.send({ message: "Healthy.." });
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/dashboard", dashboardRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
  ],
});

export const gmail = google.gmail({ version: "v1", auth });
// export const sender = process.env.NOTIFICATION_SENDER_EMAIL;
export const calendar = google.calendar({ version: "v3", auth });

if (process.env.DOCKERIZED === "true") {
  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));

  app.all("/{*splat}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  const clientPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  app.get("*splat", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });

app.use((err, req, res, next) => {
  const errorMessage = err?.message || err;
  const statusCode = err.statusCode || 500;
  console.log("Error at", errorMessage);
  console.log("Error Code at", statusCode);
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    statusCode,
  });
});

export default app;
