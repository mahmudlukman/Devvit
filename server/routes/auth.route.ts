import express from 'express';
import {
  activateUser, 
  registerUser,
  // forgotPassword,
  loginUser,
  logoutUser,
  updateAccessToken,
  socialAuth,
  // resetPassword,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth';
const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/activate-user', activateUser);
authRouter.post('/login', loginUser);
authRouter.get('/logout', isAuthenticated, logoutUser);
authRouter.get('/refresh', updateAccessToken);
authRouter.post('/social-auth', socialAuth);
// authRouter.post('/forgot-password', forgotPassword);
// authRouter.post('/reset-password', resetPassword);

export default authRouter;
