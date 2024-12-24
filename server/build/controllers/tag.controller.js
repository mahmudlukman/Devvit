"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPopularTags = exports.getQuestionsByTagId = exports.getAllTags = exports.getTopInteractedTags = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const question_model_1 = __importDefault(require("../models/question.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = require("mongoose");
const tag_model_1 = __importDefault(require("../models/tag.model"));
// get Top Interacted Tags
exports.getTopInteractedTags = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.query.userId;
        if (!userId || typeof userId !== 'string') {
            return next(new errorHandler_1.default('Valid user ID is required', 400));
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return next(new errorHandler_1.default('Invalid user ID format', 400));
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default('User not found', 404));
        }
        const interactedQuestions = await question_model_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { author: new mongoose_1.Types.ObjectId(userId) },
                        { answers: { $elemMatch: { author: new mongoose_1.Types.ObjectId(userId) } } },
                        { upvotes: new mongoose_1.Types.ObjectId(userId) },
                        { downvotes: new mongoose_1.Types.ObjectId(userId) }
                    ]
                }
            },
            { $project: { tags: 1 } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'tags',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tagInfo'
                }
            },
            { $unwind: '$tagInfo' },
            {
                $project: {
                    _id: '$tagInfo._id',
                    name: '$tagInfo.name',
                    count: 1
                }
            }
        ]);
        res.status(200).json({ success: true, topInteractedTags: interactedQuestions });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// get all tags
exports.getAllTags = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { searchQuery, filter, page = 1, pageSize = 10, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const query = {};
        if (searchQuery) {
            const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [{ name: { $regex: new RegExp(escapedSearchQuery, 'i') } }];
        }
        let sortOptions = {};
        switch (filter) {
            case 'popular':
                sortOptions = { questions: -1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'name':
                sortOptions = { name: 1 };
                break;
            case 'old':
                sortOptions = { createdAt: 1 };
                break;
            default:
                break;
        }
        const totalTags = await tag_model_1.default.countDocuments(query);
        const tags = await tag_model_1.default.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);
        const isNext = totalTags > skipAmount + tags.length;
        res.status(200).json({ success: true, tags, isNext });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// create questions
exports.getQuestionsByTagId = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { tagId, page = 1, pageSize = 10, searchQuery, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const tagFilter = { _id: tagId };
        const tag = await tag_model_1.default.findOne(tagFilter).populate({
            path: 'questions',
            model: question_model_1.default,
            match: searchQuery
                ? { title: { $regex: searchQuery, $options: 'i' } }
                : {},
            options: {
                sort: { createdAt: -1 },
                skip: skipAmount,
                limit: pageSize + 1, // +1 to check if there is next page
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
        if (!tag) {
            return next(new errorHandler_1.default('Tag not found', 400));
        }
        const isNext = tag.questions.length > pageSize;
        const questions = tag.questions;
        res.status(201).json({
            success: true,
            tagTitle: tag.name,
            questions,
            isNext,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get Top Popular Tags
exports.getTopPopularTags = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const popularTags = await tag_model_1.default.aggregate([
            { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
            { $sort: { numberOfQuestions: -1 } },
            { $limit: 5 },
        ]);
        res.status(200).json({ success: true, popularTags });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
