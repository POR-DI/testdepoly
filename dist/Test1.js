"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const unit_test = () => {
    if (Utils_1.Utils.add(2, 3) === 5) {
        console.log("PASS: add(2, 3) = 5");
    }
    else {
        console.log("FAIL: add(2, 3) should equal 5");
        process.exit(1);
    }
    if (Utils_1.Utils.add(3, 3) === 6) {
        console.log("PASS: add(3, 3) = 6");
    }
    else {
        console.log("FAIL: add(3, 3) should equal 6");
        process.exit(1);
    }
    // แต่ละแถวคือ input และผลที่ควรได้จาก Utils.isValidEmail()
    const emailTests = [
        { name: "normal email", email: "sorn@gmail.com", expected: true },
        { name: "subdomain", email: "student@cmu.ac.th", expected: true },
        { name: "plus sign", email: "sorn+test@gmail.com", expected: true },
        { name: "missing @", email: "sorngmail.com", expected: false },
        { name: "missing name", email: "@gmail.com", expected: false },
        { name: "missing domain", email: "sorn@", expected: false },
        { name: "missing dot", email: "sorn@gmail", expected: false },
        { name: "missing domain ending", email: "sorn@gmail.", expected: false },
        { name: "two @ signs", email: "sorn@@gmail.com", expected: false },
        { name: "space in email", email: "sorn name@gmail.com", expected: false },
        { name: "empty email", email: "", expected: false },
    ];
    for (const test of emailTests) {
        if (Utils_1.Utils.isValidEmail(test.email) === test.expected) {
            console.log("PASS: " + test.name);
        }
        else {
            console.log("FAIL: " + test.name + " — expected " + test.expected);
            process.exit(1); // ทำให้ GitHub Actions ขึ้น Failed
        }
    }
    console.log("All 13 Utils tests passed");
};
unit_test();
