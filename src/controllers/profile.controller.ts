import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const updateData: any = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;

      if (newPassword) {
        const isValidPassword = await bcrypt.compare(
          currentPassword!,
          user.password
        );

        if (!isValidPassword) {
          throw new AppError(401, 'Current password is incorrect');
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await prisma.auditLog.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      res.json(activities);
    } catch (error) {
      next(error);
    }
  },
}; 