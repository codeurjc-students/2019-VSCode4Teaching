// Jest manual mock for vscode
// Based on: https://www.richardkotze.com/coding/unit-test-mock-vs-code-extension-api-jest

const WorkspaceFolder = {}

const ExtensionContext = {}

const TreeItem = jest.fn().mockImplementation(() => { });

const EventEmitter = jest.fn().mockImplementation(() => { })

const window = {
    registerTreeDataProvider: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
        show: jest.fn()
    })),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    setStatusBarMessage: jest.fn()
};

const workspace = {
    getConfiguration: jest.fn(extension => {
        return {
            'defaultExerciseDownloadDirectory': 'v4tdownloads'
        }
    }),
    workspaceFolders: [],
    onDidSaveTextDocument: jest.fn()
};

const Uri = {
    file: f => f,
    parse: jest.fn()
};
const Range = jest.fn();

const commands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
};

const vscode = {
    WorkspaceFolder,
    ExtensionContext,
    TreeItem,
    EventEmitter,
    Uri,
    Range,
    window,
    workspace,
    commands
};

module.exports = vscode;