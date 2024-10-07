import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import UserModel from '../models/user.model';
import { FilterQuery, Schema, Types } from 'mongoose';
import Tag, { ITag } from '../models/tag.model';

// get Top Interacted Tags
export const getTopInteractedTags = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId;

      if (!userId || typeof userId !== 'string') {
        return next(new ErrorHandler('Valid user ID is required', 400));
      }

      if (!Types.ObjectId.isValid(userId)) {
        return next(new ErrorHandler('Invalid user ID format', 400));
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      const interactedQuestions = await Question.aggregate([
        {
          $match: {
            $or: [
              { author: new Types.ObjectId(userId) },
              { answers: { $elemMatch: { author: new Types.ObjectId(userId) } } },
              { upvotes: new Types.ObjectId(userId) },
              { downvotes: new Types.ObjectId(userId) }
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// export const getTopInteractedTags = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId } = req.query;

//       const user = await UserModel.findById(userId);

//       if (!user) {
//         return next(new ErrorHandler('User not found', 400));
//       }
//       // Find interactions for the user and group by tags...
//       // Interaction...
//       const topInteractedTags = [
//         { _id: '1', name: 'tag' },
//         { _id: '2', name: 'tag2' },
//       ];
//       res.status(200).json({ success: true, topInteractedTags });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

interface IGetAllTags {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// get all tags
export const getAllTags = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        searchQuery,
        filter,
        page = 1,
        pageSize = 10,
      } = req.query as IGetAllTags;

      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof Tag> = {};

      if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
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

      const totalTags = await Tag.countDocuments(query);

      const tags = await Tag.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

      const isNext = totalTags > skipAmount + tags.length;

      res.status(200).json({ success: true, tags, isNext });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IGetQuestionsByTagId {
  tagId: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

// create questions
export const getQuestionsByTagId = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        tagId,
        page = 1,
        pageSize = 10,
        searchQuery,
      } = req.query as unknown as IGetQuestionsByTagId;

      const skipAmount = (page - 1) * pageSize;

      const tagFilter: FilterQuery<ITag> = { _id: tagId };

      const tag = await Tag.findOne(tagFilter).populate({
        path: 'questions',
        model: Question,
        match: searchQuery
          ? { title: { $regex: searchQuery, $options: 'i' } }
          : {},
        options: {
          sort: { createdAt: -1 },
          skip: skipAmount,
          limit: pageSize + 1, // +1 to check if there is next page
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

      if (!tag) {
        return next(new ErrorHandler('Tag not found', 400));
      }

      const isNext = tag.questions.length > pageSize;

      const questions = tag.questions;
      res.status(201).json({
        success: true,
        tagTitle: tag.name,
        questions,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get Top Popular Tags
export const getTopPopularTags = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const popularTags = await Tag.aggregate([
        { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
        { $sort: { numberOfQuestions: -1 } },
        { $limit: 5 },
      ]);
      res.status(200).json({ success: true, popularTags });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
