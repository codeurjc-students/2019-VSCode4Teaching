# VSCode4Teaching - Extension

## Tabla de contenidos
- [Development](#development)
  - [Involved technologies](#involved-technologies)
- [Build](#build)
- [Execution](#execution)

## Development
The Visual Studio Code extension *VSCode4Teaching* is based on the Node.js platform and acts as a *frontend*, being the component that is installed in the IDE and allows users to use an intuitive and friendly GUI to interact with the backend and thus be able to access all the functionality of the application. Although it is server-independent in terms of code, it is necessary to configure a connection to a VSCode4Teaching server to be able to use the functionality of this extension.

### Involved technologies
The extensions for Visual Studio Code are based on Node.js, the main associated technologies being the following:
- [Visual Studio Code](https://code.visualstudio.com). It is the integrated development environment for which the extension is developed. It is *open source* and is indispensable to be able to execute the extension.
- [Node.js](https://nodejs.org). It is a JavaScript-based applications execution engine.
- [npm](https://www.npmjs.com). It is the dependency manager used by default in Node.js applications.
- [TypeScript](https://www.typescriptlang.org). It is a programming language that compiles to JavaScript and allows using strong typing to implement JavaScript and Node.js applications.

## Build
It is necessary to use Visual Studio Code as IDE to implement and test the extension. Some of the most used commands and functionalities for building the extension are:
- Press ``F5`` to run the extension in a new test window, allowing to debug its operation in the IDE.
- Execute the ``npm run vscode:prepublish`` command to compile a minified version of the extension in VSIX format. Alternatively, you can also compile the extension in the same format by entering the sourcemaps with the ``npm run build`` command.
- To run tests of the extension (based on Jest), the ``npm test`` command can be launched. Information about the test coverage can be obtained with the ``npm run coverage`` command.

## Execution
The extension starts automatically when Visual Studio Code is opened if it is installed. It can be installed in two ways:
- Using the Marketplace, where several versions of the extension are available.
- Building the source code provided as indicated and installing the extension in VSIX format using the "Install from VSIX" option available in the context menu of the Extensions panel.

Once installed, it may be necessary to modify the server and download directory settings. To do this, in the IDE preferences, it is necessary to look for the VSCode4Teaching preferences, which look as follows:
![Extension Settings in Visual Studio Code](../readme_resources/VSCodeSettingsView.png)
