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
  author: string;
  tags: string[];
}

// create questions
export const createQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, author, tags } = req.body as ICreateQuestion;
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

interface IVoteQuestion {
  questionId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hasupVoted: Boolean;
  hasdownVoted: Boolean;
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

      // Increment author's reputation by +1/-1 for upvoting/revoking an upvote to the question
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: hasupVoted ? -1 : 1 },
      });

      // Increment author's reputation by +10/-10 for recieving an upvote/downvote to the question
      await UserModel.findByIdAndUpdate(question.author, {
        $inc: { reputation: hasupVoted ? -10 : 10 },
      });

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

      // Increment author's reputation
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { reputation: hasdownVoted ? -2 : 2 },
      });

      await UserModel.findByIdAndUpdate(question.author, {
        $inc: { reputation: hasdownVoted ? -10 : 10 },
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

      const question = await Question.findById(questionId)

      if(!questionId){
        return next(new ErrorHandler("Question not found!", 400));
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
      
      // question.title = title;
      // question.content = content;

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

      const user = await UserModel.findOne({ userId });

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
