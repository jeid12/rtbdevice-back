import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import schoolRoutes from './routes/schoolRoutes';
import schoolBulkRoutes from './routes/schoolBulkRoutes';
import deviceRoutes from './routes/deviceRoutes';
import deviceBulkRoutes from './routes/deviceBulkRoutes';
import searchRoutes from './routes/searchRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import automationRoutes from './routes/automationRoutes';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Core routes
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/schools', schoolBulkRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/devices', deviceBulkRoutes);

// Advanced feature routes
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automation', automationRoutes);

const PORT = process.env.PORT || 8080;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Available endpoints:');
      console.log('- Device Management: /api/devices');
      console.log('- School Management: /api/schools');
      console.log('- User Management: /api/users');
      console.log('- Advanced Search: /api/search');
      console.log('- Analytics: /api/analytics');
      console.log('- Automation: /api/automation');
    });
  })
  .catch((error) => console.error(error));
