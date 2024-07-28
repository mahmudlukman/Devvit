import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import UserModel from '../models/user.model';
import { FilterQuery, Schema } from 'mongoose';
import Tag, { ITag } from '../models/tag.model';

// get Top Interacted Tags
export const getTopInteractedTags = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 400));
      }
      // Find interactions for the user and group by tags...
      // Interaction...
      const topInteractedTags = [
        { _id: '1', name: 'tag' },
        { _id: '2', name: 'tag2' },
      ];
      res.status(200).json({ success: true, topInteractedTags });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all tags
export const getAllTags = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await UserModel.find({});

      if (!tags) {
        return next(new ErrorHandler('Tags not found', 400));
      }

      res.status(200).json({ success: true, tags });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IGetQuestionsByTagId {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

// create questions
export const getQuestionsByTagId = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;
      const {
        page = 1,
        pageSize = 10,
        searchQuery,
      } = req.query as IGetQuestionsByTagId;

      const tagFilter: FilterQuery<ITag> = { _id: tagId };

      const tag = await Tag.findOne(tagFilter).populate({
        path: 'questions',
        model: Question,
        match: searchQuery
          ? { title: { $regex: searchQuery, $options: 'i' } }
          : {},
        options: {
          sort: { createdAt: -1 },
          skip: (Number(page) - 1) * Number(pageSize),
          limit: Number(pageSize),
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

      const questions = tag.questions;
      res.status(201).json({
        success: true,
        tagTitle: tag.name,
        questions,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


