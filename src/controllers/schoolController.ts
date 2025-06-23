import { Request, Response } from 'express';
import { schoolService } from '../services/schoolService';

export const schoolController = {
  create: async (req: Request, res: Response) => {
    try {
      const school = await schoolService.create(req.body);
      res.status(201).json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  getAll: async (_req: Request, res: Response) => {
    try {
      const schools = await schoolService.getAll();
      res.status(200).json(schools);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const school = await schoolService.getById(Number(req.params.id));
      res.status(200).json(school);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const school = await schoolService.update(Number(req.params.id), req.body);
      res.status(200).json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const result = await schoolService.delete(Number(req.params.id));
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
