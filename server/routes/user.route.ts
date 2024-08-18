import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getLoggedInUser,
  getSavedQuestions,
  getUserInfo,
  toggleSaveQuestion,
  updateUserProfile,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getLoggedInUser);
userRouter.get('/get-user-info/:userId', isAuthenticated, getUserInfo);
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
userRouter.post(
  '/toggle-save-question',
  // updateAccessToken,
  isAuthenticated,
  toggleSaveQuestion
);
userRouter.get(
  '/get-saved-questions/:userId',
  // updateAccessToken,
  isAuthenticated,
  getSavedQuestions
);

export default userRouter;
