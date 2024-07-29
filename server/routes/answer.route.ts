import express from 'express';
import { createAnswer } from '../controllers/answer.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const answerRouter = express.Router();

answerRouter.get(
  '/create-answer',
  // updateAccessToken,
  isAuthenticated,
  createAnswer
);

answerRouter.get(
  '/get-tags',
  // updateAccessToken,
  isAuthenticated,
);


export default answerRouter;
