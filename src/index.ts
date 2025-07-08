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
import applicationRoutes from './routes/applicationRoutes';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://rtbdevicemanagment.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 8080;

// Initialize database connection with better error handling
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection established successfully');
    console.log(`Database: ${AppDataSource.options.database || 'Using connection URL'}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('📋 Available endpoints:');
      console.log('   - Device Management: /api/devices');
      console.log('   - School Management: /api/schools');
      console.log('   - User Management: /api/users');
      console.log('   - Advanced Search: /api/search');
      console.log('   - Analytics: /api/analytics');
      console.log('   - Automation: /api/automation');
      console.log('   - Applications: /api/applications');
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:');
    console.error('Error details:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n🔧 Troubleshooting tips for "Tenant or user not found":');
      console.error('1. Check if your Supabase project is active');
      console.error('2. Verify the database URL and credentials');
      console.error('3. Ensure the database user has proper permissions');
      console.error('4. Check if the connection string is properly URL-encoded');
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n🔧 Connection timeout detected:');
      console.error('1. Check your internet connection');
      console.error('2. Verify Supabase service status');
      console.error('3. Try increasing connection timeout');
    }
    
    console.error('\n📞 Environment variables being used:');
    console.error(`   DATABASE_URL: ${process.env.DATABASE_URL ? '[SET]' : '[NOT SET]'}`);
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    
    process.exit(1);
  });

