import { QuickPickItem } from "vscode";
import { User } from "../../model/serverModel/ServerModel";

export class UserPick implements QuickPickItem {
    constructor(
        readonly label: string,
        readonly user: User,
    ) { }
}
