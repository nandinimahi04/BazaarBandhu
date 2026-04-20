import path from "path";
import { createServer } from "./index.js";
import express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
import fs from 'fs';

// Try multiple common locations for the dist folder
const getDistPath = () => {
    const cwd = process.cwd();
    const paths = [
        path.join(cwd, 'dist'),
        path.join(cwd, 'client/dist'),
        path.join(cwd, 'new_hack/dist'),
    ];
    
    for (const p of paths) {
        if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
            return p;
        }
    }
    return paths[0]; // Fallback to root dist
};

const distPath = getDistPath();
console.log(`🚀 BAZAAR-BANDHU PRODUCTION SERVER`);
console.log(`📍 Current Directory: ${process.cwd()}`);
console.log(`📂 Using static folder: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log(`✅ Folder exists. Files found: ${fs.readdirSync(distPath).slice(0, 5).join(', ')}...`);
} else {
    console.log(`❌ ERROR: Static folder not found!`);
}

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // 1. Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // 2. Don't serve index.html for missing assets (CSS/JS/Images)
  // This prevents the "MIME type mismatch" error
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|tsx|ts)$/)) {
    console.log(`🚫 Asset not found or blocked: ${req.path}`);
    return res.status(404).send('Asset not found');
  }

  const indexHtml = path.join(distPath, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    console.log(`❌ CRITICAL: index.html not found at ${indexHtml}`);
    res.status(500).send('Application Error: Build files missing');
  }
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
