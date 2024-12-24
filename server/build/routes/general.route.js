"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const general_controller_1 = require("../controllers/general.controller");
const globalSearchRouter = express_1.default.Router();
globalSearchRouter.get('/global-search', general_controller_1.globalSearch);
exports.default = globalSearchRouter;
