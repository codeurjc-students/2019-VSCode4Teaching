export class MockFile {
    private text: string;
    constructor(text: string) {
        this.text = text;
    }

    public toString() {
        return this.text;
    }
}
