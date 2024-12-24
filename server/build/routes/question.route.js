"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_controller_1 = require("../controllers/question.controller");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const questionRouter = express_1.default.Router();
questionRouter.get('/questions', question_controller_1.getQuestions);
questionRouter.post('/create-question', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, question_controller_1.createQuestion);
questionRouter.get('/question/:questionId', question_controller_1.getQuestionById);
questionRouter.put('/downvote-question/:questionId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, question_controller_1.downvoteQuestion);
questionRouter.put('/upvote-question/:questionId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, question_controller_1.upvoteQuestion);
questionRouter.delete('/delete-question/:questionId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, question_controller_1.deleteQuestion);
questionRouter.put('/edit-question/:questionId', 
// updateAccessToken,
auth_1.isAuthenticated, question_controller_1.editQuestion);
questionRouter.get('/hot-questions', question_controller_1.getHotQuestions);
questionRouter.get('/recommended-questions', 
// updateAccessToken,
auth_1.isAuthenticated, question_controller_1.getRecommendedQuestions);
exports.default = questionRouter;
