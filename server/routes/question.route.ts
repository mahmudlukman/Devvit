import express from 'express';
import {
  createQuestion,
  deleteQuestion,
  downvoteQuestion,
  editQuestion,
  getHotQuestions,
  getQuestionById,
  getQuestions,
  getRecommendedQuestions,
  // toggleVoteQuestion,
  upvoteQuestion,
} from '../controllers/question.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const questionRouter = express.Router();

questionRouter.get(
  '/questions',
  getQuestions
);

questionRouter.post(
  '/create-question',
  // updateAccessToken,
  isAuthenticated,
  createQuestion
);

questionRouter.get(
  '/question/:questionId',
  getQuestionById
);

questionRouter.put(
  '/downvote-question',
  // updateAccessToken,
  isAuthenticated,
  downvoteQuestion
);

questionRouter.put(
  '/upvote-question',
  // updateAccessToken,
  isAuthenticated,
  upvoteQuestion
);

questionRouter.delete(
  '/delete-question/:questionId',
  // updateAccessToken,
  isAuthenticated,
  deleteQuestion
);

questionRouter.put(
  '/edit-question/:questionId',
  // updateAccessToken,
  isAuthenticated,
  editQuestion
);

questionRouter.get(
  '/hot-questions',
  getHotQuestions
);

questionRouter.get(
  '/recommended-questions',
  // updateAccessToken,
  isAuthenticated,
  getRecommendedQuestions
);

export default questionRouter;
