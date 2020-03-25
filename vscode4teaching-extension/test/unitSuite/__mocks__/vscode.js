// Jest manual mock for vscode
// Based on: https://www.richardkotze.com/coding/unit-test-mock-vs-code-extension-api-jest

const WorkspaceFolder = {}

const ExtensionContext = {}

const TreeItem = jest.fn().mockImplementation(() => { });
const EventEmitter = jest.fn().mockImplementation(() => {
    return {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn(),
    }
})

const window = {
    registerTreeDataProvider: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
        show: jest.fn()
    })),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    setStatusBarMessage: jest.fn(),
    showInputBox: jest.fn(),
};

const WorkspaceConfiguration = {
    get: jest.fn().mockImplementation(e => {
        switch (e) {
            case "defaultServer": {
                return "http://test.com:12345"
            }
            case "defaultExerciseDownloadDirectory": {
                return "v4tdownloads"
            }
        }
    }),
}

const workspace = {
    getConfiguration: jest.fn().mockImplementation(extension => {
        return WorkspaceConfiguration;
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

const TreeItemCollapsibleState = {
    None: 1,
    Collapsed: 2,
    Expanded: 3
}

const ProviderResult = {}

const Event = {}

const vscode = {
    WorkspaceFolder,
    ExtensionContext,
    TreeItem,
    TreeItemCollapsibleState,
    EventEmitter,
    Event,
    ProviderResult,
    Uri,
    Range,
    WorkspaceConfiguration,
    window,
    workspace,
    commands
};

module.exports = vscode;