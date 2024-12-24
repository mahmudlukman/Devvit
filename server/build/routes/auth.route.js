"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const authRouter = express_1.default.Router();
authRouter.post('/register', auth_controller_1.registerUser);
authRouter.post('/activate-user', auth_controller_1.activateUser);
authRouter.post('/login', auth_controller_1.loginUser);
authRouter.get('/logout', auth_1.isAuthenticated, auth_controller_1.logoutUser);
authRouter.get('/refresh', auth_controller_1.updateAccessToken, auth_controller_1.refreshToken);
authRouter.post('/social-auth', auth_controller_1.socialAuth);
authRouter.post('/forgot-password', auth_controller_1.forgotPassword);
authRouter.post('/reset-password', auth_controller_1.resetPassword);
exports.default = authRouter;
