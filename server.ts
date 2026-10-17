import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import authRoutes from './src/server/routes/authRoutes.ts';
import menuRoutes from './src/server/routes/menuRoutes.ts';
import orderRoutes from './src/server/routes/orderRoutes.ts';
import reservationRoutes from './src/server/routes/reservationRoutes.ts';
import tableRoutes from './src/server/routes/tableRoutes.ts';
import couponRoutes from './src/server/routes/couponRoutes.ts';
import paymentRoutes from './src/server/routes/paymentRoutes.ts';
import dashboardRoutes from './src/server/routes/dashboardRoutes.ts';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admin', dashboardRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'DineDesk API Server',
      timestamp: new Date().toISOString(),
    });
  });

  // Download project source code as a ZIP file
  app.get('/api/download-zip', (_req, res) => {
    res.attachment('dinedesk-restaurant-platform.zip');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err) => {
      console.error('ZIP generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    });

    archive.pipe(res);

    archive.glob('**/*', {
      cwd: __dirname,
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '*.log',
        '**/.DS_Store',
      ],
      dot: true,
    });

    archive.finalize();
  });

  if (!isProd) {
    // Development mode: hook into Vite dev server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DineDesk server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start DineDesk server:', err);
  process.exit(1);
});
