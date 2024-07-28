import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUserInfo,
  updateUserProfile,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getUserInfo);
userRouter.get('/get-user/:id', isAuthenticated, getUserById);
userRouter.put('/update-user-profile', isAuthenticated, updateUserProfile);
userRouter.get('/get-users', isAuthenticated, getAllUsers);
userRouter.delete(
  '/delete-user/:id',
  updateAccessToken,
  isAuthenticated,
  deleteUser
);

export default userRouter;
