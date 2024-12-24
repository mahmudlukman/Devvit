"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tag_controller_1 = require("../controllers/tag.controller");
const tagRouter = express_1.default.Router();
tagRouter.get('/top-tags', tag_controller_1.getTopInteractedTags);
tagRouter.get('/tags', tag_controller_1.getAllTags);
tagRouter.get('/question-by-tag', tag_controller_1.getQuestionsByTagId);
tagRouter.get('/popular-tags', tag_controller_1.getTopPopularTags);
exports.default = tagRouter;
