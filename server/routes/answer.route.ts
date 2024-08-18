import express from 'express';
import {
  createAnswer,
  // downvoteAnswers,
  getAnswers,
  toggleVoteAnswer,
  // upvoteAnswers,
} from '../controllers/answer.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const answerRouter = express.Router();

answerRouter.post(
  '/create-answer',
  // updateAccessToken,
  isAuthenticated,
  createAnswer
);

answerRouter.get(
  '/answers/:questionId',
  // updateAccessToken,
  isAuthenticated,
  getAnswers
);

// answerRouter.put(
//   '/upvote-answer',
//   // updateAccessToken,
//   isAuthenticated,
//   upvoteAnswers
// );
// answerRouter.put(
//   '/downvote-answer',
//   // updateAccessToken,
//   isAuthenticated,
//   downvoteAnswers
// );

answerRouter.put(
  '/vote-answer',
  // updateAccessToken,
  isAuthenticated,
  toggleVoteAnswer
);

export default answerRouter;
