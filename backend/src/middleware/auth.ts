import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize =
  (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
