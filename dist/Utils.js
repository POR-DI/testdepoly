"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
function helloworld() {
    return "hello world";
}
function add(a, b) {
    return a + b;
}
// ตรวจรูปแบบอีเมลเบื้องต้น ไม่ได้ตรวจว่าอีเมลนี้มีอยู่จริง
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
exports.Utils = { add, isValidEmail };
