import * as assert from "assert";
import { Validators } from "../../src/components/courses/Validators";

describe("Validators", () => {
    it("should validate URL", () => {
        expect(Validators.validateUrl("http://localhost:8080")).toBeUndefined();
        assert.deepStrictEqual(Validators.validateUrl("http://localhost:3000"), undefined, "http://localhost:3000");
        assert.deepStrictEqual(Validators.validateUrl("http://192.168.99.100:8080"), undefined, "http://192.168.99.100:8080");
        assert.deepStrictEqual(Validators.validateUrl("http://1.2.4.3"), undefined, "http://1.2.4.3");
        assert.deepStrictEqual(Validators.validateUrl("http://test.com:4567"), undefined, "http://test.com:4567");
        assert.deepStrictEqual(Validators.validateUrl("http://api.test.com"), undefined, "http://api.test.com");
        assert.deepStrictEqual(Validators.validateUrl("http://test.com/api"), undefined, "http://test.com/api");
        assert.deepStrictEqual(Validators.validateUrl("http://test.com/api:8080"), undefined, "http://test.com/api:8080");
        assert.deepStrictEqual(Validators.validateUrl("asdasdasd"), "Invalid URL", "invalid url should fail");
    });
});
