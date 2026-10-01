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
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const unit_test = () => __awaiter(void 0, void 0, void 0, function* () {
    // test case 1 of unit test
    //test
    if (Utils_1.Utils.add(2, 3) === 5) {
    }
    else {
        console.log("UnitTest Case 1: Utils.add(2, 3) === 5");
        process.exit(1);
    }
    if (Utils_1.Utils.add(3, 3) === 6) {
    }
    else {
        console.log("UnitTest Case 2: Utils.add(3, 3) === 6");
        process.exit(1);
    }
});
unit_test();
