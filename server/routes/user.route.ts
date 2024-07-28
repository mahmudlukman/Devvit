import express from 'express';
import { getUserById, getUserInfo, updateUserProfile } from '../controllers/user.controller';
import { isAuthenticated} from '../middleware/auth';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getUserInfo);
userRouter.get('/get-user/:id', isAuthenticated, getUserById);
userRouter.put('/update-user-profile', isAuthenticated, updateUserProfile);


export default userRouter;
