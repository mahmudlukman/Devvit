import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import UserModel, { IUser } from '../models/user.model';
import { Schema } from 'mongoose';
import Tag from '../models/tag.model';

// get questions
export const getQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questions = await Question.find({})
        .populate({ path: 'tags', model: Tag })
        .populate({ path: 'author', model: UserModel })
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, questions });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ICreateQuestion {
  title: string;
  content: string;
  tags: string[];
}

// create questions
export const createQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, tags } = req.body as ICreateQuestion;
      // Create the question
      const question = await Question.create({
        title,
        content,
        author: req.user,
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
      res.status(201).json({
        success: true,
        question,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get questions by id
export const getQuestionById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const question = await Question.findById(id)
        .populate({ path: 'tags', model: Tag, select: '_id name' })
        .populate({
          path: 'author',
          model: UserModel,
          select: '_id userId name avatar',
        });
      res.status(200).json({ success: true, question });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IVoteQuestion {
  questionId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hasupVoted: Boolean,
  hasdownVoted: Boolean,
}

// upvote questions
export const upvoteQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId, userId, hasupVoted, hasdownVoted } =
        req.body as IVoteQuestion;

      let updateQuery = {};

      if (hasupVoted) {
        updateQuery = { $pull: { upvotes: userId } };
      } else if (hasdownVoted) {
        updateQuery = {
          $pull: { downvotes: userId },
          $push: { upvotes: userId },
        };
      } else {
        updateQuery = { $addToSet: { upvotes: userId } };
      }

      const question = await Question.findByIdAndUpdate(
        questionId,
        updateQuery,
        { new: true }
      );

      if (!question) {
        return next(new ErrorHandler('Question not found', 400));
      }
      res.status(200).json({ success: true, question });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// upvote questions
export const downvoteQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId, userId, hasupVoted, hasdownVoted } =
        req.body as IVoteQuestion;

      let updateQuery = {};

      if (hasdownVoted) {
        updateQuery = { $pull: { downvote: userId } };
      } else if (hasupVoted) {
        updateQuery = {
          $pull: { upvotes: userId },
          $push: { downvotes: userId },
        };
      } else {
        updateQuery = { $addToSet: { downvotes: userId } };
      }

      const question = await Question.findByIdAndUpdate(
        questionId,
        updateQuery,
        { new: true }
      );

      if (!question) {
        return next(new ErrorHandler('Question not found', 400));
      }
      res.status(200).json({ success: true, question });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// export const toggleVoteQuestion = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { questionId, userId } = req.body as IVoteQuestion;

//       const question = await Question.findById(questionId);

//       if (!question) {
//         return next(new ErrorHandler('Question not found', 404));
//       }

//       const hasUpvoted = question.upvotes.includes(userId);
//       const hasDownvoted = question.downvotes.includes(userId);

//       let updateQuery = {};

//       if (hasUpvoted) {
//         // If already upvoted, remove upvote and add downvote
//         updateQuery = {
//           $pull: { upvotes: userId },
//           $addToSet: { downvotes: userId }
//         };
//       } else if (hasDownvoted) {
//         // If already downvoted, remove downvote and add upvote
//         updateQuery = {
//           $pull: { downvotes: userId },
//           $addToSet: { upvotes: userId }
//         };
//       } else {
//         // If neither upvoted nor downvoted, add upvote
//         updateQuery = { $addToSet: { upvotes: userId } };
//       }

//       const updatedQuestion = await Question.findByIdAndUpdate(
//         questionId,
//         updateQuery,
//         { new: true }
//       );

//       res.status(200).json({ success: true, question: updatedQuestion });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
