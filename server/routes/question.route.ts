import express from 'express';
import {
  createQuestion,
  downvoteQuestion,
  getQuestionById,
  getQuestions,
  upvoteQuestion,
} from '../controllers/question.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const questionRouter = express.Router();

questionRouter.get(
  '/get-questions',
  // updateAccessToken,
  isAuthenticated,
  getQuestions
);

questionRouter.post(
  '/create-question',
  // updateAccessToken,
  isAuthenticated,
  createQuestion
);

questionRouter.get(
  '/get-question/:id',
  // updateAccessToken,
  isAuthenticated,
  getQuestionById
);

questionRouter.put(
  '/downvote',
  // updateAccessToken,
  isAuthenticated,
  downvoteQuestion
);

questionRouter.put(
  '/upvote',
  // updateAccessToken,
  isAuthenticated,
  upvoteQuestion
);

export default questionRouter;
