/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);
const distPath: string = path.join(__dirname, 'dist');

// Health check endpoint for Cloud Run probes
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Serve static assets from built Vite bundle
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Single Page Application (SPA) catch-all route
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Sistem Scoring Sepak Takraw</title></head>
        <body style="font-family: sans-serif; background: #020617; color: #f8fafc; text-align: center; padding: 50px;">
          <h1>Sistem Scoring Sepak Takraw</h1>
          <p>Aplikasi sedang dimuat. Menyiapkan berkas produksi...</p>
        </body>
      </html>
    `);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Cloud Run server listening on 0.0.0.0:${port}`);
});
