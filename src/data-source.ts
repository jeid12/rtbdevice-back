import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { School } from './entity/School';
import { Device } from './entity/Device';
import { Application, ApplicationDeviceIssue } from './entity/Application';
import dotenv from 'dotenv';

dotenv.config();

// Create the data source configuration
const createDataSourceConfig = () => {
  // Try to use DATABASE_URL first (for Supabase/Heroku style connections)
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for connection');
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      entities: [User, School, Device, Application, ApplicationDeviceIssue],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      },
      extra: {
        max: 20,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      }
    };
  }

  // Fallback to individual parameters
  console.log('Using individual database parameters for connection');
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rtb_device_management',
    entities: [User, School, Device, Application, ApplicationDeviceIssue],
    synchronize: true, // Set to false in production
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    extra: {
      max: 20,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    }
  };
};

export const AppDataSource = new DataSource(createDataSourceConfig());
