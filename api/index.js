import app from "../server/app.js";

// Vercel expects a default export: (req, res) => {}
export default function handler(req, res) {
  return app(req, res);
}
