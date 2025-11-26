import { Router } from 'express';
import { registerController, loginController,verifyTokenController } from '../Controller/userController.js';

const router = Router();

// register a new user
router.post('/register',registerController);
router.post('/login',loginController);
router.get('/verifyToken',verifyTokenController);

export default router;