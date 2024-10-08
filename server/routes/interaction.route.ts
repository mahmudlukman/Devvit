import express from 'express';
import { viewQuestion } from '../controllers/interaction.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const interactionRouter = express.Router();

interactionRouter.get(
  '/view-question/:questionId',
  updateAccessToken,
  isAuthenticated,
  viewQuestion
);

export default interactionRouter;
