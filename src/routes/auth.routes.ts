import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authValidation } from '../validations/auth.validation';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Public routes
router.post(
  '/register',
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(authValidation.login),
  authController.login
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

// Protected routes
router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshToken),
  authController.refreshToken
);

router.post('/logout', authController.logout);

export const authRoutes = router; 