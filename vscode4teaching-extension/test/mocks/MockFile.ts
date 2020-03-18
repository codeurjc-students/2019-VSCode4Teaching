export class MockFile {
    private text: string;
    constructor(text: string) {
        this.text = text;
    }

    toString () {
        return this.text;
    }
}