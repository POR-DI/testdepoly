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

## Docker (Part 4 หน้า 3–15)

เปิด Docker Desktop ก่อน แล้วรันคำสั่งจากโฟลเดอร์โปรเจกต์

```sh
docker build -t express:v1 -f Dockerfile .
docker run --name test1 --init --env-file .env -e PORT=3000 -p 127.0.0.1:3001:3000 -d express:v1
```

เปิด http://localhost:3001/test.html หรือ http://localhost:3001/api/users
แอปใน container ฟังพอร์ต 3000 จึงใช้ `3001:3000` เพื่อเปิดผ่านพอร์ต 3001 ของเครื่อง
`EXPOSE 3000` ระบุพอร์ตของแอป ส่วน `-p` เป็นตัวผูกพอร์ตกับเครื่อง

Dockerfile ใช้ Node.js 22 เช่นเดียวกับ GitHub Actions และ build TypeScript ภายใน image
`.dockerignore` ไม่นำ node_modules, dist จากเครื่อง, .git และ .env เข้า image
ส่งข้อมูลเชื่อมต่อ Atlas ด้วย `--env-file .env` ตอนรัน container

ดูสถานะและ log:

```sh
docker image ls express
docker ps --filter name=test1
docker logs test1
```

เข้า shell ภายใน container แล้วทดสอบเว็บ:

```sh
docker exec -it test1 bash
node -e "fetch('http://localhost:3000/').then(r => r.text()).then(console.log)"
exit
```

ทดสอบจากเครื่อง:

```sh
curl -i http://localhost:3001/
```

หยุดและเริ่ม container เดิม:

```sh
docker stop test1
docker start test1
```

เมื่อแก้โค้ด ให้ build image ใหม่ แล้วสร้าง container ใหม่:

```sh
docker stop test1
docker rm test1
docker build -t express:v1 -f Dockerfile .
docker run --name test1 --init --env-file .env -e PORT=3000 -p 127.0.0.1:3001:3000 -d express:v1
```

## Image สำหรับ Azure และ Mac

Build ให้รองรับทั้ง linux/amd64 (Azure) และ linux/arm64 (Mac Apple Silicon):

```sh
docker buildx build --platform linux/amd64,linux/arm64 -t gonnabe/testdepoly:latest -t gonnabe/testdepoly:v2 --push .
```

ใน Azure Container Apps เลือก image `gonnabe/testdepoly:v2`, Target port `3000`
และตั้ง `MONGODB_URI` เป็น environment variable โดยอ้างอิง Secret ที่ใส่ค่า connection string จาก .env
ไฟล์ .env ไม่ได้อยู่ใน image จึงต้องตั้งค่าบน Azure แยกต่างหาก

## GitHub Actions (Part 4 หน้า 44–51)

เมื่อ push เข้า `main` ระบบจะรัน `npm test` ก่อน ถ้าผ่านจึง build และ push image
สำหรับ `linux/amd64` และ `linux/arm64` ไปที่ Docker Hub โดยสร้างสอง tag:

- `gonnabe/testdepoly:latest`
- `gonnabe/testdepoly:<commit-sha>`

Repository ต้องมี GitHub Actions secrets ชื่อ `DOCKERHUB_USERNAME` และ
`DOCKERHUB_TOKEN` โดยใช้ Docker Hub access token แทนรหัสผ่านบัญชี
