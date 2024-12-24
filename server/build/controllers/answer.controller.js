"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnswer = exports.downvoteAnswer = exports.upvoteAnswer = exports.getAnswers = exports.createAnswer = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const question_model_1 = __importDefault(require("../models/question.model"));
const answer_model_1 = __importDefault(require("../models/answer.model"));
const interaction_model_1 = __importDefault(require("../models/interaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// create answer
exports.createAnswer = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const author = req.user;
        const { content, question } = req.body;
        if (!content || !question) {
            return next(new errorHandler_1.default('Content and question ID are required', 400));
        }
        const newAnswer = await answer_model_1.default.create({
            content,
            question,
            author: req.user?._id,
        });
        // Add the answer to the question's answers array
        const questionObject = await question_model_1.default.findByIdAndUpdate(question, {
            $push: { answers: newAnswer._id },
        });
        await interaction_model_1.default.create({
            user: author,
            action: 'answer',
            question,
            answer: newAnswer._id,
            tags: questionObject?.tags,
        });
        await user_model_1.default.findByIdAndUpdate(author, { $inc: { reputation: 10 } });
        res.status(200).json({ success: true, newAnswer });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get answers
exports.getAnswers = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { questionId, sortBy, page = 1, pageSize = 10, } = req.query;
        const skipAmount = (page - 1) * pageSize;
        let sortOptions = {};
        switch (sortBy) {
            case 'highestUpvotes':
                sortOptions = { upvotes: -1 };
                break;
            case 'lowestUpvotes':
                sortOptions = { upvotes: 1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'old':
                sortOptions = { createdAt: 1 };
                break;
            default:
                break;
        }
        const answers = await answer_model_1.default.find({ question: questionId })
            .populate('author', '_id name avatar')
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);
        const totalAnswer = await answer_model_1.default.countDocuments({
            question: questionId,
        });
        const isNextAnswer = totalAnswer > skipAmount + answers.length;
        res.status(200).json({ success: true, answers, isNextAnswer });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// upvote answers
exports.upvoteAnswer = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { answerId } = req.params;
        const answer = await answer_model_1.default.findById(answerId);
        if (!answer) {
            return next(new errorHandler_1.default('Answer not found', 400));
        }
        const userIdString = userId.toString();
        const isUpvoted = answer.upvotes.map(id => id.toString()).includes(userIdString);
        const isDownvoted = answer.downvotes.map(id => id.toString()).includes(userIdString);
        let reputationChange;
        let authorReputationChange;
        if (isUpvoted) {
            // Remove upvote
            answer.upvotes = answer.upvotes.filter(id => id.toString() !== userIdString);
            reputationChange = -1;
            authorReputationChange = -10;
        }
        else {
            // Add upvote
            answer.upvotes.push(userId);
            reputationChange = 1;
            authorReputationChange = 10;
            // Remove downvote if exists
            if (isDownvoted) {
                answer.downvotes = answer.downvotes.filter(id => id.toString() !== userIdString);
                reputationChange += 2;
                authorReputationChange += 10;
            }
        }
        await answer.save();
        // Update user's reputation
        await user_model_1.default.findByIdAndUpdate(userId, {
            $inc: { reputation: reputationChange },
        });
        // Update question author's reputation
        await user_model_1.default.findByIdAndUpdate(answer.author, {
            $inc: { reputation: authorReputationChange },
        });
        res.status(200).json({ success: true, answer });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// down vote answers
exports.downvoteAnswer = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { answerId } = req.params;
        const answer = await answer_model_1.default.findById(answerId);
        if (!answer) {
            return next(new errorHandler_1.default('Answer not found', 400));
        }
        const userIdString = userId.toString();
        const isUpvoted = answer.upvotes.map(id => id.toString()).includes(userIdString);
        const isDownvoted = answer.downvotes.map(id => id.toString()).includes(userIdString);
        let reputationChange = 0;
        let authorReputationChange = 0;
        if (isDownvoted) {
            // Remove downvote
            answer.downvotes = answer.downvotes.filter(id => id.toString() !== userIdString);
            reputationChange = 2;
            authorReputationChange = 10;
        }
        else {
            // Add downvote
            answer.downvotes.push(userId);
            reputationChange = -2;
            authorReputationChange = -10;
            // Remove upvote if exists
            if (isUpvoted) {
                answer.upvotes = answer.upvotes.filter(id => id.toString() !== userIdString);
                reputationChange -= 1;
                authorReputationChange -= 10;
            }
        }
        await answer.save();
        // Update user's reputation
        await user_model_1.default.findByIdAndUpdate(userId, {
            $inc: { reputation: reputationChange },
        });
        // Update question author's reputation
        await user_model_1.default.findByIdAndUpdate(answer.author, {
            $inc: { reputation: authorReputationChange },
        });
        res.status(200).json({ success: true, answer });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete answers
exports.deleteAnswer = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { answerId } = req.params;
        const answer = await answer_model_1.default.findById(answerId);
        if (!answer) {
            return next(new errorHandler_1.default('Answer not found!', 400));
        }
        // Calculate reputation change
        const authorReputationChange = -(answer.upvotes.length * 10 - answer.downvotes.length * 10);
        // Adjust reputation for users who voted
        const votedUsers = [...new Set([...answer.upvotes, ...answer.downvotes])];
        for (const userId of votedUsers) {
            let userReputationChange = 0;
            if (answer.upvotes.includes(userId))
                userReputationChange -= 1;
            if (answer.downvotes.includes(userId))
                userReputationChange += 2;
            await user_model_1.default.findByIdAndUpdate(userId, {
                $inc: { reputation: userReputationChange }
            });
        }
        // Adjust author's reputation
        await user_model_1.default.findByIdAndUpdate(answer.author, {
            $inc: { reputation: authorReputationChange }
        });
        // Delete the answer
        await answer.deleteOne({ _id: answerId });
        // Remove the answer from the question
        await question_model_1.default.updateMany({ _id: answer.question }, { $pull: { answers: answerId } });
        // Delete related interactions
        await interaction_model_1.default.deleteMany({ answer: answerId });
        res.status(200).json({ success: true, message: 'Answer deleted successfully' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
