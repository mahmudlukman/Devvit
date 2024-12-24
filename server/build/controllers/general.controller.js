"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const question_model_1 = __importDefault(require("../models/question.model"));
const answer_model_1 = __importDefault(require("../models/answer.model"));
const tag_model_1 = __importDefault(require("../models/tag.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const SEARCHABLE_TYPES = ['question', 'answer', 'user', 'tag'];
const SEARCH_CONFIGS = [
    { model: question_model_1.default, searchField: 'title', type: 'question', idField: '_id', titleField: 'title' },
    { model: user_model_1.default, searchField: 'name', type: 'user', idField: 'userId', titleField: 'name' },
    { model: answer_model_1.default, searchField: 'content', type: 'answer', idField: 'question', titleField: 'content' },
    { model: tag_model_1.default, searchField: 'name', type: 'tag', idField: '_id', titleField: 'name' },
];
exports.globalSearch = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    const { query, type } = req.query;
    if (typeof query !== 'string' || query.trim() === '') {
        return next(new errorHandler_1.default('Invalid search query', 400));
    }
    const searchType = type;
    if (searchType && !SEARCHABLE_TYPES.includes(searchType)) {
        return next(new errorHandler_1.default('Invalid search type', 400));
    }
    const regexQuery = { $regex: query, $options: 'i' };
    const configsToSearch = searchType
        ? SEARCH_CONFIGS.filter(config => config.type === searchType)
        : SEARCH_CONFIGS;
    try {
        const results = await Promise.all(configsToSearch.map(async (config) => {
            const items = await config.model
                .find({ [config.searchField]: regexQuery })
                .limit(searchType ? 8 : 2);
            return items.map((item) => ({
                title: config.type === 'answer' ? `Answer containing "${query}"` : item[config.titleField],
                type: config.type,
                id: item[config.idField],
            }));
        }));
        res.status(200).json({
            success: true,
            results: results.flat()
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
