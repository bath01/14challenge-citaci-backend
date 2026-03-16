import express from 'express';
import cors from 'cors';
import citationsRouter from './routes/citations';
import statsRouter from './routes/stats';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/citations', citationsRouter);
app.use('/api/stats', statsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 CitaCI API running on http://localhost:${PORT}`);
});

export default app;
