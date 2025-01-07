"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.updateAccessToken = exports.resetPassword = exports.forgotPassword = exports.socialAuth = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registerUser = void 0;
require("dotenv").config();
const user_model_1 = __importDefault(require("../models/user.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
exports.registerUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new errorHandler_1.default("Email already exist", 400));
        }
        const user = {
            name,
            email,
            password,
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationUrl = `https://dev-overflow-sepia.vercel.app/new-verification?token=${activationToken}`;
        const data = { user: { name: user.name }, activationUrl };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activation-mail.ejs"), data);
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken,
            });
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// Function to create an activation token
const createActivationToken = (user) => {
    const token = jsonwebtoken_1.default.sign({ user }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
    return token;
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { activation_token } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (!newUser) {
            return next(new errorHandler_1.default("Invalid token", 400));
        }
        const { name, email, password } = newUser.user;
        let user = await user_model_1.default.findOne({ email });
        if (user) {
            return next(new errorHandler_1.default("User already exist", 400));
        }
        const userNameWithoutSpace = name.replace(/\s/g, "");
        const uniqueNumber = Math.floor(Math.random() * 1000);
        user = await user_model_1.default.create({
            name,
            email,
            password,
            username: `${userNameWithoutSpace}${uniqueNumber}`,
        });
        res
            .status(201)
            .json({
            success: true,
            message: "Email verified & user created successfully",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandler_1.default("Please enter email and password", 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("Invalid credentials", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Invalid credentials", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.logoutUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        const userId = req.user?._id || "";
        redis_1.redis.del(userId);
        res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.socialAuth = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            const userNameWithoutSpace = name.replace(/\s/g, "");
            const uniqueNumber = Math.floor(Math.random() * 1000);
            const newUser = await user_model_1.default.create({
                email,
                name,
                avatar,
                username: `${userNameWithoutSpace}${uniqueNumber}`,
            });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// forgot password
exports.forgotPassword = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new errorHandler_1.default("Please provide a valid email!", 400));
        }
        const emailLowerCase = email.toLowerCase();
        const user = await user_model_1.default.findOne({ email: emailLowerCase });
        if (!user) {
            return next(new errorHandler_1.default("User not found, invalid request!", 400));
        }
        const resetToken = (0, exports.createActivationToken)(user);
        const resetUrl = `https://dev-overflow-sepia.vercel.app/new-password?token=${resetToken}&id=${user._id}`;
        const data = { user: { name: user.name }, resetUrl };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/forgot-password-mail.ejs"), data);
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Reset your password",
                template: "forgot-password-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to reset your password!`,
                resetToken: resetToken,
            });
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// forgot password
exports.resetPassword = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const { id } = req.query;
        if (!id) {
            return next(new errorHandler_1.default("No user ID provided!", 400));
        }
        const user = await user_model_1.default.findById(id).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("user not found!", 400));
        }
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword)
            return next(new errorHandler_1.default("New password must be different from the previous one!", 400));
        if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
            return next(new errorHandler_1.default("Password must be between at least 6 characters!", 400));
        }
        user.password = newPassword.trim();
        await user.save();
        res.status(201).json({
            success: true,
            message: `Password Reset Successfully', 'Now you can login with new password!`,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// update access token
exports.updateAccessToken = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = "Could not refresh token";
        if (!decoded) {
            return next(new errorHandler_1.default(message, 400));
        }
        const session = await redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new errorHandler_1.default("Please login to access this resource", 400));
        }
        const user = JSON.parse(session);
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "5m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
        // res.status(200).json({status:"success", accessToken})
        await redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7 days
        next();
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.refreshToken = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Tokens Refreshed Successfully",
            // accessToken: req.cookies.accessToken,
            // user: req.user
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
