// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();
    const selectTimeReload = document.getElementById("time-reload");
    selectTimeReload.addEventListener("change", () => {
        const timeSelected = selectTimeReload.value;
        vscode.postMessage({
            type: "changeReloadTime",
            reloadTime: timeSelected
        });
    });
    document.getElementById("button-reload").addEventListener("click", () => {
        vscode.postMessage({
            type: "reload",
            reload: true
        });
    });

    document.querySelectorAll(".workspace-link").forEach((row) => {
        row.addEventListener("click", () => {
            const username = Array.from(row.parentElement.parentElement.children).find(e=>e.classList.contains('username')).innerHTML;
            vscode.postMessage({
                type: "goToWorkspace",
                username: username
            });
        });
    });


}());

