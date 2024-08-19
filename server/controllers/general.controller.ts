import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import Interaction from '../models/interaction.model';
import Answer from '../models/answer.model';
import Tag from '../models/tag.model';
import UserModel from '../models/user.model';

const SearchableTypes = ['question', 'answer', 'user', 'tag'];

// global search
export const globalSearch = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, type } = req.query;
      const regexQuery = { $regex: query, $options: 'i' };

      let results = [];

      const modelsAndTypes = [
        { model: Question, searchField: 'title', type: 'question' },
        { model: UserModel, searchField: 'name', type: 'user' },
        { model: Answer, searchField: 'content', type: 'answer' },
        { model: Tag, searchField: 'name', type: 'tag' },
      ];

      const typeLower = type?.toLowerCase();

      if (!typeLower || !SearchableTypes.includes(typeLower)) {
        // SEARCH ACROSS EVERYTHING

        for (const { model, searchField, type } of modelsAndTypes) {
          const queryResults = await model
            .find({ [searchField]: regexQuery })
            .limit(2);

          results.push(
            ...queryResults.map((item: any) => ({
              title:
                type === 'answer'
                  ? `Answers containing ${query}`
                  : item[searchField],
              type,
              id:
                type === 'user'
                  ? item.clerkid
                  : type === 'answer'
                  ? item.question
                  : item._id,
            }))
          );
        }
      } else {
        // SEARCH IN THE SPECIFIED MODEL TYPE
        const modelInfo = modelsAndTypes.find((item) => item.type === type);

        console.log({ modelInfo, type });
        if (!modelInfo) {
          throw new Error('Invalid search type');
        }

        const queryResults = await modelInfo.model
          .find({ [modelInfo.searchField]: regexQuery })
          .limit(8);

        results = queryResults.map((item: any) => ({
          title:
            type === 'answer'
              ? `Answers containing ${query}`
              : item[modelInfo.searchField],
          type,
          id:
            type === 'user'
              ? item.clerkId
              : type === 'answer'
              ? item.question
              : item._id,
        }));
      }

      res.status(200).json({ success: true, results });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
