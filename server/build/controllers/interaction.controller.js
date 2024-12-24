"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewQuestion = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const question_model_1 = __importDefault(require("../models/question.model"));
const interaction_model_1 = __importDefault(require("../models/interaction.model"));
// view question
exports.viewQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { questionId } = req.params;
        // Update view count for the question
        await question_model_1.default.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
        if (userId) {
            const existingInteraction = await interaction_model_1.default.findOne({
                user: userId,
                action: 'view',
                question: questionId,
            });
            if (existingInteraction)
                return next(new errorHandler_1.default('User has already viewed', 400));
            // Create interaction
            await interaction_model_1.default.create({
                user: userId,
                action: 'view',
                question: questionId,
            });
        }
        res
            .status(200)
            .json({ success: true, message: 'Question view successfully' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
