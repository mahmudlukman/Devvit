import express from 'express';
import { getAllTags, getQuestionsByTagId, getTopInteractedTags, getTopPopularTags } from '../controllers/tag.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const tagRouter = express.Router();

tagRouter.get(
  '/top-tags',
  getTopInteractedTags
);

tagRouter.get(
  '/tags',
  getAllTags
);

tagRouter.get(
  '/question-by-tag',
  getQuestionsByTagId
);

tagRouter.get(
  '/popular-tags',
  getTopPopularTags
);

export default tagRouter;
