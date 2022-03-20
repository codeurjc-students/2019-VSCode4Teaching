// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {
            case "updateDate":
                for (const key in message.update) {
                    document.getElementById(key).textContent = message.update[key];
                }
                break;
            case "openDone":
                document.querySelectorAll(".button-col > button").forEach((e) => {
                    e.disabled = false;
                });
                break;
        }
    });

    document.querySelectorAll(".workspace-link-open").forEach((openBtn) => {
        openBtn.addEventListener("click", () => {
            document.querySelectorAll(".button-col > button").forEach((e) => {
                e.disabled = true;
            });
            const username = openBtn.parentElement.parentElement.dataset.username;
            const eui_id = openBtn.parentElement.parentElement.dataset.eui;
            vscode.postMessage({
                type: "goToWorkspace",
                username,
                eui_id,
            });
        });
    });

    document.querySelectorAll(".workspace-link-diff").forEach((diffBtn) => {
        diffBtn.addEventListener("click", () => {
            Array.from(diffBtn.parentElement.children).forEach((e) => {
                e.disabled = true;
            });
            const username = diffBtn.parentElement.parentElement.dataset.username;
            const eui_id = diffBtn.parentElement.parentElement.dataset.eui;
            vscode.postMessage({
                type: "diff",
                username,
                eui_id,
            });
        });
    });

    document.querySelectorAll(".sorter").forEach((header) => {
        header.addEventListener("click", () => {
            let order = header.classList.toggle("active");
            vscode.postMessage({
                type: "sort",
                column: header.dataset.column,
                desc: order,
            });
        });
    });

    document.getElementById("hideStudentNames").addEventListener("click", (event) => {
        vscode.postMessage({
            type: "changeVisibilityStudentsNames",
            value: event.target.checked,
        });
    });
})();
