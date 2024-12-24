"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const userRouter = express_1.default.Router();
userRouter.get('/me', auth_1.isAuthenticated, user_controller_1.getLoggedInUser);
userRouter.get('/user-info/:userId', auth_1.isAuthenticated, user_controller_1.getUserInfo);
userRouter.put('/update-user-profile', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.updateUserProfile);
userRouter.get('/users', user_controller_1.getAllUsers);
userRouter.delete('/delete-user/:id', 
// updateAccessToken,
auth_1.isAuthenticated, user_controller_1.deleteUser);
userRouter.post('/toggle-save-question/:questionId', auth_1.isAuthenticated, auth_controller_1.updateAccessToken, user_controller_1.toggleSaveQuestion);
userRouter.get('/saved-questions/:userId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.getSavedQuestions);
userRouter.get('/user-answers', user_controller_1.getUserAnswers);
userRouter.get('/user-questions', user_controller_1.getUserQuestions);
exports.default = userRouter;
