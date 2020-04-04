import { Validators } from "../../src/components/courses/Validators";

describe("Validators", () => {
    it("should validate URL correctly", () => {
        const invalidURLError = "Invalid URL";
        const emptyURLError = "Please enter the URL of the server that you want to connect to";
        expect(Validators.validateUrl("http://localhost:8080")).toBeUndefined();
        expect(Validators.validateUrl("http://192.168.99.100:8080")).toBeUndefined();
        expect(Validators.validateUrl("http://1.2.4.3")).toBeUndefined();
        expect(Validators.validateUrl("http://test.com:4567")).toBeUndefined();
        expect(Validators.validateUrl("http://api.test.com")).toBeUndefined();
        expect(Validators.validateUrl("http://test.com/api")).toBeUndefined();
        expect(Validators.validateUrl("asdasdasd")).toBe(invalidURLError);
        expect(Validators.validateUrl("")).toBe(emptyURLError);
    });

    it("should validate email correctly", () => {
        const invalidEmailError = "Invalid email";
        const emptyEmailError = "Please enter your email";
        expect(Validators.validateEmail("mkyong@yahoo.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong-100@yahoo.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong.100@yahoo.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong111@mkyong.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong-100@mkyong.net")).toBeUndefined();
        expect(Validators.validateEmail("mkyong.100@mkyong.com.au")).toBeUndefined();
        expect(Validators.validateEmail("mkyong@1.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong@gmail.com.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong+100@gmail.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong-100@yahoo-test.com")).toBeUndefined();
        expect(Validators.validateEmail("mkyong")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong@.com.my")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong123@gmail.a")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong123@.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong123@.com.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail(".mkyong@mkyong.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong()*@gmail.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong@%*.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong..2002@gmail.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong.@gmail.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong@mkyong@gmail.com")).toBe(invalidEmailError);
        expect(Validators.validateEmail("mkyong@gmail.com.1a")).toBe(invalidEmailError);
        expect(Validators.validateEmail("")).toBe(emptyEmailError);
    });

    it("should validate password on signup correctly", () => {
        const shortPwdError = "Password is too short";
        expect(Validators.validatePasswordSignup("password")).toBeUndefined();
        expect(Validators.validatePasswordSignup("pwd")).toBe(shortPwdError);
        expect(Validators.validatePasswordSignup("")).toBe(shortPwdError);
    });

    it("should validate password on login correctly", () => {
        const emptyPwdError = "Please enter your password";
        expect(Validators.validatePasswordLogin("password")).toBeUndefined();
        expect(Validators.validatePasswordLogin("pwd")).toBeUndefined();
        expect(Validators.validatePasswordLogin("")).toBe(emptyPwdError);
    });

    it("should validate username correctly", () => {
        const lengthError = "Username must have between 4 and 50 characters";
        const emptyError = "Please enter your username";
        const templateInvalidError = "Username is not valid (cannot contain the word template)";
        expect(Validators.validateUsername("johndoe")).toBeUndefined();
        expect(Validators.validateUsername("jnd")).toBe(lengthError);
        const longName = "johndoe".repeat(10);
        expect(Validators.validateUsername(longName)).toBe(lengthError);
        expect(Validators.validateUsername("")).toBe(emptyError);
        expect(Validators.validateUsername("template")).toBe(templateInvalidError);
        expect(Validators.validateUsername("usertemplate")).toBe(templateInvalidError);
        expect(Validators.validateUsername("templateuser")).toBe(templateInvalidError);
        expect(Validators.validateUsername("ustemplateer")).toBe(templateInvalidError);
    });

    it("should validate name correctly", () => {
        const emptyError = "Please enter your name";
        expect(Validators.validateName("John")).toBeUndefined();
        expect(Validators.validateName("")).toBe(emptyError);
    });
    it("should validate last name correctly", () => {
        const emptyError = "Please enter your last name";
        expect(Validators.validateLastName("Doe")).toBeUndefined();
        expect(Validators.validateLastName("")).toBe(emptyError);
    });

    it("should validate course correctly", () => {
        const emptyError = "Please enter a name";
        const lengthError = "Name must be between 10 and 100 characters";
        expect(Validators.validateCourseName("New course")).toBeUndefined();
        const longName = "Course".repeat(1000);
        expect(Validators.validateCourseName(longName)).toBe(lengthError);
        expect(Validators.validateCourseName("N")).toBe(lengthError);
        expect(Validators.validateCourseName("")).toBe(emptyError);
    });

    it("should validate exercise correctly", () => {
        const emptyError = "Please enter a name";
        const lengthError = "Name must be between 10 and 100 characters";
        expect(Validators.validateExerciseName("New exercise")).toBeUndefined();
        const longName = "Exercise".repeat(1000);
        expect(Validators.validateExerciseName(longName)).toBe(lengthError);
        expect(Validators.validateExerciseName("N")).toBe(lengthError);
        expect(Validators.validateExerciseName("")).toBe(emptyError);
    });

    it("should validate sharing code", () => {
        const emptyError = "Please introduce the sharing code";
        expect(Validators.validateSharingCode("testCode")).toBeUndefined();
        expect(Validators.validateSharingCode("")).toBe(emptyError);
    });
});
