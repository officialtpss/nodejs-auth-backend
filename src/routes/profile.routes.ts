import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { profileValidation } from '../validations/profile.validation';
import { authMiddleware } from '../middlewares/auth.middleware';
import { auditLoggerMiddleware } from '../middlewares/audit.middleware';

const router = Router();

// All profile routes are protected
router.use(authMiddleware);
router.use(auditLoggerMiddleware);

router.get('/', profileController.getProfile);

router.put(
  '/',
  validateRequest(profileValidation.updateProfile),
  profileController.updateProfile
);

router.get('/activities', profileController.getActivities);

export const profileRoutes = router; 