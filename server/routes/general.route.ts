import express from 'express';
import { globalSearch } from '../controllers/general.controller';

const globalSearchRouter = express.Router();

globalSearchRouter.get(
  '/global-search',
  globalSearch
);

export default globalSearchRouter;
