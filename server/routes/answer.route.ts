import express from 'express';
import {
  createAnswer,
  deleteAnswer,
  downvoteAnswer,
  getAnswers,
  upvoteAnswer,
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
  '/upvote-answer/:answerId',
  updateAccessToken,
  isAuthenticated,
  upvoteAnswer
);
answerRouter.put(
  '/downvote-answer/:answerId',
  updateAccessToken,
  isAuthenticated,
  downvoteAnswer
);

answerRouter.delete(
  '/delete-answer/:answerId',
  updateAccessToken,
  isAuthenticated,
  deleteAnswer
);


export default answerRouter;
