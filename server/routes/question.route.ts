import express from 'express';
import {
  createQuestion,
  downvoteQuestion,
  getQuestionById,
  getQuestions,
  // toggleVoteQuestion,
  upvoteQuestion,
} from '../controllers/question.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';
const questionRouter = express.Router();

questionRouter.get(
  '/questions',
  // updateAccessToken,
  // isAuthenticated,
  getQuestions
);

questionRouter.post(
  '/create-question',
  // updateAccessToken,
  isAuthenticated,
  createQuestion
);

questionRouter.get(
  '/question/:id',
  // updateAccessToken,
  isAuthenticated,
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

// questionRouter.put(
//   '/vote-question',
//   // updateAccessToken,
//   isAuthenticated,
//   toggleVoteQuestion
// );

export default questionRouter;
