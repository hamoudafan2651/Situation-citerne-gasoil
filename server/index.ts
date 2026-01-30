import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const publicPath = path.resolve(__dirname, "public");
  console.log(`Serving static files from: ${publicPath}`);

  app.use(express.json());

  // Special handling for PWA files to ensure correct MIME types and no-cache
  app.get("/sw.js", (_req, res) => {
    res.set("Content-Type", "application/javascript");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.sendFile(path.join(publicPath, "sw.js"));
  });

  app.get("/manifest.json", (_req, res) => {
    res.set("Content-Type", "application/manifest+json");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.sendFile(path.join(publicPath, "manifest.json"));
  });

  // Serve static images with long cache
  app.use("/images", express.static(path.join(publicPath, "images"), {
    maxAge: '365d',
    immutable: true
  }));

  // Serve other static files
  app.use(express.static(publicPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|json|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

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
