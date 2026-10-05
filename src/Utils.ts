function helloworld(): string {
    return "hello world";
}

function add(a: number, b: number): number {
    return a + b;
}

// ตรวจรูปแบบอีเมลเบื้องต้น ไม่ได้ตรวจว่าอีเมลนี้มีอยู่จริง
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const Utils = { add, isValidEmail };
