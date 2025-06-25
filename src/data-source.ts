import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { School } from './entity/School';
import { Device } from './entity/Device';
import { Application, ApplicationDeviceIssue } from './entity/Application';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, School, Device, Application, ApplicationDeviceIssue],
  synchronize: true, // Set to false in production
  logging: false,
});
