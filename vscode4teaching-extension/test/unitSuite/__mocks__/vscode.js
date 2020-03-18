// Jest manual mock for vscode
// Based on: https://www.richardkotze.com/coding/unit-test-mock-vs-code-extension-api-jest

const WorkspaceFolder = {}

const ExtensionContext = {}

const TreeItem = jest.fn().mockImplementation(() => {

});

const EventEmitter = jest.fn().mockImplementation(() => {

})

const languages = {
    createDiagnosticCollection: jest.fn()
};

const StatusBarAlignment = {};

const window = {
    registerTreeDataProvider: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
        show: jest.fn()
    })),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createTextEditorDecorationType: jest.fn()
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

const OverviewRulerLane = {
    Left: null
};

const Uri = {
    file: f => f,
    parse: jest.fn()
};
const Range = jest.fn();
const Diagnostic = jest.fn();
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };

const debug = {
    onDidTerminateDebugSession: jest.fn(),
    startDebugging: jest.fn()
};

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
    window,
    workspace,
    commands
};

module.exports = vscode;