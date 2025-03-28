"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const catchAsyncError_1 = require("./catchAsyncError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const redis_1 = require("../utils/redis");
// authenticated user
exports.isAuthenticated = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new errorHandler_1.default('Please login to access this resources', 400));
    }
    const decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decoded) {
        return next(new errorHandler_1.default('Access token is not valid', 400));
    }
    const user = await redis_1.redis.get(decoded.id);
    if (!user) {
        return next(new errorHandler_1.default('Please login to access this resource', 400));
    }
    req.user = JSON.parse(user);
    next();
});
