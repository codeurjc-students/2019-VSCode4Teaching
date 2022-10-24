import * as fs from "fs";
import { V4TBuildItems } from "../../src/components/courses/V4TItem/V4TBuiltItems";

const items = [
    V4TBuildItems.ADD_COURSES_ITEM, V4TBuildItems.GET_WITH_CODE_ITEM,
    V4TBuildItems.LOGIN_ITEM, V4TBuildItems.LOGOUT_ITEM,
    V4TBuildItems.NO_COURSES_ITEM, V4TBuildItems.NO_EXERCISES_ITEM,
    V4TBuildItems.SIGNUP_ITEM, V4TBuildItems.SIGNUP_TEACHER_ITEM,
];
let numberItemsClass = 0;
// tslint:disable-next-line: forin
for (const item in V4TBuildItems) {
    numberItemsClass++;
}

function failIfItemsAreWrong() {
    if (items.length !== numberItemsClass) {
        fail("Missing items from V4TBuildItems in items array.");
    }
}
describe("V4T Items", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should get all icons correctly", () => {
        failIfItemsAreWrong();
        for (const item of items) {
            const iconPaths = item.iconPath;
            if (typeof iconPaths === "string") {
                expect(fs.existsSync(iconPaths)).toBeTruthy();
            } else if (typeof iconPaths === "object") {
                expect(fs.existsSync(iconPaths.dark)).toBeTruthy();
                expect(fs.existsSync(iconPaths.light)).toBeTruthy();
            }
        }
    });
});
