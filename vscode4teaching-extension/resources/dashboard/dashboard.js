// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();
    // const selectTimeReload = document.getElementById("time-reload");
    // selectTimeReload.addEventListener("change", () => {
    //     const timeSelected = selectTimeReload.value;
    //     vscode.postMessage({
    //         type: "changeReloadTime",
    //         reloadTime: timeSelected
    //     });
    // });
    // document.getElementById("button-reload").addEventListener("click", () => {
    //     vscode.postMessage({
    //         type: "reload",
    //         reload: true
    //     });
    // });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'updateDate':
                for (const key in message.update) {
                    document.getElementById(key).textContent = message.update[key]
                }
                break;
            case 'openDone':
                document.querySelectorAll("button." + message.username).forEach((e) => {
                    e.disabled = false;
                });
                break;
        }
    })

    document.querySelectorAll(".workspace-link").forEach((row) => {
        row.addEventListener("click", () => {
            Array.from(row.parentElement.children).forEach((e) => {
                e.disabled = true;
            });
            const username = Array.from(row.parentElement.parentElement.children).find(e => e.classList.contains('username')).innerHTML;
            vscode.postMessage({
                type: "goToWorkspace",
                username: username,
                lastMod:row.attributes.getNamedItem("data-lastMod").value,
            });
        });
    });

    document.querySelectorAll(".workspace-link-diff").forEach((row) => {
        row.addEventListener("click", () => {
            Array.from(row.parentElement.children).forEach((e) => {
                e.disabled = true;
            });
            const username = Array.from(row.parentElement.parentElement.children).find(e => e.classList.contains('username')).innerHTML;
            vscode.postMessage({
                type: "diff",
                username: username,
                lastMod:row.attributes.getNamedItem("data-lastMod-diff").value,
            });
        });
    });

    document.querySelectorAll(".sorter").forEach(
        (header, i) => {
            header.addEventListener("click", () => {
                let order = header.classList.toggle('active');
                vscode.postMessage({
                    type: "sort",
                    column: i,
                    desc: order,
                });
            });
        }
    );
}());

