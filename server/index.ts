import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import app from "./app.js";

export function createServer() {
  return app;
}
