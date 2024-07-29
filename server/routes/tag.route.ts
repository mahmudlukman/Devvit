import express from 'express';
import { getAllTags, getQuestionsByTagId, getTopInteractedTags } from '../controllers/tag.controller';
import { isAuthenticated } from '../middleware/auth';
import { updateAccessToken } from '../controllers/auth.controller';

const tagRouter = express.Router();

tagRouter.get(
  '/get-top-tags/:id',
  // updateAccessToken,
  isAuthenticated,
  getTopInteractedTags
);

tagRouter.get(
  '/get-tags',
  // updateAccessToken,
  isAuthenticated,
  getAllTags
);

tagRouter.get(
  '/question-by-tag/:tagId',
  // updateAccessToken,
  isAuthenticated,
  getQuestionsByTagId
);

export default tagRouter;
