import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import Answer from '../models/answer.model';
import { Schema } from 'mongoose';
import Interaction from '../models/interaction.model';
import UserModel from '../models/user.model';

interface ICreateAnswer {
  content: string;
  question: Schema.Types.ObjectId;
}
// create answer
export const createAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user
      const { content, question } = req.body as ICreateAnswer;

      if (!content || !question) {
        return next(
          new ErrorHandler('Content and question ID are required', 400)
        );
      }

      const newAnswer = await Answer.create({
        content,
        question,
        author: req.user?._id,
      });

      // Add the answer to the question's answers array
      const questionObject = await Question.findByIdAndUpdate(question, {
        $push: { answers: newAnswer._id },
      });

      await Interaction.create({
        user: author,
        action: 'answer',
        question,
        answer: newAnswer._id,
        tags: questionObject?.tags,
      });

      await UserModel.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

      res.status(200).json({ success: true, newAnswer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IGetAnswers {
  questionId?: Schema.Types.ObjectId;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}
// get answers
export const getAnswers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        questionId,
        sortBy,
        page = 1,
        pageSize = 10,
      } = req.query as IGetAnswers;

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

      const answers = await Answer.find({ question: questionId })
        .populate('author', '_id name avatar')
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

      const totalAnswer = await Answer.countDocuments({
        question: questionId,
      });

      const isNextAnswer = totalAnswer > skipAmount + answers.length;

      res.status(200).json({ success: true, answers, isNextAnswer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IVoteAnswers {
  answerId: Schema.Types.ObjectId;
  hasupVoted: Boolean;
  hasdownVoted: Boolean;
}

// upvote answers
export const upvoteAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { answerId } = req.params;

      const answer = await Answer.findById(answerId);

      if (!answer) {
        return next(new ErrorHandler('Answer not found', 400));
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
      } else {
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
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: reputationChange },
      });

      // Update question author's reputation
      await UserModel.findByIdAndUpdate(answer.author, {
        $inc: { reputation: authorReputationChange },
      });

      res.status(200).json({ success: true, answer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// export const upvoteAnswers = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userId = req.user?._id
//       const { answerId, hasupVoted, hasdownVoted } =
//         req.body as IVoteAnswers;

//       let updateQuery = {};

//       if (hasupVoted) {
//         updateQuery = { $pull: { upvotes: userId } };
//       } else if (hasdownVoted) {
//         updateQuery = {
//           $pull: { downvotes: userId },
//           $push: { upvotes: userId },
//         };
//       } else {
//         updateQuery = { $addToSet: { upvotes: userId } };
//       }

//       const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
//         new: true,
//       });

//       if (!answer) {
//         return next(new ErrorHandler('Answer not found', 400));
//       }

//       // Increment author's reputation
//       await UserModel.findByIdAndUpdate(userId, {
//         $inc: { reputation: hasupVoted ? -2 : 2 },
//       });

//       await UserModel.findByIdAndUpdate(answer.author, {
//         $inc: { reputation: hasupVoted ? -10 : 10 },
//       });

//       res.status(200).json({ success: true, answer });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// down vote answers
export const downvoteAnswers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id
      const { answerId, hasupVoted, hasdownVoted } =
        req.body as IVoteAnswers;

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

      const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
        new: true,
      });

      if (!answer) {
        return next(new ErrorHandler('Answer not found', 400));
      }

      // Increment author's reputation
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: hasdownVoted ? -2 : 2 },
      });

      await UserModel.findByIdAndUpdate(answer.author, {
        $inc: { reputation: hasdownVoted ? -10 : 10 },
      });
      res.status(200).json({ success: true, answer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete answers
export const deleteAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answerId } = req.params;

      const answer = await Answer.findById(answerId);

      if (!answer) {
        return next(new ErrorHandler('Answer not found!', 400));
      }

      await answer.deleteOne({ _id: answerId });
      await Question.updateMany(
        { _id: answer.question },
        { $pull: { answers: answerId } }
      );
      await Interaction.deleteMany({ answer: answerId });
      res.status(200).json({ success: true, answer });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
