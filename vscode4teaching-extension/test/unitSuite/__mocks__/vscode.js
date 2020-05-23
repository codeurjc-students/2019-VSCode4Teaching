// Jest manual mock for vscode
// Based on: https://www.richardkotze.com/coding/unit-test-mock-vs-code-extension-api-jest
const WorkspaceFolder = {
    path: jest.fn()
}

const ExtensionContext = {}

const TreeItem = jest.fn().mockImplementation(() => { });
const EventEmitter = jest.fn().mockImplementation(() => {
    return {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn(),
    }
})

const StatusBarItem = {
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
    text: undefined,
    tooltip: undefined,
    command: undefined
}

const StatusBarAlignment = {
    Left: 1,
    Right: 2
}

const Webview = {
    html: "",
    asWebviewUri: jest.fn(),
    onDidReceiveMessage: jest.fn(),
}

const WebviewPanel = {
    onDidDispose: jest.fn(),
    onDidChangeViewState: jest.fn(),
    dispose: jest.fn(),
    webview: Webview
}

const window = {
    registerTreeDataProvider: jest.fn(),
    createStatusBarItem: jest.fn(() => StatusBarItem),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn((x, y, z) => z), // TODO: Better implementation
    showInformationMessage: jest.fn(),
    setStatusBarMessage: jest.fn(),
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
    createWebviewPanel: jest.fn(() => WebviewPanel),
    activeTextEditor: undefined
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

const Uri = jest.fn().mockImplementation(() => {

});
const mockUriFile = f => f;
Uri.file = mockUriFile.bind(Uri);
Uri.parse = jest.fn().bind(Uri)

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

const ViewColumn = {
    Active: -1,
    Beside: -2,
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9
}

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
    commands,
    StatusBarItem,
    StatusBarAlignment,
    ViewColumn,
    WebviewPanel,
    Webview
};

module.exports = vscode;