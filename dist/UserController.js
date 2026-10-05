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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./User"));
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = yield scryptAsync(password, salt, 64);
        return `scrypt:${salt}:${hash.toString('hex')}`;
    });
}
function fail(res, error) {
    if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
        res.status(409).json({ message: 'Email already exists' });
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError || error instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({ message: 'Invalid user data' });
    }
    else {
        res.status(500).json({ message: 'Database operation failed' });
    }
}
function validId(req, res) {
    if (typeof req.params.id !== 'string' || !mongoose_1.default.isObjectIdOrHexString(req.params.id)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return false;
    }
    return true;
}
function userData(body_1) {
    return __awaiter(this, arguments, void 0, function* (body, partial = false) {
        if (!body || typeof body !== 'object' || Array.isArray(body))
            throw new Error('Invalid request body');
        const input = body;
        const result = {};
        for (const field of ['name', 'email', 'password']) {
            if (partial && input[field] === undefined)
                continue;
            if (typeof input[field] !== 'string' || !input[field].trim())
                throw new Error(`${field} is required`);
            result[field] = field === 'password' ? input[field] : input[field].trim();
        }
        if (!Object.keys(result).length)
            throw new Error('No user fields supplied');
        if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))
            throw new Error('Invalid email');
        if (result.password)
            result.password = yield hashPassword(result.password);
        return result;
    });
}
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    try {
        data = yield userData(req.body);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    try {
        res.status(201).json(yield User_1.default.create(data));
    }
    catch (error) {
        fail(res, error);
    }
});
exports.createUser = createUser;
const getUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield User_1.default.find());
    }
    catch (error) {
        fail(res, error);
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!validId(req, res))
        return;
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        fail(res, error);
    }
});
exports.getUserById = getUserById;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!validId(req, res))
        return;
    let data;
    try {
        data = yield userData(req.body, true);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    try {
        const user = yield User_1.default.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        fail(res, error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!validId(req, res))
        return;
    try {
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        fail(res, error);
    }
});
exports.deleteUser = deleteUser;
