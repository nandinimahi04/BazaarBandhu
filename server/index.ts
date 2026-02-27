import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import app from "./app.js";


export function createServer() {
  return app;
}

const PORT = process.env.PORT || 5004;

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.ts')) {
  app.listen(PORT, () => {
    console.log(`🚀 BazaarBandhu API server running on port ${PORT}`);
  });
}

export default app;
