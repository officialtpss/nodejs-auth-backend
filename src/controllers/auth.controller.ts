import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from '../middlewares/error.middleware';
import { sendEmail } from '../utils/mailer';

const prisma = new PrismaClient();

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError(400, 'Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const { accessToken, refreshToken } = await generateTokens(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError(401, 'Invalid credentials');
      }

      const { accessToken, refreshToken } = await generateTokens(user.id);

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const token = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!token || token.revoked || token.expiresAt < new Date()) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
        token.user.id
      );

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: { revoked: true },
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '1h' } as SignOptions
      );

      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `Click here to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      });

      res.json({
        message: 'Password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as { userId: string };

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError(401, 'Invalid token'));
      } else {
        next(error);
      }
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });

      res.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

async function generateTokens(userId: string) {
  const accessTokenOptions: SignOptions = {
    expiresIn: '15m',
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: '7d',
  };

  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET!,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    refreshTokenOptions
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(
        Date.now() +
          parseInt(process.env.JWT_REFRESH_EXPIRES_IN!.replace('d', '')) *
            24 *
            60 *
            60 *
            1000
      ),
    },
  });

  return { accessToken, refreshToken };
} 