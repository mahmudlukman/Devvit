require('dotenv').config();
import UserModel, { IUser } from '../models/user.model';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { NextFunction, Request, Response } from 'express';
import cloudinary from 'cloudinary';
import Question from '../models/question.model';
import { redis } from '../utils/redis';
import { FilterQuery, Schema } from 'mongoose';
import Tag from '../models/tag.model';
import Answer from '../models/answer.model';
import { BadgeCriteriaType } from '../@types';
import { assignBadges } from '../utils/badges';

// get logged in user info
export const getLoggedInUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await UserModel.findById(userId).select('-password');
      const totalQuestions = await Question.countDocuments({
        author: user?._id,
      });
      const totalAnswers = await Answer.countDocuments({ author: user?._id });

      const [questionUpvotes] = await Question.aggregate([
        { $match: { author: user?._id } },
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

      const [answerUpvotes] = await Answer.aggregate([
        { $match: { author: user?._id } },
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

      const [questionViews] = await Answer.aggregate([
        { $match: { author: user?._id } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
          },
        },
      ]);

      const criteria = [
        { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
        { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
        {
          type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
          count: questionUpvotes?.totalUpvotes || 0,
        },
        {
          type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
          count: answerUpvotes?.totalUpvotes || 0,
        },
        {
          type: 'TOTAL_VIEWS' as BadgeCriteriaType,
          count: questionViews?.totalViews || 0,
        },
      ];

      const badgeCounts = assignBadges({ criteria });

      res.status(200).json({
        success: true,
        user,
        totalQuestions,
        totalAnswers,
        badgeCounts,
        reputation: user?.reputation,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

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
// export const getUserInfo = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId } = req.params;
//       const user = await UserModel.findById(userId).select('-password');
//       if (!user) {
//         return next(new ErrorHandler('User not found', 400));
//       }

//       const totalQuestions = await Question.countDocuments({
//         author: user._id,
//       });
//       const totalAnswers = await Answer.countDocuments({ author: user._id });

//       const [questionUpvotes] = await Question.aggregate([
//         { $match: { author: user._id } },
//         {
//           $project: {
//             _id: 0,
//             upvotes: { $size: '$upvotes' },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalUpvotes: { $sum: '$upvotes' },
//           },
//         },
//       ]);

//       const [answerUpvotes] = await Answer.aggregate([
//         { $match: { author: user._id } },
//         {
//           $project: {
//             _id: 0,
//             upvotes: { $size: '$upvotes' },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalUpvotes: { $sum: '$upvotes' },
//           },
//         },
//       ]);

//       const [questionViews] = await Answer.aggregate([
//         { $match: { author: user._id } },
//         {
//           $group: {
//             _id: null,
//             totalViews: { $sum: '$views' },
//           },
//         },
//       ]);

//       const criteria = [
//         { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
//         { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
//         {
//           type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
//           count: questionUpvotes?.totalUpvotes || 0,
//         },
//         {
//           type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
//           count: answerUpvotes?.totalUpvotes || 0,
//         },
//         {
//           type: 'TOTAL_VIEWS' as BadgeCriteriaType,
//           count: questionViews?.totalViews || 0,
//         },
//       ];

//       const badgeCounts = assignBadges({ criteria });

//       res.status(200).json({
//         success: true,
//         user,
//         totalQuestions,
//         totalAnswers,
//         badgeCounts,
//         reputation: user.reputation,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

interface IGetAllUsers {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// get all users
export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        filter,
        searchQuery,
      } = req.query as IGetAllUsers;
      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof UserModel> = {};

      if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
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

      const users = await UserModel.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

      const totalUsers = await UserModel.countDocuments(query);
      const isNext = totalUsers > skipAmount + users.length;

      res.status(200).json({ success: true, users, isNext });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IUpdateUser {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  portfolioWebsite?: string;
  location?: string;
}

export const updateUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, avatar, location, portfolioWebsite } =
        req.body as IUpdateUser;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 400));
      }

      if (name) user.name = name;
      if (username) user.username = username;
      if (bio) user.bio = bio;
      if (portfolioWebsite) user.portfolioWebsite = portfolioWebsite;
      if (location) user.location = location;

      if (avatar) {
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: 'avatar',
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyValue.username) {
          return next(new ErrorHandler('Username already exists', 400));
        }
      }
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all users
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      // get user question ids
      // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

      // delete user questions
      await Question.deleteMany({ author: user._id });

      // TODO: delete user answers, comments, etc.

      await user.deleteOne({ id });

      await redis.del(id);

      res
        .status(200)
        .json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// toggle Save Question
export const toggleSaveQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id
      const { questionId } = req.params;

      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isQuestionSaved = user.saved.includes(questionId as any);

      if (isQuestionSaved) {
        // remove question from saved
        await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { saved: questionId } },
          { new: true }
        );
      } else {
        // add question to saved
        await UserModel.findByIdAndUpdate(
          userId,
          { $addToSet: { saved: questionId } },
          { new: true }
        );
      }

      res.status(200).json({ success: true, message: 'Toggle Successful' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IGetSavedQuestions {
  userId?: Schema.Types.ObjectId;
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// get Saved Questions
export const getSavedQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        page = 1,
        pageSize = 20,
        filter,
        searchQuery,
      } = req.query as IGetSavedQuestions;

      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof Question> = searchQuery
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

      const user = await UserModel.findById(userId).populate({
        path: 'saved',
        match: query,
        options: {
          sort: sortOptions,
          skip: skipAmount,
          limit: pageSize + 1,
        },
        populate: [
          { path: 'tags', model: Tag, select: '_id name' },
          {
            path: 'author',
            model: UserModel,
            select: '_id userId name avatar',
          },
        ],
      });

      const isNext = user?.saved && user.saved.length > pageSize;

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      const savedQuestions = user.saved;

      res
        .status(200)
        .json({ success: true, questions: savedQuestions, isNext });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IGetUserQuestions {
  userId?: Schema.Types.ObjectId;
  page?: number;
  pageSize?: number;
}

// get User Question
export const getUserQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        page = 1,
        pageSize = 10,
      } = req.query as IGetUserQuestions;

      const skipAmount = (page - 1) * pageSize;

      const totalQuestions = await Question.countDocuments({ author: userId });

      const userQuestions = await Question.find({ author: userId })
        .sort({ createdAt: -1, views: -1, upvotes: -1 })
        .skip(skipAmount)
        .limit(pageSize)
        .populate('tags', '_id name')
        .populate('author', '_id userId name avatar');

      const isNextQuestions =
        totalQuestions > skipAmount + userQuestions.length;

      res.status(200).json({
        success: true,
        totalQuestions,
        questions: userQuestions,
        isNextQuestions,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
interface IGetUserAnswers {
  userId?: Schema.Types.ObjectId;
  page?: number;
  pageSize?: number;
}

// get User Question
export const getUserAnswers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, page = 1, pageSize = 10 } = req.query as IGetUserAnswers;

      const skipAmount = (page - 1) * pageSize;

      const totalAnswers = await Answer.countDocuments({ author: userId });

      const userAnswers = await Answer.find({ author: userId })
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
