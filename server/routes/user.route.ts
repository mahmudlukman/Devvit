import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserInfo,
  updateUserProfile,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getUserInfo);
userRouter.put(
  '/update-user-profile',
  // updateAccessToken,
  isAuthenticated,
  updateUserProfile
);
userRouter.get('/get-users', isAuthenticated, getAllUsers);
userRouter.delete(
  '/delete-user/:id',
  // updateAccessToken,
  isAuthenticated,
  deleteUser
);

export default userRouter;
