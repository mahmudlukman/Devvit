import { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import Question from '../models/question.model';
import Answer from '../models/answer.model';
import Tag from '../models/tag.model';
import UserModel from '../models/user.model';

const SEARCHABLE_TYPES = ['question', 'answer', 'user', 'tag'] as const;
type SearchableType = typeof SEARCHABLE_TYPES[number];

interface SearchConfig {
  model: any;
  searchField: string;
  type: SearchableType;
  idField: string;
  titleField: string;
}

const SEARCH_CONFIGS: SearchConfig[] = [
  { model: Question, searchField: 'title', type: 'question', idField: '_id', titleField: 'title' },
  { model: UserModel, searchField: 'name', type: 'user', idField: 'userId', titleField: 'name' },
  { model: Answer, searchField: 'content', type: 'answer', idField: 'question', titleField: 'content' },
  { model: Tag, searchField: 'name', type: 'tag', idField: '_id', titleField: 'name' },
];

export const globalSearch = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, type } = req.query;
    
    if (typeof query !== 'string' || query.trim() === '') {
      return next(new ErrorHandler('Invalid search query', 400));
    }

    const searchType = type as SearchableType | undefined;
    
    if (searchType && !SEARCHABLE_TYPES.includes(searchType)) {
      return next(new ErrorHandler('Invalid search type', 400));
    }

    const regexQuery = { $regex: query, $options: 'i' };
    const configsToSearch = searchType 
      ? SEARCH_CONFIGS.filter(config => config.type === searchType)
      : SEARCH_CONFIGS;

    try {
      const results = await Promise.all(
        configsToSearch.map(async (config) => {
          const items = await config.model
            .find({ [config.searchField]: regexQuery })
            .limit(searchType ? 8 : 2);

          return items.map((item: any) => ({
            title: config.type === 'answer' ? `Answer containing "${query}"` : item[config.titleField],
            type: config.type,
            id: item[config.idField],
          }));
        })
      );

      res.status(200).json({ 
        success: true, 
        results: results.flat() 
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);