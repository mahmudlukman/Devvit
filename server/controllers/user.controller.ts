require('dotenv').config();
import UserModel, { IUser } from '../models/user.model';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { NextFunction, Request, Response } from 'express';
import cloudinary from 'cloudinary';
import { redis } from '../utils/redis';
import { FilterQuery } from 'mongoose';

// get logged in user info
export const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await UserModel.findById(userId).select('-password');
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user info
export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const user = await UserModel.findById(id).select('-password');
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
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
      // const { page = 1, pageSize = 20, filter, searchQuery } = req.params as IGetAllUsers;

      const users = await UserModel.find({}).sort({ createdAt: -1 });

      res.status(200).json({ success: true, users });
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
      // await Question.deleteMany({ author: user._id });

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
      const { userId, questionId } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isQuestionSaved = user.saved.includes(questionId);

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

// get Saved Questions
export const getSavedQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        page = 1,
        pageSize = 10,
        filter,
        searchQuery,
      } = req.params;

      const query: FilterQuery<typeof Question> = searchQuery
        ? { title: { $regex: new RegExp(searchQuery, 'i') } }
        : {};

      const user = await UserModel.findOne({ userId }).populate({
        path: 'saved',
        match: query,
        options: {
          sort: { createdAt: -1 },
        },
        populate: [
          { path: 'tags', model: Tag, select: '_id name' },
          { path: 'author', model: User, select: '_id userId name avatar' },
        ],
      });

      if (!user) {
        throw new Error('User not found');
      }

      const savedQuestions = user.saved;

      res.status(200).json({ success: true, message: 'Toggle Successful' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
