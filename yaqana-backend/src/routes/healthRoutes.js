import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/live', (req, res) => {
  res.status(200).json({ success: true, status: 'alive', service: 'yaqana-api' });
});

router.get('/ready', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? 'ready' : 'not_ready',
    checks: { database: databaseReady ? 'connected' : 'disconnected' }
  });
});

export default router;
