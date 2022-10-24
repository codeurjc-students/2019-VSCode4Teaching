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
    showInformationMessage: jest.fn((x, y, z) => z),
    setStatusBarMessage: jest.fn(),
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
    createWebviewPanel: jest.fn(() => WebviewPanel),
    activeTextEditor: undefined,
    showQuickPick: jest.fn((array, options) => {
        return Promise.resolve([...array]);
    }),
    withProgress: jest.fn(),
};

const WorkspaceConfiguration = {
    get: jest.fn().mockImplementation((e, defaultValue) => {
        if (defaultValue !== undefined) {
            return defaultValue
        }
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
    onDidSaveTextDocument: jest.fn(),
    openTextDocument: jest.fn(),
    findFiles: jest.fn(),
    createFileSystemWatcher: jest.fn(),
    onWillSaveTextDocument: jest.fn(),
    updateWorkspaceFolders: jest.fn(),
    getWorkspaceFolder: jest.fn(),
    onDidChangeWorkspaceFolders: jest.fn(),
};

const Uri = jest.fn().mockImplementation((x) => {
    let file = "";
    if (x) {
        file = x.toString();
    }
    return {
        fsPath: file,
    }
});
const mockUriFile = f => {
    return { fsPath: f }
};
Uri.file = mockUriFile.bind(Uri);
Uri.parse = mockUriFile.bind(Uri);

const Range = jest.fn().mockImplementation((startLine, startCharacter, endLine, endCharacter) => {
    const positionMockStart = {
        line: startLine,
        character: startCharacter,
        compareTo: jest.fn(),
        isAfter: jest.fn(),
        isAfterOrEqual: jest.fn(),
        isBefore: jest.fn(),
        isBeforeOrEqual: jest.fn(),
        isEqual: jest.fn(),
        translate: jest.fn(),
        with: jest.fn(),
    };
    const positionMockEnd = {
        line: endLine,
        character: endCharacter,
        compareTo: jest.fn(),
        isAfter: jest.fn(),
        isAfterOrEqual: jest.fn(),
        isBefore: jest.fn(),
        isBeforeOrEqual: jest.fn(),
        isEqual: jest.fn(),
        translate: jest.fn(),
        with: jest.fn(),
    };
    return {
        start: positionMockStart,
        end: positionMockEnd,
        contains: jest.fn(),
        intersection: jest.fn(),
        isEmpty: true,
        isEqual: jest.fn(),
        isSingleLine: true,
        union: jest.fn(),
        with: jest.fn(),
    }
});

const commands = {
    registerCommand: jest.fn(() => Promise.resolve({ data: {} })),
    executeCommand: jest.fn(() => Promise.resolve({ data: {} }))
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

const comments = {
    createCommentController: jest.fn(() => {
        return CommentController
    }),
}

const CommentController = {
    commentingRangeProvider: undefined,
    dispose: jest.fn(),
    createCommentThread: jest.fn(),
}

const CommentReply = {}

const CommentMode = {
    Editing: 0,
    Preview: 1
}

const CommentThreadCollapsibleState = {
    Collapsed: 0,
    Expanded: 1
}

const EndOfLine = {
    LF: 1,
    CRLF: 2,
}

const MarkdownString = jest.fn().mockImplementation((text) => {
    return {
        value: text,
        appendText: jest.fn(),
        appendMarkdown: jest.fn(),
        appendCodeblock: jest.fn(),
    }
});

const RelativePattern = jest.fn();

const ProgressLocation = {
    Notification: 0,
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
    Webview,
    comments,
    CommentController,
    CommentReply,
    CommentMode,
    CommentThreadCollapsibleState,
    EndOfLine,
    MarkdownString,
    RelativePattern,
    ProgressLocation
};

module.exports = vscode;
