import express from 'express';
import { getAllUsers, getUserById, getUserInfo, updateUserProfile } from '../controllers/user.controller';
import { isAuthenticated} from '../middleware/auth';
const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getUserInfo);
userRouter.get('/get-user/:id', isAuthenticated, getUserById);
userRouter.put('/update-user-profile', isAuthenticated, updateUserProfile);
userRouter.get('/get-users', isAuthenticated, getAllUsers);


export default userRouter;
