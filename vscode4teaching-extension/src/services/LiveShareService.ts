import * as vscode from "vscode";
import * as vsls from "vsls";
import { v4tLogger } from "./LoggerService";

export class LiveShareService {

    public static async setup(): Promise<LiveShareService | undefined> {
        if (vscode.extensions.getExtension("ms-vsliveshare.vsliveshare-pack") === undefined) {
            await LiveShareService.installExtension();
            return await this.setup();
        } else {
            try {
                const resApi = await vsls.getApi();
                if (resApi) {
                    return new LiveShareService(resApi);
                } else {
                    throw new Error();
                }
            } catch (err) {
                v4tLogger.error("Error while activating Liveshare.");
                vscode.window.showErrorMessage("Error while activating Liveshare.");
            }
        }
    }

    private static async installExtension() {
        const res = await vscode.window.showErrorMessage("Install Liveshare extension in order to use its integrated service on V4T", "Install");
        if (res === "Install") {
            vscode.commands.executeCommand("workbench.extensions.installExtension", "ms-vsliveshare.vsliveshare-pack");
            return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification },
                (progress) => {
                    progress.report({ message: "Installing Liveshare extension..." });
                    return new Promise<void>((resolve) => {
                        vscode.extensions.onDidChange((e) => resolve());
                        vscode.commands.executeCommand("workbench.extensions.installExtension", "ms-vsliveshare.vsliveshare-pack");
                    });
                },
            );
        }
    }

    private constructor(private liveshareAPI: vsls.LiveShare) {
    }

    public handleLiveshareMessage(dataStringified: string) {
        if (!dataStringified) {
            return;
        }
        const { handle, from, code } = JSON.parse(dataStringified);
        if ((handle === "liveshare") && from && code) {
            vscode.window.showInformationMessage(`Liveshare invitation by ${ from }`, "Accept", "Decline").then(
                (res) => {
                    if (res === "Accept") {
                        const codeParsed: vscode.Uri = vscode.Uri.parse(code);
                        vscode.env.clipboard.writeText(code).then(
                            () => {
                                vscode.window.showInformationMessage(`Code already set on clipboard: ${ code }`);
                                this.liveshareAPI.join(codeParsed);
                            },
                            (err) => vscode.window.showErrorMessage(`Could not use clipboard: ${ err }`),
                        );
                    }
                });
        }
    }

    public setLiveshareAPI(data: vsls.LiveShare) {
        this.liveshareAPI = data;
    }

    public async share() {
        return this.liveshareAPI.share();
    }

}
