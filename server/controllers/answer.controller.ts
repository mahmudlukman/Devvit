import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import Answer from '../models/answer.model';

// create answer
export const createAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content, question } = req.body;

      if (!content || !question) {
        return next(
          new ErrorHandler('Content and question ID are required', 400)
        );
      }

      const newAnswer = await Answer.create({
        content,
        question,
        author: req.user,
      });

      await Question.findByIdAndUpdate(question, {
        $push: { answers: newAnswer._id },
      });

      res.status(200).json({ success: true, newAnswer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get answers
export const getAnswers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;

      const answers = await Answer.find({ question: questionId })
        .populate('author', '_id name username avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, answers });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
