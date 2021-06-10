// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();
    const selectTimeReload = document.getElementById("time-reload");

    document.querySelectorAll(".liveshare-send").forEach((row) => {
        row.addEventListener("click", () => {
            const username = Array.from(row.parentElement.parentElement.children).find(e => e.classList.contains('username')).innerHTML;
            vscode.postMessage({
                type: "start-liveshare",
                username: username
            });
        });
    });

    document.querySelectorAll("#search-send").forEach(button => {
        button.addEventListener("click", () => {
            const username = Array.from(button.parentElement.children).find(e => e.id == "username-search").value;
            if (username)
                vscode.postMessage({
                    type: "start-liveshare",
                    username: username
                });
        });
    })

}());

