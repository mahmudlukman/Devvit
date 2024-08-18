import express from 'express';
import { getAllTags, getQuestionsByTagId, getTopInteractedTags, getTopPopularTags } from '../controllers/tag.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const tagRouter = express.Router();

tagRouter.get(
  '/top-tags/:id',
  // updateAccessToken,
  isAuthenticated,
  getTopInteractedTags
);

tagRouter.get(
  '/tags',
  // updateAccessToken,
  isAuthenticated,
  getAllTags
);

tagRouter.get(
  '/question-by-tag',
  // updateAccessToken,
  isAuthenticated,
  getQuestionsByTagId
);

tagRouter.get(
  '/popular-tags',
  // updateAccessToken,
  isAuthenticated,
  getTopPopularTags
);

export default tagRouter;
