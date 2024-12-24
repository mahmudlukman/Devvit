"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnswers = exports.getUserQuestions = exports.getSavedQuestions = exports.toggleSaveQuestion = exports.deleteUser = exports.updateUserProfile = exports.getAllUsers = exports.getUserInfo = exports.getLoggedInUser = void 0;
require('dotenv').config();
const user_model_1 = __importDefault(require("../models/user.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const cloudinary_1 = __importDefault(require("cloudinary"));
const question_model_1 = __importDefault(require("../models/question.model"));
const redis_1 = require("../utils/redis");
const tag_model_1 = __importDefault(require("../models/tag.model"));
const answer_model_1 = __importDefault(require("../models/answer.model"));
const badges_1 = require("../utils/badges");
// get logged in user info
exports.getLoggedInUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId).select('-password');
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get logged in user info
// export const getUserById = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId } = req.params;
//       const user = await UserModel.findById(userId).select('-password');
//       res.status(200).json({ success: true, user });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// get user info
exports.getUserInfo = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await user_model_1.default.findById(userId).select('-password');
        if (!user) {
            return next(new errorHandler_1.default('User not found', 400));
        }
        const totalQuestions = await question_model_1.default.countDocuments({
            author: user._id,
        });
        const totalAnswers = await answer_model_1.default.countDocuments({ author: user._id });
        const [questionUpvotes] = await question_model_1.default.aggregate([
            { $match: { author: user._id } },
            {
                $project: {
                    _id: 0,
                    upvotes: { $size: '$upvotes' },
                },
            },
            {
                $group: {
                    _id: null,
                    totalUpvotes: { $sum: '$upvotes' },
                },
            },
        ]);
        const [answerUpvotes] = await answer_model_1.default.aggregate([
            { $match: { author: user._id } },
            {
                $project: {
                    _id: 0,
                    upvotes: { $size: '$upvotes' },
                },
            },
            {
                $group: {
                    _id: null,
                    totalUpvotes: { $sum: '$upvotes' },
                },
            },
        ]);
        const [questionViews] = await answer_model_1.default.aggregate([
            { $match: { author: user._id } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                },
            },
        ]);
        const criteria = [
            { type: 'QUESTION_COUNT', count: totalQuestions },
            { type: 'ANSWER_COUNT', count: totalAnswers },
            {
                type: 'QUESTION_UPVOTES',
                count: questionUpvotes?.totalUpvotes || 0,
            },
            {
                type: 'ANSWER_UPVOTES',
                count: answerUpvotes?.totalUpvotes || 0,
            },
            {
                type: 'TOTAL_VIEWS',
                count: questionViews?.totalViews || 0,
            },
        ];
        const badgeCounts = (0, badges_1.assignBadges)({ criteria });
        res.status(200).json({
            success: true,
            user,
            totalQuestions,
            totalAnswers,
            badgeCounts,
            reputation: user.reputation,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get all users
exports.getAllUsers = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, filter, searchQuery, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const query = {};
        if (searchQuery) {
            const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { name: { $regex: new RegExp(escapedSearchQuery, 'i') } },
                { username: { $regex: new RegExp(escapedSearchQuery, 'i') } },
            ];
        }
        let sortOptions = {};
        switch (filter) {
            case 'new_users':
                sortOptions = { joinedAt: -1 };
                break;
            case 'old_users':
                sortOptions = { joinedAt: 1 };
                break;
            case 'top_contributors':
                sortOptions = { reputation: -1 };
                break;
            default:
                break;
        }
        const users = await user_model_1.default.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);
        const totalUsers = await user_model_1.default.countDocuments(query);
        const isNext = totalUsers > skipAmount + users.length;
        res.status(200).json({ success: true, users, isNext });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.updateUserProfile = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name, username, bio, avatar, location, portfolioWebsite } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default('User not found', 400));
        }
        if (name)
            user.name = name;
        if (username)
            user.username = username;
        if (bio)
            user.bio = bio;
        if (portfolioWebsite)
            user.portfolioWebsite = portfolioWebsite;
        if (location)
            user.location = location;
        if (avatar && avatar !== user.avatar?.url) {
            if (user.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
            }
            const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: 'avatar',
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        await user.save();
        await redis_1.redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            if (error.keyValue.username) {
                return next(new errorHandler_1.default('Username already exists', 400));
            }
        }
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get all users
exports.deleteUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id);
        if (!user) {
            return next(new errorHandler_1.default('User not found', 404));
        }
        // get user question ids
        // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');
        // delete user questions
        await question_model_1.default.deleteMany({ author: user._id });
        // TODO: delete user answers, comments, etc.
        await user.deleteOne({ id });
        await redis_1.redis.del(id);
        res
            .status(200)
            .json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// toggle Save Question
exports.toggleSaveQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { questionId } = req.params;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const isQuestionSaved = user.saved.includes(questionId);
        if (isQuestionSaved) {
            // remove question from saved
            await user_model_1.default.findByIdAndUpdate(userId, { $pull: { saved: questionId } }, { new: true });
        }
        else {
            // add question to saved
            await user_model_1.default.findByIdAndUpdate(userId, { $addToSet: { saved: questionId } }, { new: true });
        }
        res.status(200).json({ success: true, message: 'Toggle Successful' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get Saved Questions
exports.getSavedQuestions = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, pageSize = 20, filter, searchQuery, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const query = searchQuery
            ? { title: { $regex: new RegExp(searchQuery, 'i') } }
            : {};
        let sortOptions = {};
        switch (filter) {
            case 'most_recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'most_voted':
                sortOptions = { upvotes: -1 };
                break;
            case 'most_viewed':
                sortOptions = { views: -1 };
                break;
            case 'most_answered':
                sortOptions = { answers: -1 };
                break;
            default:
                break;
        }
        const user = await user_model_1.default.findById(userId).populate({
            path: 'saved',
            match: query,
            options: {
                sort: sortOptions,
                skip: skipAmount,
                limit: pageSize + 1,
            },
            populate: [
                { path: 'tags', model: tag_model_1.default, select: '_id name' },
                {
                    path: 'author',
                    model: user_model_1.default,
                    select: '_id userId name avatar',
                },
            ],
        });
        const isNext = user?.saved && user.saved.length > pageSize;
        if (!user) {
            return next(new errorHandler_1.default('User not found', 404));
        }
        const savedQuestions = user.saved;
        res
            .status(200)
            .json({ success: true, questions: savedQuestions, isNext });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get User Question
exports.getUserQuestions = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId, page = 1, pageSize = 10, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const totalQuestions = await question_model_1.default.countDocuments({ author: userId });
        const userQuestions = await question_model_1.default.find({ author: userId })
            .sort({ createdAt: -1, views: -1, upvotes: -1 })
            .skip(skipAmount)
            .limit(pageSize)
            .populate('tags', '_id name')
            .populate('author', '_id userId name avatar');
        const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;
        res.status(200).json({
            success: true,
            totalQuestions,
            questions: userQuestions,
            isNextQuestions,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get User Question
exports.getUserAnswers = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId, page = 1, pageSize = 10 } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const totalAnswers = await answer_model_1.default.countDocuments({ author: userId });
        const userAnswers = await answer_model_1.default.find({ author: userId })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(pageSize)
            .populate('question', '_id title')
            .populate('author', '_id userId name avatar');
        const isNextAnswer = totalAnswers > skipAmount + userAnswers.length;
        res.status(200).json({
            success: true,
            totalAnswers,
            answers: userAnswers,
            isNextAnswer,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
