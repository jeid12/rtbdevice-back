import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import schoolRoutes from './routes/schoolRoutes';
import schoolBulkRoutes from './routes/schoolBulkRoutes';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/schools', schoolBulkRoutes);

const PORT = process.env.PORT || 8080;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
