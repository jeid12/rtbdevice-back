import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
  register: async (req: Request, res: Response) => {
    try {
      const user = await userService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const result = await userService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    try {
      const result = await userService.verifyOtp(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },
};
