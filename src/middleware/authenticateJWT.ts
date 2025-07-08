import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenService } from '../services/tokenService';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'No token provided.' });
    return;
  }
  
  if (tokenService.isTokenBlacklisted(token)) {
    res.status(401).json({ error: 'Token is blacklisted. Please login again.' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
    return;
  }
};
