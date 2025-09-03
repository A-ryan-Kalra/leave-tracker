// mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 1-account SMTP transporter (Gmail, Outlook, etc.)
export const transporter = nodemailer.createTransport({
  service: "gmail", // or 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.SMTP_USER, // e.g. noreply@gmail.com
    pass: process.env.SMTP_PASS, // App-password / SMTP password
  },
});

export async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
