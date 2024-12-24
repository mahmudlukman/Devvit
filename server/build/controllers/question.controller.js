"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedQuestions = exports.getHotQuestions = exports.editQuestion = exports.deleteQuestion = exports.downvoteQuestion = exports.upvoteQuestion = exports.getQuestionById = exports.createQuestion = exports.getQuestions = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const question_model_1 = __importDefault(require("../models/question.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const tag_model_1 = __importDefault(require("../models/tag.model"));
const interaction_model_1 = __importDefault(require("../models/interaction.model"));
const answer_model_1 = __importDefault(require("../models/answer.model"));
// get questions
exports.getQuestions = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { searchQuery, filter, page = 1, pageSize = 10, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        const query = {};
        if (searchQuery) {
            const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { title: { $regex: new RegExp(escapedSearchQuery, 'i') } },
                { content: { $regex: new RegExp(escapedSearchQuery, 'i') } },
            ];
        }
        let sortOptions = {};
        switch (filter) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'frequent':
                sortOptions = { views: -1 };
                break;
            case 'unanswered':
                query.answers = { $size: 0 };
                break;
            default:
                break;
        }
        const questions = await question_model_1.default.find(query)
            .populate({ path: 'tags', model: tag_model_1.default })
            .populate({ path: 'author', model: user_model_1.default })
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions);
        const totalQuestions = await question_model_1.default.countDocuments(query);
        const isNext = totalQuestions > skipAmount + questions.length;
        res.status(200).json({ success: true, questions, isNext });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// create questions
