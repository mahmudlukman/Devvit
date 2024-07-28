import express from 'express';
import { getAllTags, getQuestionsByTagId, getTopInteractedTags } from '../controllers/tag.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const tagRouter = express.Router();

tagRouter.get(
  '/get-top-tags/:id',
  updateAccessToken,
  isAuthenticated,
  getTopInteractedTags
);

tagRouter.post(
  '/get-tags',
  updateAccessToken,
  isAuthenticated,
  getAllTags
);

tagRouter.get(
  '/question-by-tag/:id',
  updateAccessToken,
  isAuthenticated,
  getQuestionsByTagId
);

export default tagRouter;
