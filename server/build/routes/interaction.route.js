"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interaction_controller_1 = require("../controllers/interaction.controller");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const interactionRouter = express_1.default.Router();
interactionRouter.get('/view-question/:questionId', auth_controller_1.updateAccessToken, auth_1.isAuthenticated, interaction_controller_1.viewQuestion);
exports.default = interactionRouter;
