import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./routes/auth.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});

app.use((err, req, res, next) => {
  const errorMessage = err;
  const statusCode = err.statusCode || 500;
  console.log("Error at", errorMessage);
  console.log("\nError Code at", statusCode);
  res
    .status(statusCode)
    .json({ success: false, message: errorMessage, statusCode });
});
