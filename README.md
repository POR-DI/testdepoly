# testdepoly — Deployment part 3

Express + TypeScript + Mongoose ตัวอย่าง CRUD ตามสไลด์หน้า 108–122

## เริ่มใช้งาน

ใช้ Node.js 22 ขึ้นไป

```sh
npm ci
cp .env.example .env
# ใส่ connection string ของ Atlas ใน MONGODB_URI ภายใน .env
npm run dev
```

เปิด http://localhost:3000/test.html เพื่อเพิ่ม ดู แก้ไข หรือลบผู้ใช้

```sh
npm test
npm run build
npm start
```

| Method | URL | การทำงาน |
| --- | --- | --- |
| POST | /api/users | เพิ่มผู้ใช้: name, email, password |
| GET | /api/users | ดูทั้งหมด |
| GET | /api/users/:id | ดูตาม ID |
| PUT | /api/users/:id | แก้ไข name, email, password เฉพาะช่องที่ส่ง |
| DELETE | /api/users/:id | ลบผู้ใช้ |

แยกไฟล์ User.ts, UserController.ts, UserRoutes.ts ตามสไลด์ ส่วน app.ts ใช้ประกอบ Express และ index.ts เชื่อมฐานข้อมูลก่อนเปิด Server

รหัสผ่านผู้ใช้ถูก hash ด้วย scrypt และไม่ส่งกลับใน API; เก็บรหัสผ่าน Atlas ใน .env ที่ Git เพิกเฉย
ตัวอย่างนี้ยังไม่มีระบบ login หรือการจำกัดสิทธิ์ API จึงใช้สำหรับฝึกในเครื่อง
Test ใช้ model จำลอง ไม่แก้ไขข้อมูลบน Atlas

## Utils unit tests

`src/Utils.ts` มี `isValidEmail()` ซึ่ง Controller ใช้ตรวจอีเมลจริง
`src/Test1.ts` ทดสอบด้วย if/else จำนวน 13 เคส: บวกเลข 2 เคส และรูปแบบอีเมล 11 เคส
รันเฉพาะส่วนนี้ด้วย `npm run test:utils` หรือรันทั้งหมดด้วย `npm test`
เมื่อ push หรือเปิด pull request, workflow `main` จะติดตั้ง dependencies และรัน `npm test`
หากผลไม่ตรงที่คาดไว้ `process.exit(1)` จะทำให้ขั้นตอนใน GitHub Actions ล้มเหลว
ไม่ต้องใส่รหัสผ่าน Atlas ใน GitHub สำหรับชุดทดสอบนี้
