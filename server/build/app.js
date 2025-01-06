"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const user_route_1 = __importDefault(require("./routes/user.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const question_route_1 = __importDefault(require("./routes/question.route"));
const tag_route_1 = __importDefault(require("./routes/tag.route"));
const answer_route_1 = __importDefault(require("./routes/answer.route"));
const interaction_route_1 = __importDefault(require("./routes/interaction.route"));
const general_route_1 = __importDefault(require("./routes/general.route"));
const rateLimiter_1 = require("./utils/rateLimiter");
// body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.disable("x-powered-by");
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors => Cross Origin Resource Sharing
exports.app.use((0, cors_1.default)({
    origin: ["https://dev-overflow-sepia.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
}));
// routes
exports.app.use("/api/v1", user_route_1.default, auth_route_1.default, question_route_1.default, tag_route_1.default, answer_route_1.default, interaction_route_1.default, general_route_1.default);
// testing API
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({ success: true, message: "API is working" });
});
// unknown route
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(rateLimiter_1.limiter);
exports.app.use(error_1.errorMiddleware);