exports.createQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const author = req.user;
        const { title, content, tags } = req.body;
        // Create the question
        const question = await question_model_1.default.create({
            title,
            content,
            author: req.user?._id,
        });
        const tagDocuments = [];
        // Create the tags or get them if they already exist
        for (const tag of tags) {
            const existingTag = await tag_model_1.default.findOneAndUpdate({ name: { $regex: new RegExp(`^${tag}$`, 'i') } }, { $setOnInsert: { name: tag }, $push: { questions: question._id } }, { upsert: true, new: true });
            tagDocuments.push(existingTag._id);
        }
        await question_model_1.default.findByIdAndUpdate(question._id, {
            $push: { tags: { $each: tagDocuments } },
        });
        // Create an interaction record for the user's ask_question action
        await interaction_model_1.default.create({
            user: author,
            action: 'ask_question',
            question: question._id,
            tags: tagDocuments,
        });
        // Increment author's reputation by +5 for creating a question
        await user_model_1.default.findByIdAndUpdate(author, { $inc: { reputation: 5 } });
        res.status(201).json({
            success: true,
            question,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get questions by id
exports.getQuestionById = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const question = await question_model_1.default.findById(questionId)
            .populate({ path: 'tags', model: tag_model_1.default, select: '_id name' })
            .populate({
            path: 'author',
            model: user_model_1.default,
            select: '_id userId name avatar',
        });
        res.status(200).json({ success: true, question });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// upvote questions
exports.upvoteQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { questionId } = req.params;
        const question = await question_model_1.default.findById(questionId);
        if (!question) {
            return next(new errorHandler_1.default('Question not found', 400));
        }
        const userIdString = userId.toString();
        const isUpvoted = question.upvotes.map(id => id.toString()).includes(userIdString);
        const isDownvoted = question.downvotes.map(id => id.toString()).includes(userIdString);
        let reputationChange;
        let authorReputationChange;
        if (isUpvoted) {
            // Remove upvote
            question.upvotes = question.upvotes.filter(id => id.toString() !== userIdString);
            reputationChange = -1;
            authorReputationChange = -10;
        }
        else {
            // Add upvote
            question.upvotes.push(userId);
            reputationChange = 1;
            authorReputationChange = 10;
            // Remove downvote if exists
            if (isDownvoted) {
                question.downvotes = question.downvotes.filter(id => id.toString() !== userIdString);
                reputationChange += 2;
                authorReputationChange += 10;
            }
        }
        await question.save();
        // Update user's reputation
        await user_model_1.default.findByIdAndUpdate(userId, {
            $inc: { reputation: reputationChange },
        });
        // Update question author's reputation
        await user_model_1.default.findByIdAndUpdate(question.author, {
            $inc: { reputation: authorReputationChange },
        });
        res.status(200).json({ success: true, question });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// downvote questions
exports.downvoteQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { questionId } = req.params;
        const question = await question_model_1.default.findById(questionId);
        if (!question) {
            return next(new errorHandler_1.default('Question not found', 400));
        }
        const userIdString = userId.toString();
        const isUpvoted = question.upvotes.map(id => id.toString()).includes(userIdString);
        const isDownvoted = question.downvotes.map(id => id.toString()).includes(userIdString);
        let reputationChange = 0;
        let authorReputationChange = 0;
        if (isDownvoted) {
            // Remove downvote
            question.downvotes = question.downvotes.filter(id => id.toString() !== userIdString);
            reputationChange = 2;
            authorReputationChange = 10;
        }
        else {
            // Add downvote
            question.downvotes.push(userId);
            reputationChange = -2;
            authorReputationChange = -10;
            // Remove upvote if exists
            if (isUpvoted) {
                question.upvotes = question.upvotes.filter(id => id.toString() !== userIdString);
                reputationChange -= 1;
                authorReputationChange -= 10;
            }
        }
        await question.save();
        // Update user's reputation
        await user_model_1.default.findByIdAndUpdate(userId, {
            $inc: { reputation: reputationChange },
        });
        // Update question author's reputation
        await user_model_1.default.findByIdAndUpdate(question.author, {
            $inc: { reputation: authorReputationChange },
        });
        res.status(200).json({ success: true, question });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete question
exports.deleteQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const question = await question_model_1.default.findById(questionId);
        if (!question) {
            return next(new errorHandler_1.default('Question not found!', 400));
        }
        await question_model_1.default.deleteOne({ _id: questionId });
        await answer_model_1.default.deleteMany({ question: questionId });
        await interaction_model_1.default.deleteMany({ question: questionId });
        await tag_model_1.default.updateMany({ questions: questionId }, { $pull: { questions: questionId } });
        res
            .status(200)
            .json({ success: true, message: 'Question Deleted Successfully!' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// edit question
exports.editQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { title, content } = req.body;
        const question = await question_model_1.default.findById(questionId).populate('tags');
        if (!question) {
            throw new Error('Question not found');
        }
        if (title)
            question.title = title;
        if (content)
            question.content = content;
        await question.save();
        res.status(200).json({
            success: true,
            message: 'Question Updated Successfully!',
            question,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get hot question
exports.getHotQuestions = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const hotQuestions = await question_model_1.default.find({})
            .sort({ views: -1, upvotes: -1 })
            .limit(5);
        res.status(200).json({
            success: true,
            hotQuestions,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get recommended question
exports.getRecommendedQuestions = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId, page = 1, pageSize = 20, searchQuery, } = req.query;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default('user not found', 400));
        }
        const skipAmount = (page - 1) * pageSize;
        // Find the user's interactions
        const userInteractions = await interaction_model_1.default.find({ user: user._id })
            .populate('tags')
            .exec();
        // Extract tags from user's interactions
        const userTags = userInteractions.reduce((tags, interaction) => {
            if (interaction.tags) {
                tags = tags.concat(interaction.tags);
            }
            return tags;
        }, []);
        // Get distinct tag IDs from user's interactions
        const distinctUserTagIds = [
            // @ts-ignore
            ...new Set(userTags.map((tag) => tag._id)),
        ];
        const query = {
            $and: [
                { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
                { author: { $ne: user._id } }, // Exclude user's own questions
            ],
        };
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        const totalQuestions = await question_model_1.default.countDocuments(query);
        const recommendedQuestions = await question_model_1.default.find(query)
            .populate({
            path: 'tags',
            model: tag_model_1.default,
        })
            .populate({
            path: 'author',
            model: user_model_1.default,
        })
            .skip(skipAmount)
            .limit(pageSize);
        const isNext = totalQuestions > skipAmount + recommendedQuestions.length;
        res.status(200).json({
            success: true,
            questions: recommendedQuestions,
            isNext,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
