import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // In production, the server is at dist/index.js and static files are at dist/public
  // In local dev/build, we might be running from different locations
  const publicPath = path.resolve(__dirname, "public");
  
  console.log(`Serving static files from: ${publicPath}`);

  // Middleware
  app.use(express.json());
  
  // Serve static files with proper caching for PWA
  app.use(express.static(publicPath, {
    maxAge: '1h',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|json|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(publicPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
