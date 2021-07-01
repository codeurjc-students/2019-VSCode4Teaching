// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();
    const selectTimeReload = document.getElementById("time-reload");

    document.querySelectorAll(".liveshare-send").forEach((row) => {
        row.addEventListener("click", () => {
            const username = Array.from(row.parentElement.parentElement.children).find(e => e.classList.contains('username')).innerHTML;
            sendVSLSMessage(username);
        });
    });

    document.querySelectorAll("#search-send").forEach(button => {
        button.addEventListener("click", () => {
            const username = Array.from(button.parentElement.children).find(e => e.id == "username-search").value;
            sendVSLSMessage(username);
        });
    })

    function sendVSLSMessage(username) {
        if (username)
            vscode.postMessage({
                type: "start-liveshare",
                username: username
            })
    }

    document.querySelectorAll(".sorter-ls").forEach(
        (header, i) => {
            header.addEventListener("click", () => {
                let order = header.classList.toggle('active');
                const courseIndex = header.parentElement.parentElement.parentElement.parentElement.getAttribute("data-courseIndex");
                if (courseIndex)
                    vscode.postMessage({
                        type: "sort-ls",
                        column: i,
                        desc: order,
                        courseIndex: courseIndex,
                    });
            });
        }
    );

}());

