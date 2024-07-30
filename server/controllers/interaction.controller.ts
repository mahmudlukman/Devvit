import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import Interaction from '../models/interaction.model';

// view question
export const viewQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId, userId } = req.body;

      // Update view count for the question
      await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

      if (userId) {
        const existingInteraction = await Interaction.findOne({
          user: userId,
          action: 'view',
          question: questionId,
        });

        if (existingInteraction)
          return next(
            new ErrorHandler('User has already viewed', 400)
          );

        // Create interaction
        await Interaction.create({
          user: userId,
          action: 'view',
          question: questionId,
        });
      }

      res
        .status(200)
        .json({ success: true, message: 'Question view successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
