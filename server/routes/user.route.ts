import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getLoggedInUser,
  getSavedQuestions,
  getUserAnswers,
  // getUserInfo,
  getUserQuestions,
  toggleSaveQuestion,
  updateUserProfile,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getLoggedInUser);
// userRouter.get('/user-info/:userId', isAuthenticated, getUserInfo);
userRouter.put(
  '/update-user-profile',
  // updateAccessToken,
  isAuthenticated,
  updateUserProfile
);
userRouter.get('/users', getAllUsers);
userRouter.delete(
  '/delete-user/:id',
  // updateAccessToken,
  isAuthenticated,
  deleteUser
);
userRouter.post(
  '/toggle-save-question/:questionId',
  // updateAccessToken,
  isAuthenticated,
  toggleSaveQuestion
);
userRouter.get(
  '/saved-questions',
  // updateAccessToken,
  isAuthenticated,
  getSavedQuestions
);

userRouter.get(
  '/user-answers',
  getUserAnswers
);

userRouter.get(
  '/user-questions',
  getUserQuestions
);

export default userRouter;
