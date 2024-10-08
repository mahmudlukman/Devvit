import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import UserModel, { IUser } from '../models/user.model';
import { FilterQuery, Schema } from 'mongoose';
import Tag from '../models/tag.model';
import Interaction from '../models/interaction.model';
import Answer from '../models/answer.model';

interface IGetQuestions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  filter?: string;
}
// get questions
export const getQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        searchQuery,
        filter,
        page = 1,
        pageSize = 10,
      } = req.query as IGetQuestions;

      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof Question> = {};

      if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
        query.$or = [
          { title: { $regex: new RegExp(escapedSearchQuery, 'i') } },
          { content: { $regex: new RegExp(escapedSearchQuery, 'i') } },
        ];
      }

      let sortOptions = {};

      switch (filter) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'frequent':
          sortOptions = { views: -1 };
          break;
        case 'unanswered':
          query.answers = { $size: 0 };
          break;
        default:
          break;
      }
      const questions = await Question.find(query)
        .populate({ path: 'tags', model: Tag })
        .populate({ path: 'author', model: UserModel })
        .skip(skipAmount)
        .limit(pageSize)
        .sort(sortOptions);

      const totalQuestions = await Question.countDocuments(query);

      const isNext = totalQuestions > skipAmount + questions.length;

      res.status(200).json({ success: true, questions, isNext });
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
      const author = req.user;
      const { title, content, tags } = req.body as ICreateQuestion;
      // Create the question
      const question = await Question.create({
        title,
        content,
        author: req.user?._id,
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
      await Interaction.create({
        user: author,
        action: 'ask_question',
        question: question._id,
        tags: tagDocuments,
      });

      // Increment author's reputation by +5 for creating a question
      await UserModel.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

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
      const { questionId } = req.params;
      const question = await Question.findById(questionId)
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


// upvote questions
export const upvoteQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionId } = req.params;

      const question = await Question.findById(questionId);

      if (!question) {
        return next(new ErrorHandler('Question not found', 400));
      }

      const userIdString = userId.toString();
      const isUpvoted = question.upvotes.map(id => id.toString()).includes(userIdString);
      const isDownvoted = question.downvotes.map(id => id.toString()).includes(userIdString);

      let reputationChange;
      let authorReputationChange;

      if (isUpvoted) {
        // Remove upvote
        question.upvotes = question.upvotes.filter(id => id.toString() !== userIdString);
        reputationChange = -1;
        authorReputationChange = -10;
      } else {
        // Add upvote
        question.upvotes.push(userId);
        reputationChange = 1;
        authorReputationChange = 10;
        
        // Remove downvote if exists
        if (isDownvoted) {
          question.downvotes = question.downvotes.filter(id => id.toString() !== userIdString);
          reputationChange += 2;
          authorReputationChange += 10;
        }
      }

      await question.save();

      // Update user's reputation
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: reputationChange },
      });

      // Update question author's reputation
      await UserModel.findByIdAndUpdate(question.author, {
        $inc: { reputation: authorReputationChange },
      });

      res.status(200).json({ success: true, question });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// downvote questions
export const downvoteQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionId } = req.params;

      const question = await Question.findById(questionId);

      if (!question) {
        return next(new ErrorHandler('Question not found', 400));
      }

      const userIdString = userId.toString();
      const isUpvoted = question.upvotes.map(id => id.toString()).includes(userIdString);
      const isDownvoted = question.downvotes.map(id => id.toString()).includes(userIdString);

      let reputationChange = 0;
      let authorReputationChange = 0;

      if (isDownvoted) {
        // Remove downvote
        question.downvotes = question.downvotes.filter(id => id.toString() !== userIdString);
        reputationChange = 2;
        authorReputationChange = 10;
      } else {
        // Add downvote
        question.downvotes.push(userId);
        reputationChange = -2;
        authorReputationChange = -10;

        // Remove upvote if exists
        if (isUpvoted) {
          question.upvotes = question.upvotes.filter(id => id.toString() !== userIdString);
          reputationChange -= 1;
          authorReputationChange -= 10;
        }
      }

      await question.save();

      // Update user's reputation
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: reputationChange },
      });

      // Update question author's reputation
      await UserModel.findByIdAndUpdate(question.author, {
        $inc: { reputation: authorReputationChange },
      });

      res.status(200).json({ success: true, question });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete question
export const deleteQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;

      const question = await Question.findById(questionId);

      if (!question) {
        return next(new ErrorHandler('Question not found!', 400));
      }

      await Question.deleteOne({ _id: questionId });
      await Answer.deleteMany({ question: questionId });
      await Interaction.deleteMany({ question: questionId });
      await Tag.updateMany(
        { questions: questionId },
        { $pull: { questions: questionId } }
      );
      res
        .status(200)
        .json({ success: true, message: 'Question Deleted Successfully!' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// edit question
export const editQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;
      const { title, content } = req.body;

      const question = await Question.findById(questionId).populate('tags');

      if (!question) {
        throw new Error('Question not found');
      }

      if (title) question.title = title;
      if (content) question.content = content;

      await question.save();
      res.status(200).json({
        success: true,
        message: 'Question Updated Successfully!',
        question,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get hot question
export const getHotQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotQuestions = await Question.find({})
        .sort({ views: -1, upvotes: -1 })
        .limit(5);
      res.status(200).json({
        success: true,
        hotQuestions,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IRecommendedQuestions {
  userId?: Schema.Types.ObjectId;
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// get recommended question
export const getRecommendedQuestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        page = 1,
        pageSize = 20,
        searchQuery,
      } = req.query as IRecommendedQuestions;

      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler('user not found', 400));
      }

      const skipAmount = (page - 1) * pageSize;

      // Find the user's interactions
      const userInteractions = await Interaction.find({ user: user._id })
        .populate('tags')
        .exec();

      // Extract tags from user's interactions
      const userTags = userInteractions.reduce(
        (tags: Schema.Types.ObjectId[], interaction) => {
          if (interaction.tags) {
            tags = tags.concat(interaction.tags);
          }
          return tags;
        },
        []
      );

      // Get distinct tag IDs from user's interactions
      const distinctUserTagIds = [
        // @ts-ignore
        ...new Set(userTags.map((tag: any) => tag._id)),
      ];

      const query: FilterQuery<typeof Question> = {
        $and: [
          { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
          { author: { $ne: user._id } }, // Exclude user's own questions
        ],
      };

      if (searchQuery) {
        query.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      const totalQuestions = await Question.countDocuments(query);

      const recommendedQuestions = await Question.find(query)
        .populate({
          path: 'tags',
          model: Tag,
        })
        .populate({
          path: 'author',
          model: UserModel,
        })
        .skip(skipAmount)
        .limit(pageSize);

      const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

      res.status(200).json({
        success: true,
        questions: recommendedQuestions,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
