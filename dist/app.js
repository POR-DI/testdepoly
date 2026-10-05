"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const UserRoutes_1 = __importDefault(require("./UserRoutes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
exports.app.get('/', (_req, res) => { res.send('Hello, World! Open /test.html to test the users API.'); });
exports.app.use('/api', UserRoutes_1.default);
const errorHandler = (error, _req, res, _next) => {
    const status = error.status === 400 ? 400 : error.status === 413 ? 413 : 500;
    res.status(status).json({ message: status === 400 ? 'Invalid JSON body' : status === 413 ? 'Request too large' : 'Internal server error' });
};
exports.app.use(errorHandler);
