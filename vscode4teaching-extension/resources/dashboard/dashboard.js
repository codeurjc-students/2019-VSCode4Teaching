// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'updateDate':
                for (const key in message.update) {
                    document.getElementById(key).textContent = message.update[key]
                }
                break;
            case 'openDone':
                document.querySelectorAll(".button-col > button").forEach((e) => {
                    e.disabled = false;
                });
                break;
        }
    })

    document.querySelectorAll(".workspace-link-open").forEach((openBtn) => {
        openBtn.addEventListener("click", () => {
            Array.from(openBtn.parentElement.children).forEach((e) => {
                e.disabled = true;
            });
            const username = openBtn.parentElement.dataset.username;
            const eui = openBtn.parentElement.dataset.eui;
            vscode.postMessage({
                type: "goToWorkspace",
                username: username,
                eui: eui,
            });
        });
    });

    document.querySelectorAll(".workspace-link-diff").forEach((diffBtn) => {
        diffBtn.addEventListener("click", () => {
            Array.from(diffBtn.parentElement.children).forEach((e) => {
                e.disabled = true;
            });
            const username = diffBtn.parentElement.dataset.username;
            const eui = diffBtn.parentElement.dataset.eui;
            vscode.postMessage({
                type: "diff",
                username: username,
                eui: eui,
            });
        });
    });

    document.querySelectorAll(".sorter").forEach(
        (header) => {
            header.addEventListener("click", () => {
                let order = header.classList.toggle('active');
                vscode.postMessage({
                    type: "sort",
                    column: header.dataset.column,
                    desc: order,
                });
            });
        }
    );

    document.getElementById("hideStudentNames").addEventListener("click", (event) => {
        vscode.postMessage({
            type: "changeVisibilityStudentsNames",
            value: event.target.checked,
        });
    });
}());

