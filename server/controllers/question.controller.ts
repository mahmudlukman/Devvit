import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import { IUser } from '../models/user.model';
import { Schema } from 'mongoose';

// get questions
export const getQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questions = await Question.find({})
        .populate({ path: 'tags', model: Tag })
        .populate({ path: 'author', model: User })
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, questions });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface ICreateQuestion {
  title: string;
  content: string;
  tags: string[];
  author: Schema.Types.ObjectId | IUser;
  path: string;
}

// create questions
export const createQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, tags, author, path } =
        req.body as ICreateQuestion;
      // Create the question
      const question = await Question.create({
        title,
        content,
        author,
      });

      const tagDocuments = [];

      // Create the tags or get them if they already exist
      for (const tag of tags) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
          { $setOnInsert: { name: tag }, $push: { questions: question._id } },
          { upsert: true, new: true }
        );

        tagDocuments.push(existingTag._id);
      }

      await Question.findByIdAndUpdate(question._id, {
        $push: { tags: { $each: tagDocuments } },
      });

      // Create an interaction record for the user's ask_question action

      // Increment author's reputation by +5 for creating a question
      res.status(200).json({
        success: true,
        message: 'Question created successfully',
        question,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
