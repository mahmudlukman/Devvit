require('dotenv').config();
import UserModel, { IUser } from '../models/user.model';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import ejs from 'ejs';
import path from 'path';
import sendMail from '../utils/sendMail';
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from '../utils/jwt';
import { redis } from '../utils/redis';
import cloudinary from 'cloudinary';

// register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler('Email already exist', 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);

      const activationUrl = `http://localhost:3000/new-verification?token=${activationToken}`;

      const data = { user: { name: user.name }, activationUrl };
      const html = await ejs.renderFile(
        path.join(__dirname, '../mails/activation-mail.ejs'),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: 'Activate your account',
          template: 'activation-mail.ejs',
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account!`,
          activationToken: activationToken,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Function to create an activation token
export const createActivationToken = (user: any): string => {
  const token = jwt.sign({ user }, process.env.ACTIVATION_SECRET as Secret, {
    expiresIn: '5m',
  });
  return token;
};

// activate user
interface IActivationRequest {
  activation_token: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token } =
        req.body as IActivationRequest;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser };

      if (!newUser) {
        return next(new ErrorHandler('Invalid token', 400));
      }
      const { name, email, password } = newUser.user;

      let user = await UserModel.findOne({ email });

      if (user) {
        return next(new ErrorHandler('User already exist', 400));
      }

      const userNameWithoutSpace = name.replace(/\s/g, '');

      const uniqueNumber = Math.floor(Math.random() * 1000);

      user = await UserModel.create({
        name,
        email,
        password,
        username: `${userNameWithoutSpace}${uniqueNumber}`,
      });
      res.status(201).json({ success: true, message: "Email verified & user created successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
      }
      const user = await UserModel.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler('Invalid credentials', 400));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid credentials', 400));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });
      const userId = req.user?._id || '';
      redis.del(userId);
      res
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// social auth
interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const user = await UserModel.findOne({ email });
      if (!user) {
        const newUser = await UserModel.create({ email, name, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// forgot password
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        return next(new ErrorHandler('Please provide a valid email!', 400));
      }

      const emailLowerCase = email.toLowerCase();
      const user = await UserModel.findOne({ email: emailLowerCase });
      if (!user) {
        return next(new ErrorHandler('User not found, invalid request!', 400));
      }

      const resetToken = createActivationToken(user);

      const resetUrl = `http://localhost:3000/reset?token=${resetToken}&id=${user._id}`;

      const data = { user: { name: user.name }, resetUrl };
      const html = await ejs.renderFile(
        path.join(__dirname, '../mails/forgot-password-mail.ejs'),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: 'Reset your password',
          template: 'forgot-password-mail.ejs',
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to reset your password!`,
          resetToken: resetToken,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user password
interface IResetPassword {
  newPassword: string;
}
// forgot password
export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body as IResetPassword;
      const { id } = req.query as any;

      if (!id) {
        return next(new ErrorHandler('No user ID provided!', 400));
      }

      const user = await UserModel.findById(id).select('+password');

      if (!user) {
        return next(new ErrorHandler('user not found!', 400));
      }

      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword)
        return next(
          new ErrorHandler(
            'New password must be different from the previous one!',
            400
          )
        );

      if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
        return next(
          new ErrorHandler(
            'Password must be between at least 6 characters!',
            400
          )
        );
      }

      user.password = newPassword.trim();
      await user.save();

      res.status(201).json({
        success: true,
        message: `Password Reset Successfully', 'Now you can login with new password!`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// update access token
export const updateAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = 'Could not refresh token';
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(new ErrorHandler("Please login to access this resource", 400));
      }
      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: '5m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: '3d' }
      );

      req.user = user;

      res.cookie('access_token', accessToken, accessTokenOptions);
      res.cookie('refresh_token', refreshToken, refreshTokenOptions);

      res.status(200).json({status:"success", accessToken})

      // await redis.set(user._id, JSON.stringify(user), "EX", 604800) // 7 days

      // next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
