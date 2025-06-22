import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { tokenService } from '../services/tokenService';
import jwt from 'jsonwebtoken';

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

  logout: async (req: any, res: any) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).json({ error: 'No token provided.' });
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      tokenService.blacklistToken(token);
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token.' });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const result = await userService.forgotPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  verifyResetOtp: async (req: Request, res: Response) => {
    try {
      const result = await userService.verifyResetOtp(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const result = await userService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const users = await userService.getAll();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const user = await userService.getById(Number(req.params.id));
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const user = await userService.update(Number(req.params.id), req.body);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const result = await userService.delete(Number(req.params.id));
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  setActive: async (req: Request, res: Response) => {
    try {
      const user = await userService.setActive(Number(req.params.id), req.body.isActive);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
