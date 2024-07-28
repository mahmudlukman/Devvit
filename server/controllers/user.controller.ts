require('dotenv').config();
import UserModel, { IUser } from '../models/user.model';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { NextFunction, Request, Response } from 'express';
import cloudinary from 'cloudinary';
import { redis } from '../utils/redis';

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
interface IGetAllUsersRequest {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// get all users
export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const { page = 1, pageSize = 20, filter, searchQuery } = req.params as IGetAllUsersRequest;

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
