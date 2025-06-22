import { RequestHandler } from 'express';
import { authenticateJWT } from './authenticateJWT';
import { UserRole } from '../entity/User';

export function authorizeRoles(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    authenticateJWT(req, res, (err) => {
      if (err) return next(err);

      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (user.role === UserRole.ADMIN) {
        return next();
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
      }
      next();
    });
  };
}
