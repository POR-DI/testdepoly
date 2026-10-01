import { Utils } from "./Utils";

const unit_test = async () => {
    // test case 1 of unit test
    //test
    if (Utils.add(2, 3) === 5) {
    } else {
        console.log("UnitTest Case 1: Utils.add(2, 3) === 5");
        process.exit(1);
    }

    if (Utils.add(3, 3) === 6) {
    } else {
        console.log("UnitTest Case 2: Utils.add(3, 3) === 6");
        process.exit(1);
    }
}

unit_test();
