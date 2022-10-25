// For security reasons, we must keep the VS Code API object private and make sure it is never leaked into the global scope.
(function () {
    const vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {
            case "updateLastModificationTimes":
                for (const key in message.content) {
                    document.getElementById(key).textContent = message.content[key];
                }
                break;
            case "updateGeneralStatistics":
                for (const key in message.content) {
                    document.getElementById(`${key}`).textContent = message.content[key];
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

    if (document.getElementById("publishSolution")) {
        document.getElementById("publishSolution").addEventListener("click", (event) => {
            vscode.postMessage({
                type: "publishSolution",
                value: event.target.checked,
            });
        });
    }

    if (document.getElementById("allowEditionAfterSolutionDownloaded")) {
        document.getElementById("allowEditionAfterSolutionDownloaded").addEventListener("click", (event) => {
            vscode.postMessage({
                type: "allowEditionAfterSolutionDownloaded",
                value: event.target.checked,
            });
        });
    }


    const chart = document.getElementById("statusChart");
    new Chart(chart.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ["Not Started", "In Progress", "Finished"],
            datasets: [
                {
                    data: [chart.dataset["notstarted"], chart.dataset["inprogress"], chart.dataset["finished"]],
                    backgroundColor: [
                        "rgba(239, 83, 80, 0.2)",
                        "rgba(249, 168, 37, 0.2)",
                        "rgba(102, 187, 106, 0.2)"
                    ],
                    hoverBackgroundColor: [
                        "#EF5350",
                        "#F9A825",
                        "#66BB6A"
                    ],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    borderColor: "#FFFFFF",
                    hoverBorderColor: "#FFFFFF",
                    hoverOffset: 0,
                },
            ]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: "80%",
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
})();
