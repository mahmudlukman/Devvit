"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const answer_controller_1 = require("../controllers/answer.controller");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const answerRouter = express_1.default.Router();
answerRouter.post('/create-answer', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, answer_controller_1.createAnswer);
answerRouter.get('/answers', answer_controller_1.getAnswers);
answerRouter.put('/upvote-answer/:answerId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, answer_controller_1.upvoteAnswer);
answerRouter.put('/downvote-answer/:answerId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, answer_controller_1.downvoteAnswer);
answerRouter.delete('/delete-answer/:answerId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, answer_controller_1.deleteAnswer);
exports.default = answerRouter;
