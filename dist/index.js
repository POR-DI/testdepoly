"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error('Set MONGODB_URI in .env before starting the server');
        yield mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log('Connected to MongoDB');
        const server = app_1.app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
        });
        server.on('error', () => { console.error('Cannot start HTTP server. Check whether the port is in use.'); void mongoose_1.default.disconnect().finally(() => process.exit(1)); });
        for (const signal of ['SIGINT', 'SIGTERM']) {
            process.once(signal, () => { server.close(() => { void mongoose_1.default.disconnect().then(() => process.exit(0)); }); });
        }
    });
}
start().catch(() => {
    console.error('Cannot connect to MongoDB. Check MONGODB_URI, database credentials and Atlas IP Access List.');
    process.exit(1);
});
