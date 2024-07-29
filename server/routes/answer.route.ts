import express from 'express';
import { createAnswer, getAnswers } from '../controllers/answer.controller';
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
  '/get-answers/:questionId',
  // updateAccessToken,
  isAuthenticated,
  getAnswers
);

export default answerRouter;
