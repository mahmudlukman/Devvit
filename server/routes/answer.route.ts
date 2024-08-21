import express from 'express';
import {
  createAnswer,
  deleteAnswer,
  downvoteAnswers,
  getAnswers,
  upvoteAnswers,
} from '../controllers/answer.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const answerRouter = express.Router();

answerRouter.post(
  '/create-answer',
  updateAccessToken,
  isAuthenticated,
  createAnswer
);

answerRouter.get(
  '/answers',
  getAnswers
);

answerRouter.put(
  '/upvote-answer',
  updateAccessToken,
  isAuthenticated,
  upvoteAnswers
);
answerRouter.put(
  '/downvote-answer',
  updateAccessToken,
  isAuthenticated,
  downvoteAnswers
);

answerRouter.delete(
  '/delete-answer/:answerId',
  updateAccessToken,
  isAuthenticated,
  deleteAnswer
);


export default answerRouter;
